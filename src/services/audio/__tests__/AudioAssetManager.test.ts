/**
 * AudioAssetManager Tests
 */

import { AudioAssetManager } from '../AudioAssetManager';
import { Sound, AssetLoadState, SoundCategory } from '../../../types/audio.types';

// Mock AudioContext
class MockAudioContext {
  state: 'running' | 'suspended' | 'closed' = 'running';
  sampleRate = 44100;

  async decodeAudioData(arrayBuffer: ArrayBuffer): Promise<AudioBuffer> {
    // Return a mock AudioBuffer
    return {
      length: 1024,
      duration: 1.0,
      sampleRate: 44100,
      numberOfChannels: 2,
      getChannelData: jest.fn(),
      copyFromChannel: jest.fn(),
      copyToChannel: jest.fn()
    } as unknown as AudioBuffer;
  }

  async close() {
    this.state = 'closed';
  }
}

// Mock fetch
global.fetch = jest.fn();

describe('AudioAssetManager', () => {
  let assetManager: AudioAssetManager;
  let mockAudioContext: MockAudioContext;

  const mockSound: Sound = {
    id: 'test-sound-1',
    name: 'Test Sound',
    category: SoundCategory.KICK,
    url: 'https://example.com/sound.wav',
    duration: 1.0,
    sampleRate: 44100,
    channels: 2
  };

  beforeEach(() => {
    // Reset singleton
    AudioAssetManager.resetInstance();
    assetManager = AudioAssetManager.getInstance();
    mockAudioContext = new MockAudioContext();
    assetManager.setAudioContext(mockAudioContext as unknown as AudioContext);

    // Reset fetch mock
    (global.fetch as jest.Mock).mockReset();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = AudioAssetManager.getInstance();
      const instance2 = AudioAssetManager.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should create a new instance after reset', () => {
      const instance1 = AudioAssetManager.getInstance();
      AudioAssetManager.resetInstance();
      const instance2 = AudioAssetManager.getInstance();
      expect(instance1).not.toBe(instance2);
    });
  });

  describe('Loading States', () => {
    it('should start with NOT_LOADED state', () => {
      expect(assetManager.getLoadState('non-existent')).toBe(AssetLoadState.NOT_LOADED);
    });

    it('should transition to LOADING state', async () => {
      // Mock a slow fetch
      (global.fetch as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  arrayBuffer: async () => new ArrayBuffer(1024)
                }),
              100
            );
          })
      );

      const loadPromise = assetManager.getSound(mockSound);

      // Check state is LOADING
      expect(assetManager.getLoadState(mockSound.id)).toBe(AssetLoadState.LOADING);

      await loadPromise;

      // Check state is LOADED
      expect(assetManager.getLoadState(mockSound.id)).toBe(AssetLoadState.LOADED);
    });

    it('should transition to LOADED state on success', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        arrayBuffer: async () => new ArrayBuffer(1024)
      });

      await assetManager.getSound(mockSound);

      expect(assetManager.getLoadState(mockSound.id)).toBe(AssetLoadState.LOADED);
    });

    it('should transition to ERROR state on failure', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      await expect(assetManager.getSound(mockSound)).rejects.toThrow();
      expect(assetManager.getLoadState(mockSound.id)).toBe(AssetLoadState.ERROR);
    });
  });

  describe('Caching and Deduplication', () => {
    it('should cache loaded sounds', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        arrayBuffer: async () => new ArrayBuffer(1024)
      });

      // Load the sound
      await assetManager.getSound(mockSound);

      // Second load should use cache (fetch should only be called once)
      await assetManager.getSound(mockSound);

      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should return cached buffer', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        arrayBuffer: async () => new ArrayBuffer(1024)
      });

      const buffer1 = await assetManager.getSound(mockSound);
      const buffer2 = await assetManager.getSound(mockSound);

      expect(buffer1).toBe(buffer2);
    });

    it('should deduplicate concurrent requests', async () => {
      (global.fetch as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  arrayBuffer: async () => new ArrayBuffer(1024)
                }),
              50
            );
          })
      );

      // Start multiple loads concurrently
      const [buffer1, buffer2, buffer3] = await Promise.all([
        assetManager.getSound(mockSound),
        assetManager.getSound(mockSound),
        assetManager.getSound(mockSound)
      ]);

      // Should only fetch once
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // All should return the same buffer
      expect(buffer1).toBe(buffer2);
      expect(buffer2).toBe(buffer3);
    });
  });

  describe('Error Handling and Retry', () => {
    it('should retry on error with backoff', async () => {
      let attempts = 0;
      (global.fetch as jest.Mock).mockImplementation(() => {
        attempts++;
        return Promise.resolve({
          ok: false,
          status: 500,
          statusText: 'Server Error'
        });
      });

      // First attempt should fail
      await expect(assetManager.getSound(mockSound)).rejects.toThrow();

      // Wait for retry backoff
      await new Promise((resolve) => setTimeout(resolve, 1100));

      // Second attempt should retry
      await expect(assetManager.getSound(mockSound)).rejects.toThrow();

      expect(attempts).toBeGreaterThan(1);
    });

    it('should not retry immediately within backoff window', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Server Error'
      });

      // First attempt
      await expect(assetManager.getSound(mockSound)).rejects.toThrow();

      // Immediate second attempt should throw cached error
      await expect(assetManager.getSound(mockSound)).rejects.toThrow();

      // Should only fetch once
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should collect error information', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      await expect(assetManager.getSound(mockSound)).rejects.toThrow();

      const errors = assetManager.getErrors();
      expect(errors).toHaveLength(1);
      expect(errors[0].soundId).toBe(mockSound.id);
      expect(errors[0].error).toBeDefined();
    });
  });

  describe('Cache Management', () => {
    it('should unload a sound', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        arrayBuffer: async () => new ArrayBuffer(1024)
      });

      await assetManager.getSound(mockSound);
      expect(assetManager.isLoaded(mockSound.id)).toBe(true);

      assetManager.unloadSound(mockSound.id);
      expect(assetManager.getLoadState(mockSound.id)).toBe(AssetLoadState.NOT_LOADED);
      expect(assetManager.getCachedBuffer(mockSound.id)).toBeNull();
    });

    it('should clear all cache', async () => {
      const sound2: Sound = { ...mockSound, id: 'test-sound-2' };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        arrayBuffer: async () => new ArrayBuffer(1024)
      });

      await assetManager.getSound(mockSound);
      await assetManager.getSound(sound2);

      expect(assetManager.isLoaded(mockSound.id)).toBe(true);
      expect(assetManager.isLoaded(sound2.id)).toBe(true);

      assetManager.clearCache();

      expect(assetManager.getLoadState(mockSound.id)).toBe(AssetLoadState.NOT_LOADED);
      expect(assetManager.getLoadState(sound2.id)).toBe(AssetLoadState.NOT_LOADED);
    });

    it('should provide cache statistics', async () => {
      const sound2: Sound = { ...mockSound, id: 'test-sound-2' };
      const sound3: Sound = { ...mockSound, id: 'test-sound-3' };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          arrayBuffer: async () => new ArrayBuffer(1024)
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
          statusText: 'Not Found'
        });

      // Load one successfully
      await assetManager.getSound(mockSound);

      // Load one with error
      await expect(assetManager.getSound(sound2)).rejects.toThrow();

      const stats = assetManager.getCacheStats();
      expect(stats.loaded).toBe(1);
      expect(stats.error).toBe(1);
      expect(stats.total).toBe(2);
    });
  });

  describe('Preloading', () => {
    it('should preload multiple sounds', async () => {
      const sound2: Sound = { ...mockSound, id: 'test-sound-2' };
      const sound3: Sound = { ...mockSound, id: 'test-sound-3' };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        arrayBuffer: async () => new ArrayBuffer(1024)
      });

      const results = await assetManager.preloadSounds([mockSound, sound2, sound3]);

      expect(results).toHaveLength(3);
      expect(results.every((r) => r.status === 'fulfilled')).toBe(true);
      expect(assetManager.isLoaded(mockSound.id)).toBe(true);
      expect(assetManager.isLoaded(sound2.id)).toBe(true);
      expect(assetManager.isLoaded(sound3.id)).toBe(true);
    });

    it('should handle mixed success and failure in preload', async () => {
      const sound2: Sound = { ...mockSound, id: 'test-sound-2' };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          arrayBuffer: async () => new ArrayBuffer(1024)
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
          statusText: 'Not Found'
        });

      const results = await assetManager.preloadSounds([mockSound, sound2]);

      expect(results).toHaveLength(2);
      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('rejected');
    });
  });

  describe('Load Listeners', () => {
    it('should notify listeners on state change', async () => {
      const listener = jest.fn();
      assetManager.addLoadListener(mockSound.id, listener);

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        arrayBuffer: async () => new ArrayBuffer(1024)
      });

      await assetManager.getSound(mockSound);

      expect(listener).toHaveBeenCalledWith(AssetLoadState.LOADING);
      expect(listener).toHaveBeenCalledWith(AssetLoadState.LOADED);
    });

    it('should remove listeners', async () => {
      const listener = jest.fn();
      assetManager.addLoadListener(mockSound.id, listener);
      assetManager.removeLoadListener(mockSound.id, listener);

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        arrayBuffer: async () => new ArrayBuffer(1024)
      });

      await assetManager.getSound(mockSound);

      expect(listener).not.toHaveBeenCalled();
    });
  });
});
