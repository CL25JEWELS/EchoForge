/**
 * Tests for WebAudioEngine enhanced functionality
 * Tests audio context initialization, sound loading checks, and state management
 */

import { WebAudioEngine } from '../core/audio-engine/WebAudioEngine';
import { AudioEngineConfig, Sound, SoundCategory, PadConfig, PlaybackMode } from '../types/audio.types';

// Mock Web Audio API
const mockAudioContext = {
  state: 'suspended' as AudioContextState,
  sampleRate: 44100,
  baseLatency: 0.005,
  destination: {},
  currentTime: 0,
  resume: jest.fn().mockResolvedValue(undefined),
  close: jest.fn().mockResolvedValue(undefined),
  createGain: jest.fn().mockReturnValue({
    gain: { value: 0.8 },
    connect: jest.fn()
  }),
  createBufferSource: jest.fn().mockReturnValue({
    buffer: null,
    loop: false,
    playbackRate: { value: 1 },
    start: jest.fn(),
    stop: jest.fn(),
    connect: jest.fn(),
    onended: null
  }),
  decodeAudioData: jest.fn().mockResolvedValue({
    length: 44100,
    numberOfChannels: 2,
    sampleRate: 44100
  })
};

(global as any).AudioContext = jest.fn().mockImplementation(() => mockAudioContext);
(global as any).window = { AudioContext: (global as any).AudioContext };

// Mock fetch for sound loading
(global as any).fetch = jest.fn().mockResolvedValue({
  arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(8))
});

describe('WebAudioEngine - Enhanced Functionality', () => {
  let engine: WebAudioEngine;
  let config: AudioEngineConfig;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockAudioContext.state = 'suspended';
    
    engine = new WebAudioEngine();
    config = {
      sampleRate: 44100,
      bufferSize: 256,
      latencyMode: 'low',
      maxPolyphony: 32
    };
    
    await engine.initialize(config);
  });

  afterEach(async () => {
    if (engine) {
      await engine.shutdown();
    }
  });

  describe('Audio Context State Management', () => {
    it('should return suspended state initially', () => {
      const state = engine.getAudioContextState();
      expect(state).toBe('suspended');
    });

    it('should resume audio context when resumeAudioContext is called', async () => {
      await engine.resumeAudioContext();
      expect(mockAudioContext.resume).toHaveBeenCalled();
    });

    it('should return running state after resume', async () => {
      mockAudioContext.state = 'running';
      await engine.resumeAudioContext();
      const state = engine.getAudioContextState();
      expect(state).toBe('running');
    });

    it('should handle resume when already running', async () => {
      mockAudioContext.state = 'running';
      await engine.resumeAudioContext();
      // Should not call resume again
      expect(mockAudioContext.resume).not.toHaveBeenCalled();
    });
  });

  describe('Sound Loading Checks', () => {
    const mockSound: Sound = {
      id: 'test-sound-1',
      name: 'Test Kick',
      category: SoundCategory.KICK,
      url: 'https://example.com/kick.wav',
      duration: 1.0,
      sampleRate: 44100,
      channels: 2
    };

    it('should return false for unloaded sound', () => {
      const isLoaded = engine.isSoundLoaded(mockSound.id);
      expect(isLoaded).toBe(false);
    });

    it('should return true for loaded sound', async () => {
      await engine.loadSound(mockSound);
      const isLoaded = engine.isSoundLoaded(mockSound.id);
      expect(isLoaded).toBe(true);
    });

    it('should return false after sound is unloaded', async () => {
      await engine.loadSound(mockSound);
      await engine.unloadSound(mockSound.id);
      const isLoaded = engine.isSoundLoaded(mockSound.id);
      expect(isLoaded).toBe(false);
    });
  });

  describe('Pad Triggering with Audio Context State', () => {
    const mockSound: Sound = {
      id: 'test-sound-2',
      name: 'Test Snare',
      category: SoundCategory.SNARE,
      url: 'https://example.com/snare.wav',
      duration: 0.5,
      sampleRate: 44100,
      channels: 2
    };

    const mockPad: PadConfig = {
      id: 'pad-1',
      soundId: mockSound.id,
      volume: 0.8,
      pitch: 0,
      playbackMode: PlaybackMode.ONE_SHOT,
      pan: 0,
      effects: []
    };

    beforeEach(async () => {
      await engine.loadSound(mockSound);
      engine.configurePad(mockPad.id, mockPad);
    });

    it('should not trigger pad when audio context is suspended', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      mockAudioContext.state = 'suspended';
      
      engine.triggerPad(mockPad.id);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Audio context is suspended')
      );
      consoleSpy.mockRestore();
    });

    it('should trigger pad when audio context is running', () => {
      mockAudioContext.state = 'running';
      
      engine.triggerPad(mockPad.id);
      
      expect(mockAudioContext.createBufferSource).toHaveBeenCalled();
    });

    it('should not trigger pad if sound is not loaded', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      mockAudioContext.state = 'running';
      
      const padWithoutSound: PadConfig = {
        ...mockPad,
        id: 'pad-2',
        soundId: 'non-existent-sound'
      };
      engine.configurePad(padWithoutSound.id, padWithoutSound);
      
      engine.triggerPad(padWithoutSound.id);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Sound non-existent-sound not loaded')
      );
      consoleSpy.mockRestore();
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete workflow: initialize -> load sound -> trigger pad', async () => {
      const sound: Sound = {
        id: 'integration-sound',
        name: 'Integration Test',
        category: SoundCategory.FX,
        url: 'https://example.com/fx.wav',
        duration: 2.0,
        sampleRate: 44100,
        channels: 2
      };

      const pad: PadConfig = {
        id: 'integration-pad',
        soundId: sound.id,
        volume: 1.0,
        pitch: 0,
        playbackMode: PlaybackMode.ONE_SHOT,
        pan: 0,
        effects: []
      };

      // Load sound
      await engine.loadSound(sound);
      expect(engine.isSoundLoaded(sound.id)).toBe(true);

      // Configure pad
      engine.configurePad(pad.id, pad);

      // Resume audio context
      mockAudioContext.state = 'running';
      await engine.resumeAudioContext();

      // Trigger pad
      engine.triggerPad(pad.id);

      expect(mockAudioContext.createBufferSource).toHaveBeenCalled();
    });
  });
});
