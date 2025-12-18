/**
 * User Profile Component
 * 
 * Display user profile with tracks and stats
 */

import React from 'react';
import { User, Track } from '../../types/social.types';

export interface UserProfileProps {
  user: User;
  tracks?: Track[];
  isOwnProfile?: boolean;
  isFollowing?: boolean;
  onFollow?: () => void;
  onUnfollow?: () => void;
  onEditProfile?: () => void;
  onTrackClick?: (trackId: string) => void;
  className?: string;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  user,
  tracks = [],
  isOwnProfile = false,
  isFollowing = false,
  onFollow,
  onUnfollow,
  onEditProfile,
  onTrackClick,
  className = ''
}) => {
  return (
    <div className={`user-profile ${className}`}>
      <div className="user-profile__header">
        <div className="user-profile__avatar">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.displayName} />
          ) : (
            <div className="user-profile__avatar-placeholder">
              {user.displayName?.[0] || user.username[0]}
            </div>
          )}
          {user.metadata.verified && (
            <span className="user-profile__verified">✓</span>
          )}
        </div>

        <div className="user-profile__info">
          <h1 className="user-profile__name">{user.displayName || user.username}</h1>
          <p className="user-profile__username">@{user.username}</p>
          
          {user.bio && (
            <p className="user-profile__bio">{user.bio}</p>
          )}

          <div className="user-profile__stats">
            <span>
              <strong>{user.stats.tracksCount}</strong> Tracks
            </span>
            <span>
              <strong>{user.stats.remixesCount}</strong> Remixes
            </span>
            <span>
              <strong>{user.stats.followers}</strong> Followers
            </span>
            <span>
              <strong>{user.stats.following}</strong> Following
            </span>
          </div>

          <div className="user-profile__actions">
            {isOwnProfile ? (
              <button onClick={onEditProfile}>Edit Profile</button>
            ) : (
              <button onClick={isFollowing ? onUnfollow : onFollow}>
                {isFollowing ? 'Unfollow' : 'Follow'}
              </button>
            )}
          </div>
        </div>
      </div>

      {user.socialLinks && (
        <div className="user-profile__social-links">
          {user.socialLinks.instagram && (
            <a href={user.socialLinks.instagram} target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
          )}
          {user.socialLinks.twitter && (
            <a href={user.socialLinks.twitter} target="_blank" rel="noopener noreferrer">
              Twitter
            </a>
          )}
          {user.socialLinks.soundcloud && (
            <a href={user.socialLinks.soundcloud} target="_blank" rel="noopener noreferrer">
              SoundCloud
            </a>
          )}
        </div>
      )}

      <div className="user-profile__tracks">
        <h2>Tracks</h2>
        <div className="user-profile__tracks-grid">
          {tracks.map(track => (
            <div
              key={track.id}
              className="user-profile__track"
              onClick={() => onTrackClick?.(track.id)}
            >
              <div className="user-profile__track-cover">
                {track.coverImageUrl ? (
                  <img src={track.coverImageUrl} alt={track.title} />
                ) : (
                  <div className="user-profile__track-placeholder">🎵</div>
                )}
              </div>
              <div className="user-profile__track-info">
                <h3>{track.title}</h3>
                <p>❤️ {track.stats.likes} · 💬 {track.stats.comments}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
