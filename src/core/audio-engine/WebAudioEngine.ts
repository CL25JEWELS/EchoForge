/**
 * Web Audio API Implementation
 *
 * Platform-agnostic audio engine using Web Audio API.
 * Works in browsers and React Native with polyfills.
 */

import {
  AudioEngineConfig,
  PadConfig,
  PlaybackOptions,
  TempoConfig,
  AudioMetrics,
  NoteState,
  Sound,
  PlaybackMode
} from '../../types/audio.types';
import { IAudioEngine } from './IAudioEngine';

interface LoadedSound {
  sound: Sound;
  buffer: AudioBuffer;
}

interface ActiveVoice {
  padId: string;
  source: AudioBufferSourceNode;
  gainNode: GainNode;
  startTime: number;
  state: NoteState;
}

export class WebAudioEngine implements IAudioEngine {
  private audioContext: AudioContext | null = null;
  private masterGainNode: GainNode | null = null;
  private sounds: Map<string, LoadedSound> = new Map();
  private pads: Map<string, PadConfig> = new Map();
  private activeVoices: Map<string, ActiveVoice[]> = new Map();
  private tempoConfig: TempoConfig = {
    bpm: 120,
    timeSignature: { numerator: 4, denominator: 4 },
    quantizeGrid: 16
  };
  private clockStartTime: number = 0;
  private isClockRunning: boolean = false;
  private metrics: AudioMetrics = {
    cpuUsage: 0,
    activeVoices: 0,
    latency: 0,
    dropouts: 0
  };
  private stateChangeCallbacks: Set<(padId: string, state: NoteState) => void> = new Set();

  async initialize(engineConfig: AudioEngineConfig): Promise<void> {
    try {
      // Create audio context
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: engineConfig.sampleRate,
        latencyHint:
          engineConfig.latencyMode === 'low'
            ? 'interactive'
            : engineConfig.latencyMode === 'high-quality'
              ? 'playback'
              : 'balanced'
      });

      // Create master gain node
      this.masterGainNode = this.audioContext.createGain();
      this.masterGainNode.connect(this.audioContext.destination);
      this.masterGainNode.gain.value = 0.8;

      console.log('[AudioEngine] Initialized with sample rate:', this.audioContext.sampleRate);
      console.log('[AudioEngine] Audio context state:', this.audioContext.state);
    } catch (error) {
      console.error('[AudioEngine] Failed to initialize:', error);
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    this.stopClock();
    this.reset();

    if (this.audioContext) {
      await this.audioContext.close();
      this.audioContext = null;
    }

    this.sounds.clear();
    this.pads.clear();
    this.masterGainNode = null;
    this.stateChangeCallbacks.clear();
    console.log('[AudioEngine] Shutdown complete');
  }

  async resumeAudioContext(): Promise<void> {
    if (!this.audioContext) {
      console.warn('[AudioEngine] Cannot resume: AudioContext not initialized');
      return;
    }

    if (this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
        console.log('[AudioEngine] Audio context resumed successfully');
      } catch (error) {
        console.error('[AudioEngine] Failed to resume audio context:', error);
        throw error;
      }
    } else {
      console.log('[AudioEngine] Audio context already in state:', this.audioContext.state);
    }
  }

  isAudioContextReady(): boolean {
    if (!this.audioContext) {
      return false;
    }
    return this.audioContext.state === 'running';
  }

  async loadSound(sound: Sound): Promise<void> {
    if (!this.audioContext) {
      throw new Error('AudioEngine not initialized');
    }

    try {
      // Fetch audio data
      const response = await fetch(sound.url);
      const arrayBuffer = await response.arrayBuffer();

      // Decode audio data
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

      this.sounds.set(sound.id, {
        sound,
        buffer: audioBuffer
      });

      console.log(`[AudioEngine] Loaded sound: ${sound.name} (${sound.id})`);
    } catch (error) {
      console.error(`[AudioEngine] Failed to load sound: ${sound.id}`, error);
      throw error;
    }
  }

  async unloadSound(soundId: string): Promise<void> {
    this.sounds.delete(soundId);
    console.log(`[AudioEngine] Unloaded sound: ${soundId}`);
  }

  configurePad(padId: string, config: PadConfig): void {
    this.pads.set(padId, config);
  }

  triggerPad(padId: string, options: PlaybackOptions = {}): void {
    if (!this.audioContext || !this.masterGainNode) {
      console.error('[AudioEngine] Cannot trigger pad: AudioEngine not initialized');
      throw new Error('AudioEngine not initialized');
    }

    if (!this.isAudioContextReady()) {
      console.warn('[AudioEngine] Audio context not ready (state:', this.audioContext.state, ')');
      console.warn('[AudioEngine] Call resumeAudioContext() on user interaction first');
    }

    const padConfig = this.pads.get(padId);
    if (!padConfig || !padConfig.soundId) {
      console.warn(`[AudioEngine] Pad ${padId} has no sound configured`);
      return;
    }

    const loadedSound = this.sounds.get(padConfig.soundId);
    if (!loadedSound) {
      console.warn(`[AudioEngine] Sound ${padConfig.soundId} not loaded`);
      return;
    }

    // Calculate start time (with optional quantization)
    let startTime = this.audioContext.currentTime;
    if (options.quantize && this.isClockRunning) {
      startTime = this.getNextQuantizedTime();
    }

    // Create audio nodes
    const source = this.audioContext.createBufferSource();
    source.buffer = loadedSound.buffer;

    const gainNode = this.audioContext.createGain();
    const velocity = options.velocity ?? 1.0;
    gainNode.gain.value = padConfig.volume * velocity;

    // Apply pitch shifting
    if (padConfig.pitch !== 0) {
      source.playbackRate.value = Math.pow(2, padConfig.pitch / 12);
    }

    // Connect nodes
    source.connect(gainNode);
    gainNode.connect(this.masterGainNode);

    // Configure looping
    source.loop = padConfig.playbackMode === PlaybackMode.LOOP || options.loop || false;

    // Start playback
    source.start(startTime, options.startTime || 0, options.duration);

    // Store active voice
    const voice: ActiveVoice = {
      padId,
      source,
      gainNode,
      startTime,
      state: NoteState.PLAYING
    };

    if (!this.activeVoices.has(padId)) {
      this.activeVoices.set(padId, []);
    }
    this.activeVoices.get(padId)!.push(voice);

    // Notify listeners of state change
    this.notifyStateChange(padId, NoteState.PLAYING);

    // Cleanup when sound ends
    source.onended = () => {
      const voices = this.activeVoices.get(padId);
      if (voices) {
        const index = voices.indexOf(voice);
        if (index > -1) {
          voices.splice(index, 1);
        }
      }
      voice.state = NoteState.STOPPED;
      
      // Notify listeners if no more voices are playing
      const currentState = this.getPadState(padId);
      if (currentState === NoteState.IDLE) {
        this.notifyStateChange(padId, NoteState.IDLE);
      }
    };

    // Update metrics
    this.updateMetrics();
    
    console.log(`[AudioEngine] Triggered pad ${padId}, voices: ${this.activeVoices.get(padId)?.length}`);
  }

  stopPad(padId: string): void {
    const voices = this.activeVoices.get(padId);
    if (!voices || voices.length === 0) {
      return;
    }

    // Stop all active voices for this pad
    voices.forEach((voice) => {
      if (voice.state === NoteState.PLAYING) {
        voice.source.stop();
        voice.state = NoteState.STOPPED;
      }
    });

    this.activeVoices.set(padId, []);
    this.updateMetrics();
    
    // Notify listeners of state change
    this.notifyStateChange(padId, NoteState.IDLE);
    
    console.log(`[AudioEngine] Stopped pad ${padId}`);
  }

  getPadState(padId: string): NoteState {
    const voices = this.activeVoices.get(padId);
    if (!voices || voices.length === 0) {
      return NoteState.IDLE;
    }

    return voices.some((v) => v.state === NoteState.PLAYING) ? NoteState.PLAYING : NoteState.IDLE;
  }

  setMasterVolume(volume: number): void {
    if (this.masterGainNode) {
      this.masterGainNode.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  getMasterVolume(): number {
    return this.masterGainNode?.gain.value ?? 0.8;
  }

  setTempoConfig(config: TempoConfig): void {
    this.tempoConfig = { ...config };
  }

  getTempoConfig(): TempoConfig {
    return { ...this.tempoConfig };
  }

  startClock(): void {
    if (this.audioContext) {
      this.clockStartTime = this.audioContext.currentTime;
      this.isClockRunning = true;
      console.log('[AudioEngine] Clock started');
    }
  }

  stopClock(): void {
    this.isClockRunning = false;
    console.log('[AudioEngine] Clock stopped');
  }

  getCurrentBeat(): number {
    if (!this.audioContext || !this.isClockRunning) {
      return 0;
    }

    const elapsed = this.audioContext.currentTime - this.clockStartTime;
    const beatsPerSecond = this.tempoConfig.bpm / 60;
    return elapsed * beatsPerSecond;
  }

  getMetrics(): AudioMetrics {
    return { ...this.metrics };
  }

  setPadEnabled(padId: string, enabled: boolean): void {
    const _pad = this.pads.get(padId);
    if (_pad) {
      // Could add an 'enabled' flag to PadConfig if needed
      if (!enabled) {
        this.stopPad(padId);
      }
    }
  }

  getAllPads(): Map<string, PadConfig> {
    return new Map(this.pads);
  }

  reset(): void {
    // Stop all active voices
    this.activeVoices.forEach((_voices, padId) => {
      this.stopPad(padId);
    });
    this.activeVoices.clear();

    // Reset clock
    this.stopClock();
    this.clockStartTime = 0;

    console.log('[AudioEngine] Reset complete');
  }

  private getNextQuantizedTime(): number {
    if (!this.audioContext) {
      return 0;
    }

    const currentBeat = this.getCurrentBeat();
    const gridSize = 4 / this.tempoConfig.quantizeGrid; // Convert to beat fraction
    const nextBeat = Math.ceil(currentBeat / gridSize) * gridSize;
    const beatsPerSecond = this.tempoConfig.bpm / 60;
    const deltaBeats = nextBeat - currentBeat;
    const deltaSeconds = deltaBeats / beatsPerSecond;

    return this.audioContext.currentTime + deltaSeconds;
  }

  private updateMetrics(): void {
    let totalVoices = 0;
    this.activeVoices.forEach((voices) => {
      totalVoices += voices.filter((v) => v.state === NoteState.PLAYING).length;
    });

    this.metrics.activeVoices = totalVoices;
    this.metrics.latency = this.audioContext?.baseLatency
      ? this.audioContext.baseLatency * 1000
      : 0;
  }

  onPadStateChange(callback: (padId: string, state: NoteState) => void): void {
    this.stateChangeCallbacks.add(callback);
  }

  offPadStateChange(callback: (padId: string, state: NoteState) => void): void {
    this.stateChangeCallbacks.delete(callback);
  }

  private notifyStateChange(padId: string, state: NoteState): void {
    this.stateChangeCallbacks.forEach((callback) => {
      try {
        callback(padId, state);
      } catch (error) {
        console.error('[AudioEngine] Error in state change callback:', error);
      }
    });
  }
}
