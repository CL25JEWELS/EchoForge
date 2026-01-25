/**
 * Social Feed Screen
 *
 * Browse and discover tracks from the community
 */

import React, { useState, useEffect } from 'react';
import { TrackFeed } from '../components/TrackFeed';
import { LooperApp } from '../../core/LooperApp';
import { Feed, FeedType } from '../../types/social.types';

export interface SocialScreenProps {
  app: LooperApp;
  className?: string;
}

export const SocialScreen: React.FC<SocialScreenProps> = ({ app, className = '' }) => {
  const [selectedFeedType, setSelectedFeedType] = useState<FeedType>(FeedType.TRENDING);
  const [feed, setFeed] = useState<Feed | null>(null);
  const [loading, setLoading] = useState(false);
  // ⚡ Bolt: Add loadingMore state to separate pagination loading from initial feed loading
  const [loadingMore, setLoadingMore] = useState(false);

  const apiService = app.getApiService();

  useEffect(() => {
    loadFeed();
  }, [selectedFeedType]);

  const loadFeed = async () => {
    setLoading(true);
    try {
      const feedData = await apiService.getFeed(selectedFeedType, {
        page: 1,
        pageSize: 20
      });
      setFeed(feedData);
    } catch (error) {
      console.error('Failed to load feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTrackPlay = async (trackId: string) => {
    try {
      const track = await apiService.getTrack(trackId);
      const projectFile = await apiService.downloadProjectFile(trackId);

      // Load the project
      app.getProjectManager().loadProject(projectFile);

      console.log('Loaded track:', track.title);
    } catch (error) {
      console.error('Failed to load track:', error);
    }
  };

  const handleTrackLike = async (trackId: string) => {
    try {
      await apiService.likeTrack(trackId);
      // Refresh feed
      loadFeed();
    } catch (error) {
      console.error('Failed to like track:', error);
    }
  };

  const handleTrackRemix = async (trackId: string) => {
    try {
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
    } catch (error) {
      console.error('Failed to remix track:', error);
    }
  };

  const handleLoadMore = async () => {
    if (!feed?.pagination?.hasMore) {
      return;
    }

    setLoadingMore(true);
    try {
      const nextPage = (feed.pagination.page || 1) + 1;
      const moreTracks = await apiService.getFeed(selectedFeedType, {
        page: nextPage,
        pageSize: 20
      });

      // Append new tracks to existing feed
      if (feed && moreTracks) {
        setFeed({
          ...feed,
          tracks: [...feed.tracks, ...moreTracks.tracks],
          pagination: moreTracks.pagination
        });
      }
    } catch (error) {
      console.error('Failed to load more tracks:', error);
    } finally {
      setLoadingMore(false);
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
            loadingMore={loadingMore}
          />
        ) : (
          <div className="social-screen__empty">No tracks found</div>
        )}
      </main>
    </div>
  );
};
