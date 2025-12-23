// Supabase configuration
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

// App configuration
export const APP_CONFIG = {
  MAX_PROJECT_NAME_LENGTH: 50,
  MAX_TRACK_DESCRIPTION_LENGTH: 500,
  MAX_COMMENT_LENGTH: 300,
  LOOP_PAD_GRID_SIZE: 16, // 4x4 grid
  DEFAULT_BPM: 120,
  MIN_BPM: 60,
  MAX_BPM: 200,
  AUDIO_QUALITY: {
    bitRate: 128000,
    sampleRate: 44100,
    numberOfChannels: 2,
  },
};

// Theme colors
export const COLORS = {
  primary: '#6c5ce7',
  secondary: '#fd79a8',
  background: '#1a1a2e',
  surface: '#16213e',
  card: '#0f3460',
  text: '#ffffff',
  textSecondary: '#a4b0be',
  accent: '#00d2d3',
  success: '#00b894',
  error: '#d63031',
  warning: '#fdcb6e',
  
  // Pad colors
  padColors: [
    '#6c5ce7', '#fd79a8', '#00d2d3', '#00b894',
    '#fdcb6e', '#e17055', '#74b9ff', '#a29bfe',
    '#ff7675', '#fab1a0', '#55efc4', '#81ecec',
    '#ffeaa7', '#dfe6e9', '#fd79a8', '#6c5ce7',
  ],
};
