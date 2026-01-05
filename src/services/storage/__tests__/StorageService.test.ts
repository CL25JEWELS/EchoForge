import { StorageService, StorageConfig } from '../StorageService';
import { ProjectFile } from '../../../types/project.types';

// Mock dependencies
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn()
}));

jest.mock('firebase/storage', () => ({
  getStorage: jest.fn(),
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn(),
  getBytes: jest.fn()
}));

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn()
}));

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({
    send: jest.fn()
  })),
  PutObjectCommand: jest.fn(),
  GetObjectCommand: jest.fn()
}));

// Imports for mocking
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL, getBytes } from 'firebase/storage';
import { createClient } from '@supabase/supabase-js';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

describe('StorageService', () => {
  const mockProjectFile: ProjectFile = {
    project: {
      id: 'test-project-123',
      name: 'Test Project',
      version: '1.0.0',
      tempo: { bpm: 120, timeSignature: [4, 4] },
      pads: [],
      masterVolume: 1.0,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date()
      }
    },
    soundPackReferences: [],
    version: '1.0.0'
  };

  const projectJson = JSON.stringify(mockProjectFile);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Firebase', () => {
    const firebaseConfig: StorageConfig = {
      storageType: 'cloud',
      cloudProvider: 'firebase',
      credentials: {
        apiKey: 'test-api-key'
      }
    };

    test('initializes Firebase correctly', () => {
      new StorageService(firebaseConfig);
      expect(initializeApp).toHaveBeenCalledWith(firebaseConfig.credentials);
      expect(getStorage).toHaveBeenCalled();
    });

    test('saveProjectCloud uploads file to Firebase', async () => {
      (getStorage as jest.Mock).mockReturnValue({});
      (ref as jest.Mock).mockReturnValue({});
      (uploadBytes as jest.Mock).mockResolvedValue({});
      (getDownloadURL as jest.Mock).mockResolvedValue('https://example.com/project.json');

      const service = new StorageService(firebaseConfig);
      const url = await service.saveProjectCloud('test-project-123', mockProjectFile);

      expect(ref).toHaveBeenCalledWith(expect.anything(), 'projects/test-project-123.json');
      expect(uploadBytes).toHaveBeenCalled();
      expect(url).toBe('https://example.com/project.json');
    });

    test('loadProjectCloud downloads file from Firebase', async () => {
      (getStorage as jest.Mock).mockReturnValue({});
      (ref as jest.Mock).mockReturnValue({});

      const encoder = new TextEncoder();
      const arrayBuffer = encoder.encode(projectJson).buffer;
      (getBytes as jest.Mock).mockResolvedValue(arrayBuffer);

      const service = new StorageService(firebaseConfig);
      const result = await service.loadProjectCloud('test-project-123');

      expect(ref).toHaveBeenCalledWith(expect.anything(), 'projects/test-project-123.json');
      expect(getBytes).toHaveBeenCalled();
      expect(result).toEqual(mockProjectFile);
    });
  });

  describe('Supabase', () => {
    const supabaseConfig: StorageConfig = {
      storageType: 'cloud',
      cloudProvider: 'supabase',
      credentials: {
        url: 'https://test.supabase.co',
        key: 'test-key'
      }
    };

    const mockSupabaseClient = {
      storage: {
        from: jest.fn().mockReturnValue({
          upload: jest
            .fn()
            .mockResolvedValue({ data: { path: 'projects/test-project-123.json' }, error: null }),
          download: jest.fn().mockResolvedValue({
            data: {
              text: () => Promise.resolve(projectJson)
            },
            error: null
          })
        })
      }
    };

    beforeEach(() => {
      (createClient as jest.Mock).mockReturnValue(mockSupabaseClient);
    });

    test('initializes Supabase correctly', () => {
      new StorageService(supabaseConfig);
      expect(createClient).toHaveBeenCalledWith(
        supabaseConfig.credentials?.url,
        supabaseConfig.credentials?.key
      );
    });

    test('saveProjectCloud uploads file to Supabase', async () => {
      const service = new StorageService(supabaseConfig);
      const path = await service.saveProjectCloud('test-project-123', mockProjectFile);

      expect(mockSupabaseClient.storage.from).toHaveBeenCalledWith('projects');
      expect(path).toBe('projects/test-project-123.json');
    });

    test('loadProjectCloud downloads file from Supabase', async () => {
      const service = new StorageService(supabaseConfig);
      const result = await service.loadProjectCloud('test-project-123');

      expect(mockSupabaseClient.storage.from).toHaveBeenCalledWith('projects');
      expect(result).toEqual(mockProjectFile);
    });
  });

  describe('AWS S3', () => {
    const awsConfig: StorageConfig = {
      storageType: 'cloud',
      cloudProvider: 'aws',
      credentials: {
        region: 'us-east-1',
        accessKeyId: 'test-id',
        secretAccessKey: 'test-secret',
        bucketName: 'test-bucket'
      }
    };

    const mockSend = jest.fn();

    beforeEach(() => {
      (S3Client as jest.Mock).mockImplementation(() => ({
        send: mockSend
      }));
    });

    test('initializes AWS S3 correctly', () => {
      new StorageService(awsConfig);
      expect(S3Client).toHaveBeenCalledWith({
        region: 'us-east-1',
        credentials: {
          accessKeyId: 'test-id',
          secretAccessKey: 'test-secret'
        }
      });
    });

    test('saveProjectCloud uploads file to S3', async () => {
      mockSend.mockResolvedValue({});

      const service = new StorageService(awsConfig);
      const result = await service.saveProjectCloud('test-project-123', mockProjectFile);

      expect(PutObjectCommand).toHaveBeenCalledWith(
        expect.objectContaining({
          Bucket: 'test-bucket',
          Key: 'projects/test-project-123.json'
        })
      );
      expect(mockSend).toHaveBeenCalled();
      expect(result).toBe('s3://test-bucket/projects/test-project-123.json');
    });

    test('loadProjectCloud downloads file from S3', async () => {
      mockSend.mockResolvedValue({
        Body: {
          transformToString: () => Promise.resolve(projectJson)
        }
      });

      const service = new StorageService(awsConfig);
      const result = await service.loadProjectCloud('test-project-123');

      expect(GetObjectCommand).toHaveBeenCalledWith({
        Bucket: 'test-bucket',
        Key: 'projects/test-project-123.json'
      });
      expect(mockSend).toHaveBeenCalled();
      expect(result).toEqual(mockProjectFile);
    });
  });

  describe('Error Handling', () => {
    test('throws error if cloud storage not enabled', async () => {
      const config: StorageConfig = { storageType: 'local' };
      const service = new StorageService(config);
      await expect(service.loadProjectCloud('id')).rejects.toThrow('Cloud storage not enabled');
    });

    test('throws error if provider not configured', async () => {
      const config: StorageConfig = { storageType: 'cloud', credentials: {} };
      const service = new StorageService(config);
      await expect(service.loadProjectCloud('id')).rejects.toThrow('Cloud provider not configured');
    });
  });
});
