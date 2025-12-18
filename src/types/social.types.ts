/**
 * Social platform types
 */

import { Project } from './project.types';

export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  website?: string;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    soundcloud?: string;
    youtube?: string;
  };
  stats: {
    followers: number;
    following: number;
    tracksCount: number;
    remixesCount: number;
    likesReceived: number;
  };
  metadata: {
    joinedAt: Date;
    lastActive: Date;
    verified?: boolean;
  };
}

export interface Track {
  id: string;
  title: string;
  description?: string;
  authorId: string;
  author?: User;
  projectId: string;
  project?: Project;
  audioUrl: string;
  coverImageUrl?: string;
  waveformData?: number[];
  duration: number; // seconds
  bpm: number;
  key?: string;
  tags: string[];
  isPublic: boolean;
  isRemixable: boolean;
  originalTrackId?: string; // if this is a remix
  remixChain?: string[]; // array of track IDs showing remix lineage
  stats: {
    plays: number;
    likes: number;
    comments: number;
    remixes: number;
    shares: number;
  };
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    publishedAt?: Date;
  };
}

export interface Comment {
  id: string;
  trackId: string;
  authorId: string;
  author?: User;
  content: string;
  timestamp?: number; // timestamp in track for time-based comments
  parentCommentId?: string; // for nested replies
  likes: number;
  metadata: {
    createdAt: Date;
    updatedAt?: Date;
    edited?: boolean;
  };
}

export interface Like {
  id: string;
  userId: string;
  trackId: string;
  createdAt: Date;
}

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: Date;
}

export interface Share {
  id: string;
  userId: string;
  trackId: string;
  platform?: string;
  createdAt: Date;
}

export interface Feed {
  id: string;
  type: FeedType;
  tracks: Track[];
  pagination?: {
    page: number;
    pageSize: number;
    totalCount: number;
    hasMore: boolean;
  };
}

export enum FeedType {
  TRENDING = 'trending',
  NEW = 'new',
  RECOMMENDED = 'recommended',
  FOLLOWING = 'following',
  REMIXES = 'remixes',
  USER_TRACKS = 'user_tracks'
}

export interface RemixMetadata {
  originalTrackId: string;
  originalAuthorId: string;
  changeDescription?: string;
  preservedElements?: string[];
  modifiedElements?: string[];
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  actorId?: string;
  actor?: User;
  trackId?: string;
  track?: Track;
  commentId?: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

export enum NotificationType {
  LIKE = 'like',
  COMMENT = 'comment',
  FOLLOW = 'follow',
  REMIX = 'remix',
  MENTION = 'mention',
  SYSTEM = 'system'
}
