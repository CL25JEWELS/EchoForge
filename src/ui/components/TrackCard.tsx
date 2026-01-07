/**
 * Track Card Component
 *
 * Display a track with play button and metadata
 */

import React from 'react';
import { Track } from '../../types/social.types';

export interface TrackCardProps {
  track: Track;
  onPlay?: () => void;
  onLike?: () => void;
  onRemix?: () => void;
  onUserClick?: (userId: string) => void;
  className?: string;
}

// Custom comparison function for React.memo. It intentionally ignores the onPlay,
// onLike, and onRemix props because they are redefined on every render in the
// parent component. This prevents unnecessary re-renders of the TrackCard when
// only the callback handlers have changed.
const areEqual = (prevProps: Readonly<TrackCardProps>, nextProps: Readonly<TrackCardProps>) => {
  return (
    JSON.stringify(prevProps.track) === JSON.stringify(nextProps.track) &&
    prevProps.onUserClick === nextProps.onUserClick &&
    prevProps.className === nextProps.className
  );
};

const TrackCardComponent: React.FC<TrackCardProps> = ({
  track,
  onPlay,
  onLike,
  onRemix,
  onUserClick,
  className = ''
}) => {
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`track-card ${className}`}>
      <div className="track-card__cover">
        {track.coverImageUrl ? (
          <img src={track.coverImageUrl} alt={track.title} />
        ) : (
          <div className="track-card__cover-placeholder">🎵</div>
        )}
        {onPlay && (
          <button className="track-card__play-button" onClick={onPlay}>
            ▶
          </button>
        )}
      </div>

      <div className="track-card__content">
        <h3 className="track-card__title">{track.title}</h3>

        {track.author && (
          <div className="track-card__author" onClick={() => onUserClick?.(track.authorId)}>
            {track.author.displayName || track.author.username}
          </div>
        )}

        {track.description && <p className="track-card__description">{track.description}</p>}

        <div className="track-card__tags">
          {track.tags.map((tag) => (
            <span key={tag} className="track-card__tag">
              #{tag}
            </span>
          ))}
        </div>

        <div className="track-card__meta">
          <span>{formatDuration(track.duration)}</span>
          <span>{track.bpm} BPM</span>
          {track.key && <span>{track.key}</span>}
        </div>

        <div className="track-card__stats">
          <button className="track-card__stat" onClick={onLike}>
            ❤️ {track.stats.likes}
          </button>
          <span className="track-card__stat">💬 {track.stats.comments}</span>
          <span className="track-card__stat">🎵 {track.stats.remixes}</span>
          <span className="track-card__stat">▶️ {track.stats.plays}</span>
        </div>

        {track.isRemixable && onRemix && (
          <button className="track-card__remix-button" onClick={onRemix}>
            🔁 Remix
          </button>
        )}
      </div>
    </div>
  );
};

export const TrackCard = React.memo(TrackCardComponent, areEqual);
