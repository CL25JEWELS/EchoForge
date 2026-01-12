import { WebAudioEngine } from '../core/audio-engine/WebAudioEngine';
import { NoteState, SoundLoadingState, PlaybackMode } from '../types/audio.types';

// Mock AudioContext
const mockAudioContext = {
  state: 'running',
  currentTime: 0,
  sampleRate: 44100,
  baseLatency: 0.001,
  destination: {},
  resume: jest.fn().mockResolvedValue(undefined),
  close: jest.fn().mockResolvedValue(undefined),
  createGain: jest.fn(() => ({
    gain: { value: 0.8 },
    connect: jest.fn()
  })),
  createBufferSource: jest.fn(() => ({
    buffer: null,
    loop: false,
    playbackRate: { value: 1 },
    start: jest.fn(),
    stop: jest.fn(),
    connect: jest.fn(),
    onended: null
  })),
  decodeAudioData: jest.fn().mockResolvedValue({ duration: 1.5 })
};

global.AudioContext = jest.fn(() => mockAudioContext) as any;
global.fetch = jest.fn();

describe('WebAudioEngine', () => {
  let engine: WebAudioEngine;

  beforeEach(() => {
    jest.clearAllMocks();
    engine = new WebAudioEngine();
  });

  describe('AudioContext Resume', () => {
    it('should resume suspended AudioContext', async () => {
      await engine.initialize({
        sampleRate: 44100,
        bufferSize: 512,
        latencyMode: 'balanced',
        maxPolyphony: 32
      });

      mockAudioContext.state = 'suspended';
      await engine.resumeAudioContext();

      expect(mockAudioContext.resume).toHaveBeenCalled();
    });

    it('should not resume if already running', async () => {
      await engine.initialize({
        sampleRate: 44100,
        bufferSize: 512,
        latencyMode: 'balanced',
        maxPolyphony: 32
      });

      mockAudioContext.state = 'running';
      await engine.resumeAudioContext();

      expect(mockAudioContext.resume).not.toHaveBeenCalled();
    });

    it('should throw error if not initialized', async () => {
      await expect(engine.resumeAudioContext()).rejects.toThrow('AudioEngine not initialized');
    });
  });

  describe('Event-based State Updates', () => {
    it('should register and call pad state change callbacks', async () => {
      await engine.initialize({
        sampleRate: 44100,
        bufferSize: 512,
        latencyMode: 'balanced',
        maxPolyphony: 32
      });

      const callback = jest.fn();
      engine.onPadStateChange(callback);

      // Load a sound
      (global.fetch as jest.Mock).mockResolvedValue({
        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(8))
      });

      await engine.loadSound({
        id: 'test-sound',
        name: 'Test Sound',
        category: 'kick' as any,
        url: 'http://example.com/sound.mp3',
        duration: 1.5,
        sampleRate: 44100,
        channels: 2
      });

      // Configure and trigger pad
      engine.configurePad('pad1', {
        id: 'pad1',
        soundId: 'test-sound',
        volume: 0.8,
        pitch: 0,
        playbackMode: PlaybackMode.ONE_SHOT,
        pan: 0,
        effects: []
      });

      engine.triggerPad('pad1');

      expect(callback).toHaveBeenCalledWith('pad1', NoteState.PLAYING);
    });

    it('should unregister pad state change callbacks', async () => {
      await engine.initialize({
        sampleRate: 44100,
        bufferSize: 512,
        latencyMode: 'balanced',
        maxPolyphony: 32
      });

      const callback = jest.fn();
      engine.onPadStateChange(callback);
      engine.offPadStateChange(callback);

      // Configure and trigger pad (callback should not be called)
      engine.configurePad('pad1', {
        id: 'pad1',
        soundId: null,
        volume: 0.8,
        pitch: 0,
        playbackMode: PlaybackMode.ONE_SHOT,
        pan: 0,
        effects: []
      });

      expect(callback).not.toHaveBeenCalled();
    });

    it('should emit IDLE state when pad stops', async () => {
      await engine.initialize({
        sampleRate: 44100,
        bufferSize: 512,
        latencyMode: 'balanced',
        maxPolyphony: 32
      });

      const callback = jest.fn();
      engine.onPadStateChange(callback);

      // Load a sound
      (global.fetch as jest.Mock).mockResolvedValue({
        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(8))
      });

      await engine.loadSound({
        id: 'test-sound',
        name: 'Test Sound',
        category: 'kick' as any,
        url: 'http://example.com/sound.mp3',
        duration: 1.5,
        sampleRate: 44100,
        channels: 2
      });

      engine.configurePad('pad1', {
        id: 'pad1',
        soundId: 'test-sound',
        volume: 0.8,
        pitch: 0,
        playbackMode: PlaybackMode.ONE_SHOT,
        pan: 0,
        effects: []
      });

      engine.triggerPad('pad1');
      callback.mockClear();

      engine.stopPad('pad1');

      expect(callback).toHaveBeenCalledWith('pad1', NoteState.IDLE);
    });
  });

  describe('Sound Loading States', () => {
    it('should track loading state when loading sound', async () => {
      await engine.initialize({
        sampleRate: 44100,
        bufferSize: 512,
        latencyMode: 'balanced',
        maxPolyphony: 32
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(8))
      });

      const loadPromise = engine.loadSound({
        id: 'test-sound',
        name: 'Test Sound',
        category: 'kick' as any,
        url: 'http://example.com/sound.mp3',
        duration: 1.5,
        sampleRate: 44100,
        channels: 2
      });

      // Should be in loading state during load
      const loadingState = engine.getSoundLoadingState('test-sound');
      expect(loadingState.state).toBe(SoundLoadingState.LOADING);

      await loadPromise;

      // Should be loaded after load completes
      const loadedState = engine.getSoundLoadingState('test-sound');
      expect(loadedState.state).toBe(SoundLoadingState.LOADED);
    });

    it('should track error state when loading fails', async () => {
      await engine.initialize({
        sampleRate: 44100,
        bufferSize: 512,
        latencyMode: 'balanced',
        maxPolyphony: 32
      });

      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      try {
        await engine.loadSound({
          id: 'test-sound',
          name: 'Test Sound',
          category: 'kick' as any,
          url: 'http://example.com/sound.mp3',
          duration: 1.5,
          sampleRate: 44100,
          channels: 2
        });
      } catch (err) {
        // Expected to throw
      }

      const errorState = engine.getSoundLoadingState('test-sound');
      expect(errorState.state).toBe(SoundLoadingState.ERROR);
      expect(errorState.error).toBe('Network error');
    });

    it('should return NOT_LOADED for unknown sounds', async () => {
      await engine.initialize({
        sampleRate: 44100,
        bufferSize: 512,
        latencyMode: 'balanced',
        maxPolyphony: 32
      });

      const state = engine.getSoundLoadingState('unknown-sound');
      expect(state.state).toBe(SoundLoadingState.NOT_LOADED);
    });

    it('should clear loading state when unloading sound', async () => {
      await engine.initialize({
        sampleRate: 44100,
        bufferSize: 512,
        latencyMode: 'balanced',
        maxPolyphony: 32
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(8))
      });

      await engine.loadSound({
        id: 'test-sound',
        name: 'Test Sound',
        category: 'kick' as any,
        url: 'http://example.com/sound.mp3',
        duration: 1.5,
        sampleRate: 44100,
        channels: 2
      });

      await engine.unloadSound('test-sound');

      const state = engine.getSoundLoadingState('test-sound');
      expect(state.state).toBe(SoundLoadingState.NOT_LOADED);
    });
  });
});
