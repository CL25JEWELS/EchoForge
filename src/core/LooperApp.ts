/**
 * Looper App Core
 * 
 * Main orchestrator for the looper app that coordinates
 * audio engine, project management, sound packs, and API
 */

import { IAudioEngine } from './audio-engine/IAudioEngine';
import { WebAudioEngine } from './audio-engine/WebAudioEngine';
import { ProjectManager } from './project/ProjectManager';
import { SoundPackManager } from './sound-packs/SoundPackManager';
import { ApiService, ApiConfig } from '../services/api/ApiService';
import { StorageService, StorageConfig } from '../services/storage/StorageService';
import { AudioEngineConfig } from '../types/audio.types';

export interface LooperAppConfig {
  audio: AudioEngineConfig;
  api: ApiConfig;
  storage: StorageConfig;
}

export class LooperApp {
  private audioEngine: IAudioEngine;
  private projectManager: ProjectManager;
  private soundPackManager: SoundPackManager;
  private apiService: ApiService;
  private storageService: StorageService;
  private initialized: boolean = false;

  constructor(config: LooperAppConfig) {
    // Initialize audio engine
    this.audioEngine = new WebAudioEngine();

    // Initialize managers
    this.projectManager = new ProjectManager(this.audioEngine);
    this.soundPackManager = new SoundPackManager(this.audioEngine);

    // Initialize services
    this.apiService = new ApiService(config.api);
    this.storageService = new StorageService(config.storage);

    // Store config for initialization
    this.config = config;
  }

  private config: LooperAppConfig;

  /**
   * Initialize the app
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      console.warn('[LooperApp] Already initialized');
      return;
    }

    try {
      // Initialize audio engine
      await this.audioEngine.initialize(this.config.audio);

      // Load default sound pack
      const defaultPack = this.soundPackManager.createDefaultPack();
      
      // Mark as initialized
      this.initialized = true;

      console.log('[LooperApp] Initialization complete');
    } catch (error) {
      console.error('[LooperApp] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Shutdown the app
   */
  async shutdown(): Promise<void> {
    if (!this.initialized) {
      return;
    }

    try {
      // Save current project if exists
      const project = this.projectManager.getCurrentProject();
      if (project) {
        const projectFile = this.projectManager.saveProject();
        if (projectFile) {
          await this.storageService.saveProjectLocal(project.id, projectFile);
        }
      }

      // Shutdown audio engine
      await this.audioEngine.shutdown();

      this.initialized = false;
      console.log('[LooperApp] Shutdown complete');
    } catch (error) {
      console.error('[LooperApp] Shutdown failed:', error);
      throw error;
    }
  }

  /**
   * Get audio engine instance
   */
  getAudioEngine(): IAudioEngine {
    return this.audioEngine;
  }

  /**
   * Get project manager instance
   */
  getProjectManager(): ProjectManager {
    return this.projectManager;
  }

  /**
   * Get sound pack manager instance
   */
  getSoundPackManager(): SoundPackManager {
    return this.soundPackManager;
  }

  /**
   * Get API service instance
   */
  getApiService(): ApiService {
    return this.apiService;
  }

  /**
   * Get storage service instance
   */
  getStorageService(): StorageService {
    return this.storageService;
  }

  /**
   * Check if app is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}

// Export default configuration
export const defaultConfig: LooperAppConfig = {
  audio: {
    sampleRate: 44100,
    bufferSize: 256,
    latencyMode: 'low',
    maxPolyphony: 32
  },
  api: {
    baseUrl: process.env.API_BASE_URL || 'https://api.looperapp.com',
    apiKey: process.env.API_KEY
  },
  storage: {
    storageType: 'local'
  }
};
