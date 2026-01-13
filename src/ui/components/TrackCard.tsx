/**
 * Track Card Component
 *
 * Display a track with play button and metadata
 */

import React from 'react';
import { Track } from '../../types/social.types';

export interface TrackCardProps {
  track: Track;
  onPlay?: (trackId: string) => void;
  onLike?: (trackId: string) => void;
  onRemix?: (trackId: string) => void;
  onUserClick?: (userId: string) => void;
  className?: string;
}

// ⚡ Bolt: Wrapped in React.memo to prevent unnecessary re-renders.
// TrackFeed renders a list of these. By using memo and passing stable callbacks
// (which accept trackId instead of being inline arrow functions), we avoid re-rendering
// every card when the parent re-renders, unless the specific track data changes.
export const TrackCard: React.FC<TrackCardProps> = React.memo(
  ({ track, onPlay, onLike, onRemix, onUserClick, className = '' }) => {
    const formatDuration = (seconds: number): string => {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handlePlay = () => onPlay?.(track.id);
    const handleLike = () => onLike?.(track.id);
    const handleRemix = () => onRemix?.(track.id);
    const handleUserClick = () => track.authorId && onUserClick?.(track.authorId);

    return (
      <div className={`track-card ${className}`}>
        <div className="track-card__cover">
          {track.coverImageUrl ? (
            <img src={track.coverImageUrl} alt={track.title} />
          ) : (
            <div className="track-card__cover-placeholder">🎵</div>
          )}
          {onPlay && (
            <button className="track-card__play-button" onClick={handlePlay}>
              ▶
            </button>
          )}
        </div>

        <div className="track-card__content">
          <h3 className="track-card__title">{track.title}</h3>

          {track.author && (
            <div className="track-card__author" onClick={handleUserClick}>
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
            <button className="track-card__stat" onClick={handleLike}>
              ❤️ {track.stats.likes}
            </button>
            <span className="track-card__stat">💬 {track.stats.comments}</span>
            <span className="track-card__stat">🎵 {track.stats.remixes}</span>
            <span className="track-card__stat">▶️ {track.stats.plays}</span>
          </div>

          {track.isRemixable && onRemix && (
            <button className="track-card__remix-button" onClick={handleRemix}>
              🔁 Remix
            </button>
          )}
        </div>
      </div>
    );
  }
);

TrackCard.displayName = 'TrackCard';
