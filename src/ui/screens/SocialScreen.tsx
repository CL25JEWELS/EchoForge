/**
 * Social Feed Screen
 *
 * Browse and discover tracks from the community
 */

import React, { useState, useEffect } from 'react';
import { TrackFeed } from '../components/TrackFeed';
import { LooperApp } from '../../core/LooperApp';
import { Feed, FeedType } from '../../types/social.types';
import { handleAsyncErrorWithFinally, handleAsyncError } from '../../utils';

export interface SocialScreenProps {
  app: LooperApp;
  className?: string;
}

export const SocialScreen: React.FC<SocialScreenProps> = ({ app, className = '' }) => {
  const [selectedFeedType, setSelectedFeedType] = useState<FeedType>(FeedType.TRENDING);
  const [feed, setFeed] = useState<Feed | null>(null);
  const [loading, setLoading] = useState(false);

  const apiService = app.getApiService();

  useEffect(() => {
    loadFeed();
  }, [selectedFeedType]);

  const loadFeed = async () => {
    setLoading(true);
    const feedData = await handleAsyncErrorWithFinally(
      () => apiService.getFeed(selectedFeedType, {
        page: 1,
        pageSize: 20
      }),
      'Failed to load feed:',
      () => setLoading(false)
    );
    if (feedData) {
      setFeed(feedData);
    }
  };

  const handleTrackPlay = async (trackId: string) => {
    await handleAsyncError(async () => {
      const track = await apiService.getTrack(trackId);
      const projectFile = await apiService.downloadProjectFile(trackId);

      // Load the project
      app.getProjectManager().loadProject(projectFile);

      console.log('Loaded track:', track.title);
    }, 'Failed to load track:');
  };

  const handleTrackLike = async (trackId: string) => {
    await handleAsyncError(async () => {
      await apiService.likeTrack(trackId);
      // Refresh feed
      loadFeed();
    }, 'Failed to like track:');
  };

  const handleTrackRemix = async (trackId: string) => {
    await handleAsyncError(async () => {
      const track = await apiService.getTrack(trackId);
      const projectFile = await apiService.downloadProjectFile(trackId);

      // Load as new project for remixing
      const project = projectFile.project;
      project.id = `remix-${Date.now()}`;
      project.name = `${project.name} (Remix)`;

      app.getProjectManager().loadProject({
        ...projectFile,
        project
      });

      console.log('Remixing track:', track.title);
    }, 'Failed to remix track:');
  };

  const handleLoadMore = async () => {
    if (!feed?.pagination?.hasMore) {
      return;
    }

    setLoading(true);
    const moreTracks = await handleAsyncErrorWithFinally(
      async () => {
        const nextPage = (feed.pagination.page || 1) + 1;
        return await apiService.getFeed(selectedFeedType, {
          page: nextPage,
          pageSize: 20
        });
      },
      'Failed to load more tracks:',
      () => setLoading(false)
    );

    // Append new tracks to existing feed
    if (feed && moreTracks) {
      setFeed({
        ...feed,
        tracks: [...feed.tracks, ...moreTracks.tracks],
        pagination: moreTracks.pagination
      });
    }
  };

  return (
    <div className={`social-screen ${className}`}>
      <header className="social-screen__header">
        <h1>Discover</h1>
        <nav className="social-screen__nav">
          <button
            className={selectedFeedType === FeedType.TRENDING ? 'active' : ''}
            onClick={() => setSelectedFeedType(FeedType.TRENDING)}
          >
            🔥 Trending
          </button>
          <button
            className={selectedFeedType === FeedType.NEW ? 'active' : ''}
            onClick={() => setSelectedFeedType(FeedType.NEW)}
          >
            ✨ New
          </button>
          <button
            className={selectedFeedType === FeedType.RECOMMENDED ? 'active' : ''}
            onClick={() => setSelectedFeedType(FeedType.RECOMMENDED)}
          >
            💡 Recommended
          </button>
          <button
            className={selectedFeedType === FeedType.FOLLOWING ? 'active' : ''}
            onClick={() => setSelectedFeedType(FeedType.FOLLOWING)}
          >
            👥 Following
          </button>
        </nav>
      </header>

      <main className="social-screen__main">
        {loading ? (
          <div className="social-screen__loading">Loading...</div>
        ) : feed ? (
          <TrackFeed
            feed={feed}
            onTrackPlay={handleTrackPlay}
            onTrackLike={handleTrackLike}
            onTrackRemix={handleTrackRemix}
            onLoadMore={handleLoadMore}
          />
        ) : (
          <div className="social-screen__empty">No tracks found</div>
        )}
      </main>
    </div>
  );
};
