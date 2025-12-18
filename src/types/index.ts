// Core Audio Types
export interface Sound {
  id: string;
  name: string;
  url: string;
  duration: number;
  category: SoundCategory;
}

export type SoundCategory = 'drums' | 'bass' | 'melody' | 'fx' | 'vocal';

export interface SoundPack {
  id: string;
  name: string;
  description: string;
  sounds: Sound[];
  thumbnail?: string;
}

export interface PadState {
  padIndex: number;
  soundId: string | null;
  isPlaying: boolean;
  volume: number;
  color: string;
}

// Project Types
export interface Project {
  id: string;
  name: string;
  userId: string;
  pads: PadState[];
  bpm: number;
  soundPackId: string;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
}

export interface Track {
  id: string;
  projectId: string;
  userId: string;
  title: string;
  description: string;
  audioUrl: string;
  coverImageUrl?: string;
  duration: number;
  likes: number;
  plays: number;
  remixCount: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isRemix: boolean;
  originalTrackId?: string;
}

// Social Types
export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  followerCount: number;
  followingCount: number;
  createdAt: string;
}

export interface Like {
  id: string;
  userId: string;
  trackId: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  userId: string;
  trackId: string;
  content: string;
  createdAt: string;
  user?: User;
}

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
}

// Navigation Types
export type RootStackParamList = {
  Main: undefined;
  Login: undefined;
  Signup: undefined;
};

export type MainTabParamList = {
  Studio: undefined;
  Feed: undefined;
  Profile: undefined;
};

export type StudioStackParamList = {
  LoopPad: undefined;
  SoundPacks: undefined;
  ProjectList: undefined;
  ProjectDetail: { projectId: string };
};

export type FeedStackParamList = {
  Discover: undefined;
  TrackDetail: { trackId: string };
  UserProfile: { userId: string };
};
