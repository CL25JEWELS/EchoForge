/**
 * Storage Service
 *
 * Local and cloud storage for projects and user data
 */

import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL, getBytes } from 'firebase/storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { ProjectFile } from '../../types/project.types';
import { User } from '../../types/social.types';

export interface StorageConfig {
  storageType: 'local' | 'cloud';
  cloudProvider?: 'firebase' | 'supabase' | 'aws';
  credentials?: Record<string, string>;
}

export class StorageService {
  private storageKey = 'looper-app';
  private config: StorageConfig;
  private firebaseStorage: any;
  private supabaseClient: SupabaseClient | null = null;
  private s3Client: S3Client | null = null;

  constructor(config: StorageConfig) {
    this.config = config;
    this.initializeCloudProvider();
  }

  private initializeCloudProvider() {
    if (this.config.storageType !== 'cloud' || !this.config.credentials) {
      return;
    }

    try {
      switch (this.config.cloudProvider) {
        case 'firebase': {
          const app = initializeApp(this.config.credentials);
          this.firebaseStorage = getStorage(app);
          break;
        }
        case 'supabase':
          if (this.config.credentials.url && this.config.credentials.key) {
            this.supabaseClient = createClient(
              this.config.credentials.url,
              this.config.credentials.key
            );
          }
          break;
        case 'aws':
          if (
            this.config.credentials.region &&
            this.config.credentials.accessKeyId &&
            this.config.credentials.secretAccessKey
          ) {
            this.s3Client = new S3Client({
              region: this.config.credentials.region,
              credentials: {
                accessKeyId: this.config.credentials.accessKeyId,
                secretAccessKey: this.config.credentials.secretAccessKey
              }
            });
          }
          break;
      }
    } catch (error) {
      console.error('Failed to initialize cloud provider:', error);
    }
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
      throw new Error('Cloud storage not enabled');
    }

    const data = JSON.stringify(projectFile);
    const blob = new Blob([data], { type: 'application/json' });
    const fileName = `projects/${projectId}.json`;

    switch (this.config.cloudProvider) {
      case 'firebase': {
        if (!this.firebaseStorage) throw new Error('Firebase not initialized');
        const storageRef = ref(this.firebaseStorage, fileName);
        await uploadBytes(storageRef, blob);
        return await getDownloadURL(storageRef);
      }

      case 'supabase': {
        if (!this.supabaseClient) throw new Error('Supabase not initialized');
        const { data: supabaseData, error } = await this.supabaseClient.storage
          .from('projects')
          .upload(fileName, blob, { upsert: true });
        if (error) throw error;
        return supabaseData?.path || fileName;
      }

      case 'aws': {
        if (!this.s3Client) throw new Error('AWS S3 not initialized');
        if (!this.config.credentials?.bucketName) throw new Error('AWS Bucket name not configured');

        const command = new PutObjectCommand({
          Bucket: this.config.credentials.bucketName,
          Key: fileName,
          Body: data, // S3 accepts string body
          ContentType: 'application/json'
        });
        await this.s3Client.send(command);
        return `s3://${this.config.credentials.bucketName}/${fileName}`;
      }

      default:
        throw new Error('Cloud provider not configured');
    }
  }

  /**
   * Load project from cloud storage
   */
  async loadProjectCloud(projectId: string): Promise<ProjectFile | null> {
    if (this.config.storageType !== 'cloud') {
      throw new Error('Cloud storage not enabled');
    }

    const fileName = `projects/${projectId}.json`;
    let projectFile: ProjectFile | null = null;

    switch (this.config.cloudProvider) {
      case 'firebase': {
        if (!this.firebaseStorage) throw new Error('Firebase not initialized');
        const storageRef = ref(this.firebaseStorage, fileName);
        try {
          // getBytes is better for small JSON files than getDownloadURL + fetch
          const arrayBuffer = await getBytes(storageRef);
          const decoder = new TextDecoder();
          const jsonString = decoder.decode(arrayBuffer);
          projectFile = JSON.parse(jsonString);
        } catch (error) {
          console.error('Error loading from Firebase:', error);
          return null;
        }
        break;
      }

      case 'supabase': {
        if (!this.supabaseClient) throw new Error('Supabase not initialized');
        const { data, error } = await this.supabaseClient.storage
          .from('projects')
          .download(fileName);

        if (error) {
          console.error('Error loading from Supabase:', error);
          return null;
        }

        if (data) {
          const text = await data.text();
          projectFile = JSON.parse(text);
        }
        break;
      }

      case 'aws': {
        if (!this.s3Client) throw new Error('AWS S3 not initialized');
        if (!this.config.credentials?.bucketName) throw new Error('AWS Bucket name not configured');

        try {
          const command = new GetObjectCommand({
            Bucket: this.config.credentials.bucketName,
            Key: fileName
          });
          const response = await this.s3Client.send(command);
          if (response.Body) {
            const str = await response.Body.transformToString();
            projectFile = JSON.parse(str);
          }
        } catch (error) {
          console.error('Error loading from AWS S3:', error);
          return null;
        }
        break;
      }

      default:
        throw new Error('Cloud provider not configured');
    }

    if (projectFile) {
      // Restore Date objects
      if (projectFile.project.metadata.createdAt) {
        projectFile.project.metadata.createdAt = new Date(projectFile.project.metadata.createdAt);
      }
      if (projectFile.project.metadata.updatedAt) {
        projectFile.project.metadata.updatedAt = new Date(projectFile.project.metadata.updatedAt);
      }
    }

    return projectFile;
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
