/**
 * Audio Engine Interface
 *
 * Core abstraction for real-time audio processing.
 * Implementations can target different platforms (Web Audio API, native, etc.)
 */

import {
  AudioEngineConfig,
  PadConfig,
  PlaybackOptions,
  TempoConfig,
  AudioMetrics,
  NoteState,
  Sound,
  SoundLoadingInfo
} from '../../types/audio.types';

/**
 * Callback for pad state changes
 */
export type PadStateChangeCallback = (padId: string, state: NoteState) => void;

export interface IAudioEngine {
  /**
   * Initialize the audio engine
   */
  initialize(config: AudioEngineConfig): Promise<void>;

  /**
   * Shutdown and cleanup resources
   */
  shutdown(): Promise<void>;

  /**
   * Load a sound into memory
   */
  loadSound(sound: Sound): Promise<void>;

  /**
   * Unload a sound from memory
   */
  unloadSound(soundId: string): Promise<void>;

  /**
   * Configure a pad
   */
  configurePad(padId: string, config: PadConfig): void;

  /**
   * Trigger a pad (start playing)
   */
  triggerPad(padId: string, options?: PlaybackOptions): void;

  /**
   * Stop a pad
   */
  stopPad(padId: string): void;

  /**
   * Get the current state of a pad
   */
  getPadState(padId: string): NoteState;

  /**
   * Set master volume
   */
  setMasterVolume(volume: number): void;

  /**
   * Get master volume
   */
  getMasterVolume(): number;

  /**
   * Configure tempo and timing
   */
  setTempoConfig(config: TempoConfig): void;

  /**
   * Get current tempo configuration
   */
  getTempoConfig(): TempoConfig;

  /**
   * Start the metronome/clock
   */
  startClock(): void;

  /**
   * Stop the metronome/clock
   */
  stopClock(): void;

  /**
   * Get current beat position
   */
  getCurrentBeat(): number;

  /**
   * Get performance metrics
   */
  getMetrics(): AudioMetrics;

  /**
   * Enable/disable a specific pad
   */
  setPadEnabled(padId: string, enabled: boolean): void;

  /**
   * Get all configured pads
   */
  getAllPads(): Map<string, PadConfig>;

  /**
   * Reset the engine (stop all pads, reset clock)
   */
  reset(): void;

  /**
   * Resume the AudioContext (required for browser autoplay policies)
   */
  resumeAudioContext(): Promise<void>;

  /**
   * Register a callback for pad state changes
   */
  onPadStateChange(callback: PadStateChangeCallback): void;

  /**
   * Remove a pad state change callback
   */
  offPadStateChange(callback: PadStateChangeCallback): void;

  /**
   * Get loading state for a sound
   */
  getSoundLoadingState(soundId: string): SoundLoadingInfo;
}
