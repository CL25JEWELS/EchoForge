import { LooperApp, defaultConfig } from '../core/LooperApp';

// Mock dependencies
jest.mock('../core/audio-engine/WebAudioEngine', () => {
  return {
    WebAudioEngine: jest.fn().mockImplementation(() => ({
      initialize: jest.fn().mockResolvedValue(undefined),
      shutdown: jest.fn().mockResolvedValue(undefined)
    }))
  };
});

jest.mock('../core/project/ProjectManager');
jest.mock('../core/sound-packs/SoundPackManager', () => {
  return {
    SoundPackManager: jest.fn().mockImplementation(() => ({
      createDefaultPack: jest.fn()
    }))
  };
});
jest.mock('../services/api/ApiService');
jest.mock('../services/storage/StorageService');

describe('LooperApp', () => {
  let app: LooperApp;

  beforeEach(() => {
    jest.clearAllMocks();
    app = new LooperApp(defaultConfig);
  });

  it('should initialize correctly', async () => {
    await app.initialize();
    expect(app.isInitialized()).toBe(true);
  });

  it('should not initialize twice', async () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    await app.initialize();
    await app.initialize();
    expect(consoleSpy).toHaveBeenCalledWith('[LooperApp] Already initialized');
    consoleSpy.mockRestore();
  });

  it('should shutdown correctly', async () => {
    await app.initialize();
    await app.shutdown();
    expect(app.isInitialized()).toBe(false);
  });
});
