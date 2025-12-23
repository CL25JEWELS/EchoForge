import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';
import { supabase } from './supabase';

export interface RecordingOptions {
  quality: number;
  extension: string;
}

class RecordingService {
  private recording: Audio.Recording | null = null;
  private isRecording = false;

  async startRecording(): Promise<void> {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync({
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
      });

      await recording.startAsync();
      this.recording = recording;
      this.isRecording = true;
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  }

  async stopRecording(): Promise<string | null> {
    try {
      if (!this.recording) return null;

      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      this.recording = null;
      this.isRecording = false;

      return uri;
    } catch (error) {
      console.error('Failed to stop recording:', error);
      throw error;
    }
  }

  async exportProject(projectId: string, audioUri: string): Promise<string> {
    try {
      // Read the audio file
      const audioData = await FileSystem.readAsStringAsync(audioUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Generate a unique filename
      const filename = `track_${projectId}_${Date.now()}.m4a`;
      
      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('tracks')
        .upload(filename, decode(audioData), {
          contentType: 'audio/m4a',
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('tracks')
        .getPublicUrl(filename);

      return publicUrl;
    } catch (error) {
      console.error('Failed to export project:', error);
      throw error;
    }
  }

  getRecordingStatus(): boolean {
    return this.isRecording;
  }
}

// Helper function to decode base64
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export const recordingService = new RecordingService();
