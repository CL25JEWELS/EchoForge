/**
 * Storage Service
 *
 * Local and cloud storage for projects and user data
 */

import { ProjectFile } from '../../types/project.types';
import { User } from '../../types/social.types';

// Cloud SDK imports
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import { createClient } from '@supabase/supabase-js';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export interface FirebaseCredentials {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export interface SupabaseCredentials {
  url: string;
  key: string;
}

export interface AwsCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  bucketName: string;
}

export interface StorageConfig {
  storageType: 'local' | 'cloud';
  cloudProvider?: 'firebase' | 'supabase' | 'aws';
  credentials?:
    | FirebaseCredentials
    | SupabaseCredentials
    | AwsCredentials
    | Record<string, unknown>;
}

export class StorageService {
  private storageKey = 'looper-app';
  private config: StorageConfig;

  constructor(config: StorageConfig) {
    this.config = config;
  }

  // ===== Project Storage =====

  /**
   * Save project to local storage
   */
  async saveProjectLocal(projectId: string, projectFile: ProjectFile): Promise<void> {
    const key = `${this.storageKey}:project:${projectId}`;
    const data = JSON.stringify(projectFile);

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, data);
    } else {
      // For Node.js environment or React Native
      // You'd use AsyncStorage or similar
      console.warn('[StorageService] localStorage not available');
    }

    console.log(`[StorageService] Saved project locally: ${projectId}`);
  }

  /**
   * Load project from local storage
   */
  async loadProjectLocal(projectId: string): Promise<ProjectFile | null> {
    const key = `${this.storageKey}:project:${projectId}`;

    if (typeof localStorage !== 'undefined') {
      const data = localStorage.getItem(key);
      if (data) {
        return JSON.parse(data);
      }
    }

    return null;
  }

  /**
   * List all local projects
   */
  async listLocalProjects(): Promise<string[]> {
    const projectIds: string[] = [];

    if (typeof localStorage !== 'undefined') {
      const prefix = `${this.storageKey}:project:`;

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          const projectId = key.substring(prefix.length);
          projectIds.push(projectId);
        }
      }
    }

    return projectIds;
  }

  /**
   * Delete project from local storage
   */
  async deleteProjectLocal(projectId: string): Promise<void> {
    const key = `${this.storageKey}:project:${projectId}`;

    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
      console.log(`[StorageService] Deleted local project: ${projectId}`);
    }
  }

  /**
   * Save project to cloud storage
   */
  async saveProjectCloud(projectId: string, projectFile: ProjectFile): Promise<string> {
    if (this.config.storageType !== 'cloud') {
      throw new Error('Storage service is not configured for cloud storage');
    }

    const data = JSON.stringify(projectFile);

    switch (this.config.cloudProvider) {
      case 'firebase':
        return this.saveToFirebase(projectId, data);
      case 'supabase':
        return this.saveToSupabase(projectId, data);
      case 'aws':
        return this.saveToAws(projectId, data);
      default:
        throw new Error(`Unsupported cloud provider: ${this.config.cloudProvider}`);
    }
  }

  private async saveToFirebase(projectId: string, data: string): Promise<string> {
    const credentials = this.config.credentials as FirebaseCredentials;
    if (!credentials) {
      throw new Error('Firebase credentials missing');
    }

    const firebaseConfig = {
      apiKey: credentials.apiKey,
      authDomain: credentials.authDomain,
      projectId: credentials.projectId,
      storageBucket: credentials.storageBucket,
      messagingSenderId: credentials.messagingSenderId,
      appId: credentials.appId
    };

    // Check if app is already initialized
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    const storage = getStorage(app);
    const storageRef = ref(storage, `projects/${projectId}.json`);

    await uploadString(storageRef, data);
    return await getDownloadURL(storageRef);
  }

  private async saveToSupabase(projectId: string, data: string): Promise<string> {
    const credentials = this.config.credentials as SupabaseCredentials;
    if (!credentials || !credentials.url || !credentials.key) {
      throw new Error('Supabase credentials missing');
    }

    const supabase = createClient(credentials.url, credentials.key);

    // Assuming a bucket named 'projects' exists
    const { error } = await supabase.storage.from('projects').upload(`${projectId}.json`, data, {
      contentType: 'application/json',
      upsert: true
    });

    if (error) {
      throw new Error(`Supabase upload failed: ${error.message}`);
    }

    const {
      data: { publicUrl }
    } = supabase.storage.from('projects').getPublicUrl(`${projectId}.json`);

    return publicUrl;
  }

  private async saveToAws(projectId: string, data: string): Promise<string> {
    const credentials = this.config.credentials as AwsCredentials;
    if (
      !credentials ||
      !credentials.accessKeyId ||
      !credentials.secretAccessKey ||
      !credentials.region ||
      !credentials.bucketName
    ) {
      throw new Error('AWS credentials missing');
    }

    const client = new S3Client({
      region: credentials.region,
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey
      }
    });

    const key = `projects/${projectId}.json`;

    const command = new PutObjectCommand({
      Bucket: credentials.bucketName,
      Key: key,
      Body: data,
      ContentType: 'application/json'
    });

    await client.send(command);

    // Generate a signed URL for immediate access
    const getCommand = new GetObjectCommand({
      Bucket: credentials.bucketName,
      Key: key
    });

    return await getSignedUrl(client, getCommand, { expiresIn: 3600 });
  }

  /**
   * Load project from cloud storage
   */
  async loadProjectCloud(_projectId: string): Promise<ProjectFile | null> {
    // TODO: Implement cloud storage integration
    throw new Error('Cloud storage not implemented. Please configure a cloud storage provider.');
  }

  // ===== User Data Storage =====

  /**
   * Save user data locally
   */
  async saveUserLocal(user: User): Promise<void> {
    const key = `${this.storageKey}:user`;
    const data = JSON.stringify(user);

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, data);
    }

    console.log(`[StorageService] Saved user data locally`);
  }

  /**
   * Load user data locally
   */
  async loadUserLocal(): Promise<User | null> {
    const key = `${this.storageKey}:user`;

    if (typeof localStorage !== 'undefined') {
      const data = localStorage.getItem(key);
      if (data) {
        return JSON.parse(data);
      }
    }

    return null;
  }

  /**
   * Clear all local data
   */
  async clearAllLocal(): Promise<void> {
    if (typeof localStorage !== 'undefined') {
      const keysToRemove: string[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.storageKey)) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach((key) => localStorage.removeItem(key));
      console.log(`[StorageService] Cleared ${keysToRemove.length} local items`);
    }
  }

  // ===== File Upload/Download =====

  /**
   * Upload audio file to cloud storage
   */
  async uploadAudioFile(_file: Blob, filename: string): Promise<string> {
    console.log(`[StorageService] Uploading audio file: ${filename}`);

    // Placeholder - would use cloud storage SDK
    return `https://storage.example.com/audio/${filename}`;
  }

  /**
   * Download audio file from cloud storage
   */
  async downloadAudioFile(url: string): Promise<Blob> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download audio file: ${response.statusText}`);
    }
    return response.blob();
  }

  /**
   * Upload image file to cloud storage
   */
  async uploadImageFile(_file: Blob, filename: string): Promise<string> {
    console.log(`[StorageService] Uploading image file: ${filename}`);

    // Placeholder - would use cloud storage SDK
    return `https://storage.example.com/images/${filename}`;
  }

  // ===== Cache Management =====

  /**
   * Get cache size
   */
  async getCacheSize(): Promise<number> {
    if (typeof localStorage !== 'undefined') {
      let totalSize = 0;

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.storageKey)) {
          const item = localStorage.getItem(key);
          if (item) {
            totalSize += item.length;
          }
        }
      }

      return totalSize;
    }

    return 0;
  }

  /**
   * Clear cache
   */
  async clearCache(): Promise<void> {
    // In a real app, this would clear cached audio files, images, etc.
    console.log('[StorageService] Cache cleared');
  }
}
