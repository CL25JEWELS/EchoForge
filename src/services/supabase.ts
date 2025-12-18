import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config/constants';

// Initialize Supabase client with AsyncStorage for auth persistence
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database helper functions
export const db = {
  // Projects
  async getProjects(userId: string) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async createProject(project: any) {
    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateProject(id: string, updates: any) {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteProject(id: string) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Tracks
  async getTracks(limit = 20, offset = 0) {
    const { data, error } = await supabase
      .from('tracks')
      .select('*, users!inner(id, username, avatar_url)')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    return data;
  },

  async getTrackById(trackId: string) {
    const { data, error } = await supabase
      .from('tracks')
      .select('*, users!inner(id, username, avatar_url)')
      .eq('id', trackId)
      .single();
    
    if (error) throw error;
    return data;
  },

  async createTrack(track: any) {
    const { data, error } = await supabase
      .from('tracks')
      .insert(track)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Likes
  async likeTrack(userId: string, trackId: string) {
    const { data, error } = await supabase
      .from('likes')
      .insert({ user_id: userId, track_id: trackId })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async unlikeTrack(userId: string, trackId: string) {
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('user_id', userId)
      .eq('track_id', trackId);
    
    if (error) throw error;
  },

  async getTrackLikes(trackId: string) {
    const { count, error } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('track_id', trackId);
    
    if (error) throw error;
    return count || 0;
  },

  // Comments
  async getComments(trackId: string) {
    const { data, error } = await supabase
      .from('comments')
      .select('*, users!inner(id, username, avatar_url)')
      .eq('track_id', trackId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async addComment(userId: string, trackId: string, content: string) {
    const { data, error } = await supabase
      .from('comments')
      .insert({ user_id: userId, track_id: trackId, content })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // User profile
  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateUserProfile(userId: string, updates: any) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
};
