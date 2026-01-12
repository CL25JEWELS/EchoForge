/**
 * Tests for pad synchronization features in WebAudioEngine
 */

import { WebAudioEngine } from '../core/audio-engine/WebAudioEngine';
import { AudioEngineConfig, NoteState, PadConfig, PlaybackMode, Sound, SoundCategory } from '../types/audio.types';

// Mock AudioContext
const mockAudioContext = {
  state: 'suspended' as AudioContextState,
  sampleRate: 44100,
  currentTime: 0,
  baseLatency: 0.01,
  destination: {},
  createGain: jest.fn().mockReturnValue({
    gain: { value: 0.8 },
    connect: jest.fn()
  }),
  createBufferSource: jest.fn().mockReturnValue({
    buffer: null,
    playbackRate: { value: 1 },
    loop: false,
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    onended: null
  }),
  decodeAudioData: jest.fn().mockResolvedValue({
    duration: 1.0,
    numberOfChannels: 2,
    sampleRate: 44100
  }),
  resume: jest.fn().mockImplementation(function(this: any) {
    this.state = 'running';
    return Promise.resolve();
  }),
  close: jest.fn().mockResolvedValue(undefined)
};

// Mock window.AudioContext
(global as any).window = {
  AudioContext: jest.fn().mockImplementation(() => mockAudioContext)
};

// Mock fetch for loading sounds
global.fetch = jest.fn().mockResolvedValue({
  arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(1024))
}) as any;

describe('WebAudioEngine - Pad Synchronization', () => {
  let engine: WebAudioEngine;
  let config: AudioEngineConfig;
  let testSound: Sound;
  let testPadConfig: PadConfig;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockAudioContext.state = 'suspended';
    
    engine = new WebAudioEngine();
    config = {
      sampleRate: 44100,
      bufferSize: 512,
      latencyMode: 'balanced',
      maxPolyphony: 32
    };

    testSound = {
      id: 'test-sound-1',
      name: 'Test Sound',
      category: SoundCategory.KICK,
      url: 'https://example.com/test.wav',
      duration: 1.0,
      sampleRate: 44100,
      channels: 2
    };

    testPadConfig = {
      id: 'pad-1',
      soundId: 'test-sound-1',
      volume: 1.0,
      pitch: 0,
      playbackMode: PlaybackMode.ONE_SHOT,
      pan: 0,
      effects: []
    };

    await engine.initialize(config);
  });

  afterEach(async () => {
    await engine.shutdown();
  });

  describe('resumeAudioContext', () => {
    it('should resume suspended audio context', async () => {
      expect(mockAudioContext.state).toBe('suspended');
      await engine.resumeAudioContext();
      expect(mockAudioContext.resume).toHaveBeenCalled();
      expect(mockAudioContext.state).toBe('running');
    });

    it('should not fail if audio context is already running', async () => {
      mockAudioContext.state = 'running';
      await expect(engine.resumeAudioContext()).resolves.not.toThrow();
    });
  });

  describe('isAudioContextReady', () => {
    it('should return false when audio context is suspended', () => {
      mockAudioContext.state = 'suspended';
      expect(engine.isAudioContextReady()).toBe(false);
    });

    it('should return true when audio context is running', async () => {
      await engine.resumeAudioContext();
      expect(engine.isAudioContextReady()).toBe(true);
    });
  });

  describe('onPadStateChange', () => {
    it('should register state change callbacks', async () => {
      const callback = jest.fn();
      engine.onPadStateChange(callback);

      await engine.loadSound(testSound);
      engine.configurePad(testPadConfig.id, testPadConfig);
      engine.triggerPad(testPadConfig.id);

      expect(callback).toHaveBeenCalledWith(testPadConfig.id, NoteState.PLAYING);
    });

    it('should notify multiple callbacks', async () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      
      engine.onPadStateChange(callback1);
      engine.onPadStateChange(callback2);

      await engine.loadSound(testSound);
      engine.configurePad(testPadConfig.id, testPadConfig);
      engine.triggerPad(testPadConfig.id);

      expect(callback1).toHaveBeenCalledWith(testPadConfig.id, NoteState.PLAYING);
      expect(callback2).toHaveBeenCalledWith(testPadConfig.id, NoteState.PLAYING);
    });

    it('should notify on pad stop', async () => {
      const callback = jest.fn();
      engine.onPadStateChange(callback);

      await engine.loadSound(testSound);
      engine.configurePad(testPadConfig.id, testPadConfig);
      engine.triggerPad(testPadConfig.id);
      engine.stopPad(testPadConfig.id);

      expect(callback).toHaveBeenCalledWith(testPadConfig.id, NoteState.IDLE);
    });
  });

  describe('offPadStateChange', () => {
    it('should unregister state change callbacks', async () => {
      const callback = jest.fn();
      engine.onPadStateChange(callback);
      engine.offPadStateChange(callback);

      await engine.loadSound(testSound);
      engine.configurePad(testPadConfig.id, testPadConfig);
      engine.triggerPad(testPadConfig.id);

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle callback errors gracefully', async () => {
      const errorCallback = jest.fn().mockImplementation(() => {
        throw new Error('Callback error');
      });
      const goodCallback = jest.fn();

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      engine.onPadStateChange(errorCallback);
      engine.onPadStateChange(goodCallback);

      await engine.loadSound(testSound);
      engine.configurePad(testPadConfig.id, testPadConfig);
      engine.triggerPad(testPadConfig.id);

      expect(errorCallback).toHaveBeenCalled();
      expect(goodCallback).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });
});
