/**
 * Track Feed Component
 *
 * Display a feed of tracks
 */

import React, { useCallback } from 'react';
import { TrackCard } from './TrackCard';
import { Feed, FeedType } from '../../types/social.types';

export interface TrackFeedProps {
  feed: Feed;
  onTrackPlay?: (trackId: string) => void;
  onTrackLike?: (trackId: string) => void;
  onTrackRemix?: (trackId: string) => void;
  onUserClick?: (userId: string) => void;
  onLoadMore?: () => void;
  className?: string;
}

export const TrackFeed: React.FC<TrackFeedProps> = ({
  feed,
  onTrackPlay,
  onTrackLike,
  onTrackRemix,
  onUserClick,
  onLoadMore,
  className = ''
}) => {
  const getFeedTitle = (type: FeedType): string => {
    switch (type) {
      case FeedType.TRENDING:
        return '🔥 Trending';
      case FeedType.NEW:
        return '✨ New Releases';
      case FeedType.RECOMMENDED:
        return '💡 Recommended';
      case FeedType.FOLLOWING:
        return '👥 Following';
      case FeedType.REMIXES:
        return '🔁 Remixes';
      default:
        return 'Tracks';
    }
  };

  // ⚡ Bolt: Memoize event handlers with useCallback to prevent re-creating functions on every render.
  // This is crucial for React.memo to work effectively on child components like TrackCard.
  const handlePlay = useCallback((trackId: string) => onTrackPlay?.(trackId), [onTrackPlay]);
  const handleLike = useCallback((trackId: string) => onTrackLike?.(trackId), [onTrackLike]);
  const handleRemix = useCallback((trackId: string) => onTrackRemix?.(trackId), [onTrackRemix]);

  return (
    <div className={`track-feed ${className}`}>
      <div className="track-feed__header">
        <h2>{getFeedTitle(feed.type)}</h2>
      </div>

      <div className="track-feed__grid">
        {feed.tracks.map((track) => (
          <TrackCard
            key={track.id}
            track={track}
            onPlay={handlePlay}
            onLike={handleLike}
            onRemix={handleRemix}
            onUserClick={onUserClick}
          />
        ))}
      </div>

      {feed.pagination?.hasMore && onLoadMore && (
        <button className="track-feed__load-more" onClick={onLoadMore}>
          Load More
        </button>
      )}
    </div>
  );
};
