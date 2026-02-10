/**
 * Sound Pack Manager
 *
 * Handles loading, caching, and managing sound packs
 */

import { SoundPack, SoundPackManifest, SoundPackFilter } from '../../types/soundpack.types';
import { Sound, SoundCategory } from '../../types/audio.types';
import { IAudioEngine } from '../audio-engine/IAudioEngine';

export class SoundPackManager {
  private loadedPacks: Map<string, SoundPack> = new Map();
  private audioEngine: IAudioEngine;

  constructor(audioEngine: IAudioEngine) {
    this.audioEngine = audioEngine;
  }

  /**
   * Load a sound pack from a URL or local path
   */
  async loadSoundPack(packUrl: string): Promise<SoundPack> {
    try {
      // Fetch the manifest
      const response = await fetch(`${packUrl}/manifest.json`);
      const manifest: SoundPackManifest = await response.json();

      // Build full sound pack
      const sounds: Sound[] = manifest.sounds.map((ref) => ({
        id: ref.id,
        name: ref.name,
        category: ref.category,
        url: `${packUrl}/${ref.filename}`,
        duration: 0, // Will be determined after loading
        sampleRate: 44100, // Default
        channels: 2, // Default
        metadata: ref.metadata
      }));

      const soundPack: SoundPack = {
        id: manifest.id,
        name: manifest.name,
        version: manifest.version,
        description: '',
        author: '',
        sounds,
        categories: this.extractCategories(sounds),
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date()
        }
      };

      // Cache the pack
      this.loadedPacks.set(soundPack.id, soundPack);

      console.log(`[SoundPackManager] Loaded pack: ${soundPack.name} with ${sounds.length} sounds`);
      return soundPack;
    } catch (error) {
      console.error(`[SoundPackManager] Failed to load pack from ${packUrl}`, error);
      throw error;
    }
  }

  /**
   * Preload all sounds in a pack into the audio engine
   */
  async preloadPackSounds(packId: string): Promise<void> {
    const pack = this.loadedPacks.get(packId);
    if (!pack) {
      throw new Error(`Sound pack ${packId} not loaded`);
    }

    console.log(`[SoundPackManager] Preloading ${pack.sounds.length} sounds from pack: ${pack.name}`);

    const results = await Promise.allSettled(
      pack.sounds.map((sound) => this.audioEngine.loadSound(sound))
    );

    // Count failures and log details
    const failures = results.filter((r) => r.status === 'rejected');
    if (failures.length > 0) {
      console.warn(
        `[SoundPackManager] Failed to load ${failures.length} sounds from pack: ${pack.name}`
      );
      failures.forEach((failure, index) => {
        if (failure.status === 'rejected') {
          console.error(`[SoundPackManager]   Sound ${index}:`, failure.reason);
        }
      });
    }

    const successCount = results.length - failures.length;
    console.log(
      `[SoundPackManager] Preloaded ${successCount}/${pack.sounds.length} sounds from pack: ${pack.name}`
    );
  }

  /**
   * Unload a sound pack
   */
  async unloadSoundPack(packId: string): Promise<void> {
    const pack = this.loadedPacks.get(packId);
    if (!pack) {
      return;
    }

    // Unload all sounds from audio engine
    const unloadPromises = pack.sounds.map((sound) => this.audioEngine.unloadSound(sound.id));

    await Promise.all(unloadPromises);
    this.loadedPacks.delete(packId);

    console.log(`[SoundPackManager] Unloaded pack: ${pack.name}`);
  }

  /**
   * Get a specific sound pack
   */
  getSoundPack(packId: string): SoundPack | undefined {
    return this.loadedPacks.get(packId);
  }

  /**
   * Get all loaded sound packs
   */
  getAllSoundPacks(): SoundPack[] {
    return Array.from(this.loadedPacks.values());
  }

  /**
   * Search for sounds across all loaded packs
   */
  searchSounds(filter: SoundPackFilter): Sound[] {
    const allSounds: Sound[] = [];

    this.loadedPacks.forEach((pack) => {
      let sounds = pack.sounds;

      // Filter by category
      if (filter.category) {
        sounds = sounds.filter((s) => s.category === filter.category);
      }

      // Filter by search query
      if (filter.searchQuery) {
        const query = filter.searchQuery.toLowerCase();
        sounds = sounds.filter(
          (s) =>
            s.name.toLowerCase().includes(query) ||
            s.metadata?.tags?.some((tag) => tag.toLowerCase().includes(query))
        );
      }

      // Filter by tags
      if (filter.tags && filter.tags.length > 0) {
        sounds = sounds.filter((s) => s.metadata?.tags?.some((tag) => filter.tags!.includes(tag)));
      }

      allSounds.push(...sounds);
    });

    return allSounds;
  }

  /**
   * Get sounds by category
   */
  getSoundsByCategory(category: SoundCategory): Sound[] {
    return this.searchSounds({ category });
  }

  /**
   * Get a specific sound by ID
   */
  getSound(soundId: string): Sound | undefined {
    for (const pack of this.loadedPacks.values()) {
      const sound = pack.sounds.find((s) => s.id === soundId);
      if (sound) {
        return sound;
      }
    }
    return undefined;
  }

  /**
   * Create a default/starter sound pack
   */
  createDefaultPack(): SoundPack {
    const defaultPack: SoundPack = {
      id: 'default-pack',
      name: 'Starter Pack',
      description: 'Basic sounds to get started',
      version: '1.0.0',
      author: 'Looper App',
      sounds: this.generateDefaultSounds(),
      categories: [
        SoundCategory.KICK,
        SoundCategory.SNARE,
        SoundCategory.HIHAT,
        SoundCategory.BASS,
        SoundCategory.MELODY
      ],
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date()
      },
      pricing: {
        isFree: true
      }
    };

    this.loadedPacks.set(defaultPack.id, defaultPack);
    return defaultPack;
  }

  private extractCategories(sounds: Sound[]): SoundCategory[] {
    const categories = new Set<SoundCategory>();
    sounds.forEach((sound) => categories.add(sound.category));
    return Array.from(categories);
  }

  private generateDefaultSounds(): Sound[] {
    // In a real app, these would point to actual audio files
    return [
      {
        id: 'kick-01',
        name: 'Kick 1',
        category: SoundCategory.KICK,
        url: '/sounds/kick-01.wav',
        duration: 0.5,
        sampleRate: 44100,
        channels: 2
      },
      {
        id: 'snare-01',
        name: 'Snare 1',
        category: SoundCategory.SNARE,
        url: '/sounds/snare-01.wav',
        duration: 0.3,
        sampleRate: 44100,
        channels: 2
      },
      {
        id: 'hihat-01',
        name: 'Hi-Hat 1',
        category: SoundCategory.HIHAT,
        url: '/sounds/hihat-01.wav',
        duration: 0.2,
        sampleRate: 44100,
        channels: 2
      }
    ];
  }
}
