/**
 * Project and track types
 */

import { PadConfig, TempoConfig } from './audio.types';

export interface Project {
  id: string;
  name: string;
  description?: string;
  version: string; // for backward compatibility
  tempo: TempoConfig;
  pads: PadConfig[];
  arrangement?: Arrangement;
  masterVolume: number;
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    author?: string;
    tags?: string[];
    duration?: number; // seconds
  };
}

export interface Arrangement {
  scenes: Scene[];
  timeline: TimelineEvent[];
}

export interface Scene {
  id: string;
  name: string;
  activePads: string[]; // pad IDs
  duration?: number;
}

export interface TimelineEvent {
  id: string;
  type: 'scene' | 'automation';
  timestamp: number; // beats or seconds
  data: unknown;
}

export interface ExportOptions {
  format: 'wav' | 'mp3' | 'ogg';
  quality: 'low' | 'medium' | 'high' | 'lossless';
  sampleRate?: number;
  bitrate?: number;
  includeMetadata?: boolean;
}

export interface ProjectFile {
  project: Project;
  soundPackReferences: string[]; // IDs of required sound packs
  version: string; // app version
}
