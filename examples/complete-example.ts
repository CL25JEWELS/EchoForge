/**
 * Example: Complete usage of Looper App
 * 
 * This file demonstrates all major features of the Looper App
 */

import { LooperApp, defaultConfig } from '../src';
import { SoundCategory, PlaybackMode } from '../src/types';

async function main() {
  console.log('🎵 Looper App Example\n');

  // ===== 1. Initialize App =====
  console.log('1. Initializing app...');
  const app = new LooperApp({
    ...defaultConfig,
    audio: {
      sampleRate: 44100,
      bufferSize: 256,
      latencyMode: 'low',
      maxPolyphony: 32
    }
  });

  await app.initialize();
  console.log('✓ App initialized\n');

  // Get service instances
  const audioEngine = app.getAudioEngine();
  const projectManager = app.getProjectManager();
  const soundPackManager = app.getSoundPackManager();
  const apiService = app.getApiService();
  const storageService = app.getStorageService();

  // ===== 2. Create Project =====
  console.log('2. Creating new project...');
  const project = projectManager.createProject(
    'My First Beat',
    'A demo beat created with Looper App'
  );
  console.log(`✓ Project created: ${project.name}\n`);

  // ===== 3. Load Sound Packs =====
  console.log('3. Loading sound packs...');
  const defaultPack = soundPackManager.createDefaultPack();
  console.log(`✓ Loaded pack: ${defaultPack.name}`);
  
  // List available sounds
  const kicks = soundPackManager.getSoundsByCategory(SoundCategory.KICK);
  console.log(`✓ Found ${kicks.length} kick sounds\n`);

  // ===== 4. Configure Pads =====
  console.log('4. Configuring pads...');
  
  // Pad 0: Kick
  audioEngine.configurePad('pad-0', {
    id: 'pad-0',
    soundId: 'kick-01',
    volume: 0.9,
    pitch: 0,
    playbackMode: PlaybackMode.ONE_SHOT,
    pan: 0,
    effects: []
  });

  console.log('✓ Configured pads\n');
}

export default main;
