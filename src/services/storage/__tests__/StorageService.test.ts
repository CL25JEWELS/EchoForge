import { StorageService, StorageConfig } from '../StorageService';
import { ProjectFile } from '../../../types/project.types';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import { createClient } from '@supabase/supabase-js';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Mock the cloud providers
jest.mock('firebase/app');
jest.mock('firebase/storage');
jest.mock('@supabase/supabase-js');
jest.mock('@aws-sdk/client-s3');
jest.mock('@aws-sdk/s3-request-presigner');

describe('StorageService', () => {
  const mockProjectFile: ProjectFile = {
    project: {
      id: 'p1',
      name: 'Test Project',
      version: '1.0.0',
      tempo: { bpm: 120 },
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

  const projectId = 'p1';
  const projectData = JSON.stringify(mockProjectFile);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveProjectCloud', () => {
    it('should throw error if storageType is not cloud', async () => {
      const config: StorageConfig = { storageType: 'local' };
      const service = new StorageService(config);

      await expect(service.saveProjectCloud(projectId, mockProjectFile)).rejects.toThrow(
        'Storage service is not configured for cloud storage'
      );
    });

    it('should throw error for unsupported provider', async () => {
      const config: StorageConfig = {
        storageType: 'cloud',
        // @ts-expect-error - testing invalid provider
        cloudProvider: 'unknown'
      };
      const service = new StorageService(config);

      await expect(service.saveProjectCloud(projectId, mockProjectFile)).rejects.toThrow(
        'Unsupported cloud provider: unknown'
      );
    });

    describe('Firebase', () => {
      it('should save to Firebase (init app)', async () => {
        const config: StorageConfig = {
          storageType: 'cloud',
          cloudProvider: 'firebase',
          credentials: {
            apiKey: 'key',
            authDomain: 'domain',
            projectId: 'pid',
            storageBucket: 'bucket',
            messagingSenderId: 'id',
            appId: 'appid'
          }
        };

        const mockRef = {};
        (getApps as jest.Mock).mockReturnValue([]);
        (getStorage as jest.Mock).mockReturnValue({});
        (ref as jest.Mock).mockReturnValue(mockRef);
        (uploadString as jest.Mock).mockResolvedValue(undefined);
        (getDownloadURL as jest.Mock).mockResolvedValue('https://firebase.storage/url');

        const service = new StorageService(config);
        const url = await service.saveProjectCloud(projectId, mockProjectFile);

        expect(getApps).toHaveBeenCalled();
        expect(initializeApp).toHaveBeenCalledWith(config.credentials);
        expect(getStorage).toHaveBeenCalled();
        expect(ref).toHaveBeenCalledWith(expect.anything(), `projects/${projectId}.json`);
        expect(uploadString).toHaveBeenCalledWith(mockRef, projectData);
        expect(getDownloadURL).toHaveBeenCalledWith(mockRef);
        expect(url).toBe('https://firebase.storage/url');
      });

      it('should save to Firebase (existing app)', async () => {
        const config: StorageConfig = {
          storageType: 'cloud',
          cloudProvider: 'firebase',
          credentials: {
            apiKey: 'key',
            authDomain: 'domain',
            projectId: 'pid',
            storageBucket: 'bucket',
            messagingSenderId: 'id',
            appId: 'appid'
          }
        };

        const mockRef = {};
        (getApps as jest.Mock).mockReturnValue([{}]); // Mock existing app
        (getApp as jest.Mock).mockReturnValue({});
        (getStorage as jest.Mock).mockReturnValue({});
        (ref as jest.Mock).mockReturnValue(mockRef);
        (uploadString as jest.Mock).mockResolvedValue(undefined);
        (getDownloadURL as jest.Mock).mockResolvedValue('https://firebase.storage/url');

        const service = new StorageService(config);
        const url = await service.saveProjectCloud(projectId, mockProjectFile);

        expect(getApps).toHaveBeenCalled();
        expect(initializeApp).not.toHaveBeenCalled(); // Should not init again
        expect(getApp).toHaveBeenCalled();
        expect(getStorage).toHaveBeenCalled();
        expect(url).toBe('https://firebase.storage/url');
      });

      it('should throw if credentials missing', async () => {
        const config: StorageConfig = {
          storageType: 'cloud',
          cloudProvider: 'firebase'
        };
        const service = new StorageService(config);

        await expect(service.saveProjectCloud(projectId, mockProjectFile)).rejects.toThrow(
          'Firebase credentials missing'
        );
      });

      it('should throw if individual credential fields are missing', async () => {
        // Create a config with an empty appId field to test validation
        const credentials = {
          apiKey: 'key',
          authDomain: 'domain',
          projectId: 'pid',
          storageBucket: 'bucket',
          messagingSenderId: 'id',
          appId: ''
        };
        const config: StorageConfig = {
          storageType: 'cloud',
          cloudProvider: 'firebase',
          credentials: credentials as any
        };
        const service = new StorageService(config);

        await expect(service.saveProjectCloud(projectId, mockProjectFile)).rejects.toThrow(
          'Firebase credential "appId" is missing or empty'
        );
      });

      it('should handle Firebase upload errors', async () => {
        const config: StorageConfig = {
          storageType: 'cloud',
          cloudProvider: 'firebase',
          credentials: {
            apiKey: 'key',
            authDomain: 'domain',
            projectId: 'pid',
            storageBucket: 'bucket',
            messagingSenderId: 'id',
            appId: 'appid'
          }
        };

        const mockRef = {};
        (getApps as jest.Mock).mockReturnValue([]);
        (getStorage as jest.Mock).mockReturnValue({});
        (ref as jest.Mock).mockReturnValue(mockRef);
        (uploadString as jest.Mock).mockRejectedValue(new Error('Upload failed'));

        const service = new StorageService(config);

        await expect(service.saveProjectCloud(projectId, mockProjectFile)).rejects.toThrow(
          'Upload failed'
        );
      });
    });

    describe('Supabase', () => {
      it('should save to Supabase', async () => {
        const config: StorageConfig = {
          storageType: 'cloud',
          cloudProvider: 'supabase',
          credentials: {
            url: 'https://supabase.co',
            key: 'key'
          }
        };

        const mockUpload = jest.fn().mockResolvedValue({ data: {}, error: null });
        const mockGetPublicUrl = jest
          .fn()
          .mockReturnValue({ data: { publicUrl: 'https://supabase.co/url' } });
        const mockFrom = jest.fn().mockReturnValue({
          upload: mockUpload,
          getPublicUrl: mockGetPublicUrl
        });
        const mockClient = { storage: { from: mockFrom } };

        (createClient as jest.Mock).mockReturnValue(mockClient);

        const service = new StorageService(config);
        const url = await service.saveProjectCloud(projectId, mockProjectFile);

        expect(createClient).toHaveBeenCalledWith(config.credentials.url, config.credentials.key);
        expect(mockFrom).toHaveBeenCalledWith('projects');
        expect(mockUpload).toHaveBeenCalledWith(
          `${projectId}.json`,
          projectData,
          expect.objectContaining({
            contentType: 'application/json',
            upsert: true
          })
        );
        expect(url).toBe('https://supabase.co/url');
      });

      it('should throw if credentials missing', async () => {
        const config: StorageConfig = {
          storageType: 'cloud',
          cloudProvider: 'supabase'
        };
        const service = new StorageService(config);

        await expect(service.saveProjectCloud(projectId, mockProjectFile)).rejects.toThrow(
          'Supabase credentials missing'
        );
      });

      it('should throw if url is missing or empty', async () => {
        const credentials = {
          url: '',
          key: 'test-key'
        };
        const config: StorageConfig = {
          storageType: 'cloud',
          cloudProvider: 'supabase',
          credentials: credentials as any
        };
        const service = new StorageService(config);

        await expect(service.saveProjectCloud(projectId, mockProjectFile)).rejects.toThrow(
          'Supabase credential "url" is missing or empty'
        );
      });

      it('should handle Supabase upload errors', async () => {
        const config: StorageConfig = {
          storageType: 'cloud',
          cloudProvider: 'supabase',
          credentials: {
            url: 'https://supabase.co',
            key: 'key'
          }
        };

        const mockUpload = jest
          .fn()
          .mockResolvedValue({ data: null, error: { message: 'Upload failed' } });
        const mockFrom = jest.fn().mockReturnValue({
          upload: mockUpload
        });
        const mockClient = { storage: { from: mockFrom } };

        (createClient as jest.Mock).mockReturnValue(mockClient);

        const service = new StorageService(config);

        await expect(service.saveProjectCloud(projectId, mockProjectFile)).rejects.toThrow(
          'Supabase upload failed: Upload failed'
        );
      });
    });

    describe('AWS', () => {
      it('should save to AWS', async () => {
        const config: StorageConfig = {
          storageType: 'cloud',
          cloudProvider: 'aws',
          credentials: {
            accessKeyId: 'key',
            secretAccessKey: 'secret',
            region: 'us-east-1',
            bucketName: 'my-bucket'
          }
        };

        const mockSend = jest.fn().mockResolvedValue({});

        (S3Client as unknown as jest.Mock).mockImplementation(() => ({
          send: mockSend
        }));
        (getSignedUrl as jest.Mock).mockResolvedValue('https://signed.url');

        const service = new StorageService(config);
        const url = await service.saveProjectCloud(projectId, mockProjectFile);

        expect(S3Client).toHaveBeenCalledWith({
          region: 'us-east-1',
          credentials: {
            accessKeyId: 'key',
            secretAccessKey: 'secret'
          }
        });
        expect(PutObjectCommand).toHaveBeenCalledWith({
          Bucket: 'my-bucket',
          Key: `projects/${projectId}.json`,
          Body: projectData,
          ContentType: 'application/json'
        });
        expect(GetObjectCommand).toHaveBeenCalledWith({
          Bucket: 'my-bucket',
          Key: `projects/${projectId}.json`
        });
        expect(getSignedUrl).toHaveBeenCalled();
        expect(mockSend).toHaveBeenCalled();
        expect(url).toBe('https://signed.url');
      });

      it('should throw if credentials missing', async () => {
        const config: StorageConfig = {
          storageType: 'cloud',
          cloudProvider: 'aws'
        };
        const service = new StorageService(config);

        await expect(service.saveProjectCloud(projectId, mockProjectFile)).rejects.toThrow(
          'AWS credentials missing'
        );
      });

      it('should throw if individual credential fields are missing', async () => {
        const credentials = {
          accessKeyId: 'key',
          secretAccessKey: 'secret',
          region: '',
          bucketName: 'my-bucket'
        };
        const config: StorageConfig = {
          storageType: 'cloud',
          cloudProvider: 'aws',
          credentials: credentials as any
        };
        const service = new StorageService(config);

        await expect(service.saveProjectCloud(projectId, mockProjectFile)).rejects.toThrow(
          'AWS credential "region" is missing or empty'
        );
      });

      it('should handle AWS upload errors', async () => {
        const config: StorageConfig = {
          storageType: 'cloud',
          cloudProvider: 'aws',
          credentials: {
            accessKeyId: 'key',
            secretAccessKey: 'secret',
            region: 'us-east-1',
            bucketName: 'my-bucket'
          }
        };

        const mockSend = jest.fn().mockRejectedValue(new Error('S3 upload failed'));

        (S3Client as unknown as jest.Mock).mockImplementation(() => ({
          send: mockSend
        }));

        const service = new StorageService(config);

        await expect(service.saveProjectCloud(projectId, mockProjectFile)).rejects.toThrow(
          'S3 upload failed'
        );
      });

      it('should use custom signedUrlExpiresIn when provided', async () => {
        const config: StorageConfig = {
          storageType: 'cloud',
          cloudProvider: 'aws',
          credentials: {
            accessKeyId: 'key',
            secretAccessKey: 'secret',
            region: 'us-east-1',
            bucketName: 'my-bucket'
          },
          signedUrlExpiresIn: 7200 // 2 hours
        };

        const mockSend = jest.fn().mockResolvedValue({});

        (S3Client as unknown as jest.Mock).mockImplementation(() => ({
          send: mockSend
        }));
        (getSignedUrl as jest.Mock).mockResolvedValue('https://signed.url');

        const service = new StorageService(config);
        await service.saveProjectCloud(projectId, mockProjectFile);

        expect(getSignedUrl).toHaveBeenCalledWith(
          expect.anything(),
          expect.anything(),
          { expiresIn: 7200 }
        );
      });
    });
  });
});
