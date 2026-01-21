/**
 * Sound pack system types
 */

import { Sound, SoundCategory } from './audio.types';

export interface SoundPack {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  coverImageUrl?: string;
  sounds: Sound[];
  categories: SoundCategory[];
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    downloadCount?: number;
    rating?: number;
    tags?: string[];
  };
  pricing?: {
    isFree: boolean;
    price?: number;
    currency?: string;
  };
}

export interface SoundPackManifest {
  id: string;
  name: string;
  version: string;
  sounds: SoundReference[];
}

export interface SoundReference {
  id: string;
  name: string;
  category: SoundCategory;
  filename: string;
  metadata?: Record<string, unknown>;
}

export interface SoundPackFilter {
  category?: SoundCategory;
  searchQuery?: string;
  tags?: string[];
  author?: string;
  isFree?: boolean;
}
