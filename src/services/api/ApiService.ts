/**
 * API Service
 *
 * Backend API client for social platform features
 */

import {
  User,
  Track,
  Comment,
  Feed,
  FeedType,
  RemixMetadata,
  Notification,
  Follow,
  Like,
  Share
} from '../../types/social.types';
import { ProjectFile } from '../../types/project.types';

export interface ApiConfig {
  baseUrl: string;
  apiKey?: string;
  authToken?: string;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface UploadTrackParams {
  title: string;
  description?: string;
  projectFile: ProjectFile;
  audioFile: Blob;
  coverImage?: Blob;
  tags?: string[];
  isPublic?: boolean;
  isRemixable?: boolean;
  remixMetadata?: RemixMetadata;
}

export class ApiService {
  private config: ApiConfig;

  constructor(config: ApiConfig) {
    this.config = config;
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string): void {
    this.config.authToken = token;
  }

  /**
   * Get request headers
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };

    if (this.config.apiKey) {
      headers['X-API-Key'] = this.config.apiKey;
    }

    if (this.config.authToken) {
      headers['Authorization'] = `Bearer ${this.config.authToken}`;
    }

    return headers;
  }

  /**
   * Make HTTP request
   */
  /**
   * Helper to convert pagination params to Record<string, string>
   */
  private toRecord(params?: PaginationParams): Record<string, string> {
    const record: Record<string, string> = {};
    if (params) {
      if (params.page !== undefined) record.page = String(params.page);
      if (params.pageSize !== undefined) record.pageSize = String(params.pageSize);
    }
    return record;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // ===== User API =====

  async getUser(userId: string): Promise<User> {
    return this.request<User>(`/users/${userId}`);
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/users/me');
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    return this.request<User>(`/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  }

  async searchUsers(query: string, params?: PaginationParams): Promise<User[]> {
    const searchParams = new URLSearchParams({
      q: query,
      ...this.toRecord(params)
    });
    return this.request<User[]>(`/users/search?${searchParams}`);
  }

  // ===== Track API =====

  async uploadTrack(params: UploadTrackParams): Promise<Track> {
    const formData = new FormData();
    formData.append('title', params.title);
    formData.append('audioFile', params.audioFile);
    formData.append(
      'projectFile',
      new Blob([JSON.stringify(params.projectFile)], {
        type: 'application/json'
      })
    );

    if (params.description) formData.append('description', params.description);
    if (params.coverImage) formData.append('coverImage', params.coverImage);
    if (params.tags) formData.append('tags', JSON.stringify(params.tags));
    if (params.isPublic !== undefined) formData.append('isPublic', String(params.isPublic));
    if (params.isRemixable !== undefined)
      formData.append('isRemixable', String(params.isRemixable));
    if (params.remixMetadata)
      formData.append('remixMetadata', JSON.stringify(params.remixMetadata));

    // Get headers but remove Content-Type for FormData (browser sets it automatically with boundary)
    const headers = this.getHeaders();
    const { 'Content-Type': _, ...headersWithoutContentType } = headers as Record<string, string>;

    const response = await fetch(`${this.config.baseUrl}/tracks`, {
      method: 'POST',
      headers: headersWithoutContentType,
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Failed to upload track: ${response.statusText}`);
    }

    return response.json();
  }

  async getTrack(trackId: string): Promise<Track> {
    return this.request<Track>(`/tracks/${trackId}`);
  }

  async updateTrack(trackId: string, updates: Partial<Track>): Promise<Track> {
    return this.request<Track>(`/tracks/${trackId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  }

  async deleteTrack(trackId: string): Promise<void> {
    await this.request(`/tracks/${trackId}`, { method: 'DELETE' });
  }

  async getUserTracks(userId: string, params?: PaginationParams): Promise<Track[]> {
    const searchParams = new URLSearchParams(this.toRecord(params));
    return this.request<Track[]>(`/users/${userId}/tracks?${searchParams}`);
  }

  async downloadProjectFile(trackId: string): Promise<ProjectFile> {
    return this.request<ProjectFile>(`/tracks/${trackId}/project`);
  }

  // ===== Feed API =====

  async getFeed(type: FeedType, params?: PaginationParams): Promise<Feed> {
    const searchParams = new URLSearchParams(this.toRecord(params));
    return this.request<Feed>(`/feed/${type}?${searchParams}`);
  }

  async getFollowingFeed(params?: PaginationParams): Promise<Feed> {
    return this.getFeed(FeedType.FOLLOWING, params);
  }

  async getTrendingTracks(params?: PaginationParams): Promise<Track[]> {
    const feed = await this.getFeed(FeedType.TRENDING, params);
    return feed.tracks;
  }

  async getNewTracks(params?: PaginationParams): Promise<Track[]> {
    const feed = await this.getFeed(FeedType.NEW, params);
    return feed.tracks;
  }

  async getRecommendedTracks(params?: PaginationParams): Promise<Track[]> {
    const feed = await this.getFeed(FeedType.RECOMMENDED, params);
    return feed.tracks;
  }

  // ===== Remix API =====

  async getRemixes(trackId: string, params?: PaginationParams): Promise<Track[]> {
    const searchParams = new URLSearchParams(this.toRecord(params));
    return this.request<Track[]>(`/tracks/${trackId}/remixes?${searchParams}`);
  }

  async getRemixChain(trackId: string): Promise<Track[]> {
    return this.request<Track[]>(`/tracks/${trackId}/remix-chain`);
  }

  // ===== Comments API =====

  async getComments(trackId: string, params?: PaginationParams): Promise<Comment[]> {
    const searchParams = new URLSearchParams(this.toRecord(params));
    return this.request<Comment[]>(`/tracks/${trackId}/comments?${searchParams}`);
  }

  async addComment(trackId: string, content: string, timestamp?: number): Promise<Comment> {
    return this.request<Comment>(`/tracks/${trackId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content, timestamp })
    });
  }

  async updateComment(commentId: string, content: string): Promise<Comment> {
    return this.request<Comment>(`/comments/${commentId}`, {
      method: 'PATCH',
      body: JSON.stringify({ content })
    });
  }

  async deleteComment(commentId: string): Promise<void> {
    await this.request(`/comments/${commentId}`, { method: 'DELETE' });
  }

  async likeComment(commentId: string): Promise<void> {
    await this.request(`/comments/${commentId}/like`, { method: 'POST' });
  }

  // ===== Likes API =====

  async likeTrack(trackId: string): Promise<Like> {
    return this.request<Like>(`/tracks/${trackId}/like`, { method: 'POST' });
  }

  async unlikeTrack(trackId: string): Promise<void> {
    await this.request(`/tracks/${trackId}/like`, { method: 'DELETE' });
  }

  async getLikedTracks(userId: string, params?: PaginationParams): Promise<Track[]> {
    const searchParams = new URLSearchParams(this.toRecord(params));
    return this.request<Track[]>(`/users/${userId}/likes?${searchParams}`);
  }

  // ===== Follow API =====

  async followUser(userId: string): Promise<Follow> {
    return this.request<Follow>(`/users/${userId}/follow`, { method: 'POST' });
  }

  async unfollowUser(userId: string): Promise<void> {
    await this.request(`/users/${userId}/follow`, { method: 'DELETE' });
  }

  async getFollowers(userId: string, params?: PaginationParams): Promise<User[]> {
    const searchParams = new URLSearchParams(this.toRecord(params));
    return this.request<User[]>(`/users/${userId}/followers?${searchParams}`);
  }

  async getFollowing(userId: string, params?: PaginationParams): Promise<User[]> {
    const searchParams = new URLSearchParams(this.toRecord(params));
    return this.request<User[]>(`/users/${userId}/following?${searchParams}`);
  }

  // ===== Share API =====

  async shareTrack(trackId: string, platform?: string): Promise<Share> {
    return this.request<Share>(`/tracks/${trackId}/share`, {
      method: 'POST',
      body: JSON.stringify({ platform })
    });
  }

  // ===== Notifications API =====

  async getNotifications(params?: PaginationParams): Promise<Notification[]> {
    const searchParams = new URLSearchParams(this.toRecord(params));
    return this.request<Notification[]>(`/notifications?${searchParams}`);
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    await this.request(`/notifications/${notificationId}/read`, { method: 'POST' });
  }

  async markAllNotificationsAsRead(): Promise<void> {
    await this.request('/notifications/read-all', { method: 'POST' });
  }

  // ===== Search API =====

  async searchTracks(query: string, params?: PaginationParams): Promise<Track[]> {
    const searchParams = new URLSearchParams({
      q: query,
      ...this.toRecord(params)
    });
    return this.request<Track[]>(`/tracks/search?${searchParams}`);
  }

  async searchByTag(tag: string, params?: PaginationParams): Promise<Track[]> {
    const searchParams = new URLSearchParams({
      tag,
      ...this.toRecord(params)
    });
    return this.request<Track[]>(`/tracks/by-tag?${searchParams}`);
  }
}
