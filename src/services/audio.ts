import { Audio, AVPlaybackStatus } from 'expo-av';
import { Sound } from '../types';

class AudioService {
  private sounds: Map<string, Audio.Sound> = new Map();
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      throw error;
    }
  }

  async loadSound(soundId: string, uri: string): Promise<Audio.Sound> {
    try {
      // Check if sound is already loaded
      if (this.sounds.has(soundId)) {
        return this.sounds.get(soundId)!;
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: false, isLooping: false },
        this.onPlaybackStatusUpdate
      );

      this.sounds.set(soundId, sound);
      return sound;
    } catch (error) {
      console.error(`Failed to load sound ${soundId}:`, error);
      throw error;
    }
  }

  async playSound(soundId: string) {
    try {
      const sound = this.sounds.get(soundId);
      if (!sound) {
        console.error(`Sound ${soundId} not loaded`);
        return;
      }

      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        // If already playing, restart from beginning
        await sound.setPositionAsync(0);
        await sound.playAsync();
      }
    } catch (error) {
      console.error(`Failed to play sound ${soundId}:`, error);
    }
  }

  async stopSound(soundId: string) {
    try {
      const sound = this.sounds.get(soundId);
      if (!sound) return;

      const status = await sound.getStatusAsync();
      if (status.isLoaded && status.isPlaying) {
        await sound.stopAsync();
        await sound.setPositionAsync(0);
      }
    } catch (error) {
      console.error(`Failed to stop sound ${soundId}:`, error);
    }
  }

  async setVolume(soundId: string, volume: number) {
    try {
      const sound = this.sounds.get(soundId);
      if (!sound) return;

      await sound.setVolumeAsync(Math.max(0, Math.min(1, volume)));
    } catch (error) {
      console.error(`Failed to set volume for ${soundId}:`, error);
    }
  }

  async unloadSound(soundId: string) {
    try {
      const sound = this.sounds.get(soundId);
      if (sound) {
        await sound.unloadAsync();
        this.sounds.delete(soundId);
      }
    } catch (error) {
      console.error(`Failed to unload sound ${soundId}:`, error);
    }
  }

  async unloadAllSounds() {
    try {
      const promises = Array.from(this.sounds.keys()).map(id => this.unloadSound(id));
      await Promise.all(promises);
      this.sounds.clear();
    } catch (error) {
      console.error('Failed to unload all sounds:', error);
    }
  }

  private onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      // Handle playback status updates if needed
      if (status.didJustFinish) {
        // Sound finished playing
      }
    }
  };

  getLoadedSounds(): string[] {
    return Array.from(this.sounds.keys());
  }
}

// Export singleton instance
export const audioService = new AudioService();
