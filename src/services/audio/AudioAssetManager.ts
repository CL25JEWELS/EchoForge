/**
 * Audio Asset Manager
 *
 * Centralized service for managing audio asset loading, caching, and state tracking.
 * Implements singleton pattern to prevent duplicate network requests and ensure
 * efficient resource management.
 */

import { Sound, AssetLoadState, AssetLoadError } from '../../types/audio.types';

interface AssetCacheEntry {
  sound: Sound;
  buffer: AudioBuffer | null;
  state: AssetLoadState;
  loadPromise: Promise<AudioBuffer> | null;
  error: Error | null;
  retryCount: number;
  lastAttempt: number;
}

export interface AudioAssetManagerConfig {
  maxRetries?: number;
  retryDelay?: number;
  cacheSize?: number;
}

export class AudioAssetManager {
  private static instance: AudioAssetManager | null = null;
  private audioContext: AudioContext | null = null;
  private assetCache: Map<string, AssetCacheEntry> = new Map();
  private config: Required<AudioAssetManagerConfig>;
  private loadListeners: Map<string, Set<(state: AssetLoadState) => void>> = new Map();

  private constructor(config: AudioAssetManagerConfig = {}) {
    this.config = {
      maxRetries: config.maxRetries ?? 3,
      retryDelay: config.retryDelay ?? 1000,
      cacheSize: config.cacheSize ?? 100
    };
  }

  /**
   * Get singleton instance
   */
  public static getInstance(config?: AudioAssetManagerConfig): AudioAssetManager {
    if (!AudioAssetManager.instance) {
      AudioAssetManager.instance = new AudioAssetManager(config);
    }
    return AudioAssetManager.instance;
  }

  /**
   * Reset singleton instance (useful for testing)
   */
  public static resetInstance(): void {
    AudioAssetManager.instance = null;
  }

  /**
   * Set the audio context to use for decoding
   */
  public setAudioContext(context: AudioContext): void {
    this.audioContext = context;
  }

  /**
   * Get the current audio context
   */
  public getAudioContext(): AudioContext | null {
    return this.audioContext;
  }

  /**
   * Get or load a sound by ID
   * Returns a promise that resolves to the audio buffer
   * Deduplicates requests - multiple calls with the same ID will share the same loading promise
   */
  public async getSound(sound: Sound): Promise<AudioBuffer> {
    const { id } = sound;

    // Check if already in cache
    const cached = this.assetCache.get(id);
    if (cached) {
      // Return buffer if loaded
      if (cached.state === AssetLoadState.LOADED && cached.buffer) {
        return cached.buffer;
      }

      // Return existing load promise if loading
      if (cached.state === AssetLoadState.LOADING && cached.loadPromise) {
        return cached.loadPromise;
      }

      // Retry if error (with backoff)
      if (cached.state === AssetLoadState.ERROR) {
        if (cached.retryCount < this.config.maxRetries) {
          const timeSinceLastAttempt = Date.now() - cached.lastAttempt;
          const backoffDelay = this.config.retryDelay * Math.pow(2, cached.retryCount);

          if (timeSinceLastAttempt < backoffDelay) {
            throw cached.error || new Error(`Failed to load sound ${id}`);
          }
          // Proceed to retry
        } else {
          throw (
            cached.error ||
            new Error(`Failed to load sound ${id} after ${this.config.maxRetries} retries`)
          );
        }
      }
    }

    // Start loading
    return this.loadSound(sound);
  }

  /**
   * Load a sound and cache it
   */
  private async loadSound(sound: Sound): Promise<AudioBuffer> {
    const { id, url } = sound;

    if (!this.audioContext) {
      throw new Error('AudioContext not initialized. Call setAudioContext() first.');
    }

    // Create cache entry or update existing
    const existingEntry = this.assetCache.get(id);
    const retryCount =
      existingEntry?.state === AssetLoadState.ERROR ? existingEntry.retryCount + 1 : 0;

    // Create loading promise
    const loadPromise = this._performLoad(sound, retryCount);

    // Update cache entry
    const cacheEntry: AssetCacheEntry = {
      sound,
      buffer: null,
      state: AssetLoadState.LOADING,
      loadPromise,
      error: null,
      retryCount,
      lastAttempt: Date.now()
    };

    this.assetCache.set(id, cacheEntry);
    this.notifyListeners(id, AssetLoadState.LOADING);

    try {
      const buffer = await loadPromise;

      // Update cache with loaded buffer
      cacheEntry.buffer = buffer;
      cacheEntry.state = AssetLoadState.LOADED;
      cacheEntry.loadPromise = null;
      cacheEntry.error = null;

      this.notifyListeners(id, AssetLoadState.LOADED);

      console.log(`[AudioAssetManager] Successfully loaded: ${sound.name} (${id})`);
      return buffer;
    } catch (error) {
      // Update cache with error
      const err = error instanceof Error ? error : new Error(String(error));
      cacheEntry.state = AssetLoadState.ERROR;
      cacheEntry.error = err;
      cacheEntry.loadPromise = null;

      this.notifyListeners(id, AssetLoadState.ERROR);

      console.error(`[AudioAssetManager] Failed to load: ${sound.name} (${id})`, err);
      throw err;
    }
  }

  /**
   * Perform the actual loading operation
   */
  private async _performLoad(sound: Sound, retryCount: number): Promise<AudioBuffer> {
    try {
      // Fetch audio data
      const response = await fetch(sound.url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();

      // Decode audio data
      if (!this.audioContext) {
        throw new Error('AudioContext not available');
      }

      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      return audioBuffer;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error(
        `[AudioAssetManager] Load attempt ${retryCount + 1} failed for ${sound.id}:`,
        err.message
      );
      throw err;
    }
  }

  /**
   * Get the loading state of a sound
   */
  public getLoadState(soundId: string): AssetLoadState {
    const cached = this.assetCache.get(soundId);
    return cached?.state ?? AssetLoadState.NOT_LOADED;
  }

  /**
   * Check if a sound is loaded
   */
  public isLoaded(soundId: string): boolean {
    return this.getLoadState(soundId) === AssetLoadState.LOADED;
  }

  /**
   * Get cached buffer if available
   */
  public getCachedBuffer(soundId: string): AudioBuffer | null {
    const cached = this.assetCache.get(soundId);
    return cached?.buffer ?? null;
  }

  /**
   * Preload multiple sounds in parallel
   */
  public async preloadSounds(sounds: Sound[]): Promise<PromiseSettledResult<AudioBuffer>[]> {
    const loadPromises = sounds.map((sound) => this.getSound(sound));
    return Promise.allSettled(loadPromises);
  }

  /**
   * Unload a sound from cache
   */
  public unloadSound(soundId: string): void {
    this.assetCache.delete(soundId);
    this.notifyListeners(soundId, AssetLoadState.NOT_LOADED);
    console.log(`[AudioAssetManager] Unloaded: ${soundId}`);
  }

  /**
   * Clear all cached sounds
   */
  public clearCache(): void {
    const soundIds = Array.from(this.assetCache.keys());
    this.assetCache.clear();
    soundIds.forEach((id) => this.notifyListeners(id, AssetLoadState.NOT_LOADED));
    console.log('[AudioAssetManager] Cache cleared');
  }

  /**
   * Get all errors from failed loads
   */
  public getErrors(): AssetLoadError[] {
    const errors: AssetLoadError[] = [];
    this.assetCache.forEach((entry, soundId) => {
      if (entry.state === AssetLoadState.ERROR && entry.error) {
        errors.push({
          soundId,
          error: entry.error,
          timestamp: entry.lastAttempt,
          retryCount: entry.retryCount
        });
      }
    });
    return errors;
  }

  /**
   * Get cache statistics
   */
  public getCacheStats(): {
    total: number;
    loaded: number;
    loading: number;
    error: number;
    notLoaded: number;
  } {
    const stats = {
      total: this.assetCache.size,
      loaded: 0,
      loading: 0,
      error: 0,
      notLoaded: 0
    };

    this.assetCache.forEach((entry) => {
      switch (entry.state) {
        case AssetLoadState.LOADED:
          stats.loaded++;
          break;
        case AssetLoadState.LOADING:
          stats.loading++;
          break;
        case AssetLoadState.ERROR:
          stats.error++;
          break;
        case AssetLoadState.NOT_LOADED:
          stats.notLoaded++;
          break;
      }
    });

    return stats;
  }

  /**
   * Add a listener for load state changes
   */
  public addLoadListener(soundId: string, listener: (state: AssetLoadState) => void): void {
    if (!this.loadListeners.has(soundId)) {
      this.loadListeners.set(soundId, new Set());
    }
    this.loadListeners.get(soundId)!.add(listener);
  }

  /**
   * Remove a listener
   */
  public removeLoadListener(soundId: string, listener: (state: AssetLoadState) => void): void {
    const listeners = this.loadListeners.get(soundId);
    if (listeners) {
      listeners.delete(listener);
      if (listeners.size === 0) {
        this.loadListeners.delete(soundId);
      }
    }
  }

  /**
   * Notify all listeners of a state change
   */
  private notifyListeners(soundId: string, state: AssetLoadState): void {
    const listeners = this.loadListeners.get(soundId);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(state);
        } catch (error) {
          console.error('[AudioAssetManager] Error in load listener:', error);
        }
      });
    }
  }
}
