/**
 * Core audio types for the looper app
 */

export enum SoundCategory {
  KICK = 'kick',
  SNARE = 'snare',
  HIHAT = 'hihat',
  PERCUSSION = 'percussion',
  FULL_BEAT = 'full_beat',
  BASS_808 = 'bass_808',
  BASS = 'bass',
  PLUCK = 'pluck',
  MELODY = 'melody',
  VOCAL = 'vocal',
  FX = 'fx',
  PAD = 'pad',
  OTHER = 'other'
}

export enum PlaybackMode {
  ONE_SHOT = 'one_shot',
  LOOP = 'loop',
  SUSTAINED = 'sustained'
}

export enum NoteState {
  IDLE = 'idle',
  PLAYING = 'playing',
  STOPPED = 'stopped'
}

export interface Sound {
  id: string;
  name: string;
  category: SoundCategory;
  url: string;
  duration: number;
  sampleRate: number;
  channels: number;
  metadata?: {
    bpm?: number;
    key?: string;
    tags?: string[];
    author?: string;
  };
}

export interface PadConfig {
  id: string;
  soundId: string | null;
  volume: number; // 0-1
  pitch: number; // -12 to +12 semitones
  playbackMode: PlaybackMode;
  filterFrequency?: number; // Hz
  filterResonance?: number; // 0-1
  pan: number; // -1 (left) to 1 (right)
  effects: EffectConfig[];
}

export interface EffectConfig {
  id: string;
  type: EffectType;
  enabled: boolean;
  parameters: Record<string, number>;
}

export enum EffectType {
  REVERB = 'reverb',
  DELAY = 'delay',
  DISTORTION = 'distortion',
  CHORUS = 'chorus',
  FILTER = 'filter',
  COMPRESSOR = 'compressor',
  EQ = 'eq'
}

export interface AudioEngineConfig {
  sampleRate: number;
  bufferSize: number;
  latencyMode: 'low' | 'balanced' | 'high-quality';
  maxPolyphony: number;
}

export interface PlaybackOptions {
  velocity?: number; // 0-1
  startTime?: number; // seconds
  duration?: number; // seconds for one-shots
  loop?: boolean;
  quantize?: boolean;
}

export interface TempoConfig {
  bpm: number;
  timeSignature: {
    numerator: number;
    denominator: number;
  };
  quantizeGrid: number; // 16th notes, 8th notes, etc.
}

export interface AudioMetrics {
  cpuUsage: number;
  activeVoices: number;
  latency: number; // ms
  dropouts: number;
}
