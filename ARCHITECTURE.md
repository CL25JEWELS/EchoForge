# Architecture Documentation

## Overview

Looper is a React Native mobile application that combines a loop pad music creation studio with social networking features. The app allows users to create music using a 16-pad grid, share their creations, and remix tracks from other users.

## Technology Stack

### Frontend
- **React Native 0.74.5** - Cross-platform mobile framework
- **TypeScript 5.3.3** - Type safety and better developer experience
- **Expo 51.0.0** - Development platform and toolchain
- **React Navigation 6.x** - Navigation and routing

### Audio
- **Expo AV 14.0.0** - Audio playback and recording
- **Expo File System 17.0.0** - File operations for audio export

### Backend
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Authentication
  - Storage for audio files
  - Real-time subscriptions
  - Row Level Security (RLS)

### UI/UX
- **React Native Gesture Handler** - Touch interactions
- **React Native Reanimated** - Smooth animations
- **Expo Vector Icons** - Icon library

## Architecture Patterns

### Component Architecture

```
App (Root)
├── SafeAreaProvider
├── GestureHandlerRootView
└── NavigationContainer
    └── BottomTabNavigator
        ├── Studio Stack
        │   ├── LoopPadScreen
        │   ├── SoundPacksScreen
        │   └── ProjectListScreen
        ├── Feed Stack
        │   ├── DiscoverScreen
        │   └── TrackDetailScreen
        └── Profile Stack
            └── ProfileScreen
```

### Service Layer

**AudioService** - Singleton for audio management
- Load/unload sounds
- Play/stop sounds
- Volume control
- Memory management

**RecordingService** - Singleton for recording
- Start/stop recording
- Audio export
- File upload to Supabase

**Supabase Service** - Database operations
- CRUD operations for all entities
- Type-safe queries
- Error handling

### State Management

The app uses **React Hooks** for state management:
- `useState` for local component state
- `useEffect` for side effects
- Custom hooks for reusable logic (`useAuth`, `useDebounce`)
- No external state management library (Redux/MobX) to keep it simple

### Data Flow

```
User Interaction
    ↓
Component Handler
    ↓
Service Layer (audio/supabase)
    ↓
External API/Device
    ↓
Update Component State
    ↓
Re-render UI
```

## Core Features

### 1. Loop Pad Studio

**Components:**
- `LoopPad.tsx` - 16-pad grid with touch handlers
- `LoopPadScreen.tsx` - Studio screen with controls

**Key Features:**
- Real-time audio triggering
- Visual feedback (animations, colors)
- BPM control (60-200)
- Project save/load
- Track export

**Audio Flow:**
```
Sound Pack → Load Sounds → Audio Service → Sound Objects
User Tap → Play Sound → Audio Output
```

### 2. Sound Packs

**Components:**
- `SoundPacksScreen.tsx` - Browse and select sound packs

**Sound Pack Structure:**
```typescript
{
  id: string,
  name: string,
  description: string,
  sounds: Sound[],  // 16 sounds for the grid
  thumbnail?: string
}
```

### 3. Project Management

**Components:**
- `ProjectListScreen.tsx` - List user projects

**Data Model:**
```typescript
{
  id: string,
  userId: string,
  name: string,
  pads: PadState[],  // Configuration of all 16 pads
  bpm: number,
  soundPackId: string,
  isPublic: boolean,
  createdAt: string,
  updatedAt: string
}
```

### 4. Social Features

**Components:**
- `DiscoverScreen.tsx` - Browse tracks
- `TrackDetailScreen.tsx` - Track details with playback
- `TrackCard.tsx` - Track display component
- `ProfileScreen.tsx` - User profile

**Social Interactions:**
- Like/unlike tracks
- Comment on tracks
- Remix tracks (load into studio)
- Follow users
- Share tracks

## Database Schema

### Tables

**users**
- id (UUID, PK)
- username (TEXT, UNIQUE)
- email (TEXT, UNIQUE)
- avatar_url (TEXT)
- bio (TEXT)
- follower_count (INT)
- following_count (INT)
- timestamps

**projects**
- id (UUID, PK)
- user_id (UUID, FK)
- name (TEXT)
- pads (JSONB)
- bpm (INT)
- sound_pack_id (TEXT)
- is_public (BOOLEAN)
- timestamps

**tracks**
- id (UUID, PK)
- project_id (UUID, FK)
- user_id (UUID, FK)
- title (TEXT)
- description (TEXT)
- audio_url (TEXT)
- cover_image_url (TEXT)
- duration (INT)
- likes, plays, remix_count (INT)
- tags (TEXT[])
- is_remix (BOOLEAN)
- original_track_id (UUID, FK)
- timestamps

**likes**
- id (UUID, PK)
- user_id (UUID, FK)
- track_id (UUID, FK)
- created_at (TIMESTAMP)
- UNIQUE(user_id, track_id)

**comments**
- id (UUID, PK)
- user_id (UUID, FK)
- track_id (UUID, FK)
- content (TEXT)
- created_at (TIMESTAMP)

**follows**
- id (UUID, PK)
- follower_id (UUID, FK)
- following_id (UUID, FK)
- created_at (TIMESTAMP)
- UNIQUE(follower_id, following_id)

### Storage Buckets

**tracks** - Audio files (public)
**covers** - Cover images (public)

## Security

### Row Level Security (RLS)

All tables have RLS enabled with policies:
- Public read access for social content
- Users can only modify their own data
- Authentication required for writes
- Follows respect privacy settings

### Authentication

- Email/password via Supabase Auth
- Session management with AsyncStorage
- Automatic token refresh
- Secure password policies

### Data Validation

- Input sanitization on client
- Type checking with TypeScript
- Database constraints
- File type validation for uploads

## Performance Optimizations

### Audio
- Lazy loading of sounds
- Sound pooling/caching
- Unload unused sounds
- Low-latency playback mode

### UI
- FlatList virtualization for long lists
- Image lazy loading
- Animated values for smooth transitions
- Optimistic updates for likes/comments

### Network
- Pagination for feeds
- Debounced search
- Request caching
- Retry logic for failed requests

## File Structure

```
looper-app-project/
├── src/
│   ├── components/      # Reusable UI components
│   ├── screens/         # Screen components
│   ├── navigation/      # Navigation setup
│   ├── services/        # Business logic
│   ├── hooks/           # Custom React hooks
│   ├── utils/           # Helper functions
│   ├── config/          # App configuration
│   └── types/           # TypeScript types
├── assets/              # Static assets
│   └── sounds/          # Sound pack files
├── App.tsx              # Root component
├── package.json         # Dependencies
├── tsconfig.json        # TypeScript config
├── app.json             # Expo config
└── babel.config.js      # Babel config
```

## Development Workflow

1. **Local Development**
   - Start Expo dev server
   - Test on simulator/device
   - Hot reload for fast iteration

2. **Type Checking**
   - Run `npm run type-check` before commits
   - Fix TypeScript errors

3. **Code Style**
   - ESLint for linting
   - Consistent naming conventions
   - Component-based organization

4. **Testing Strategy**
   - Manual testing on iOS/Android
   - Test audio on real devices
   - Verify network operations
   - Test offline behavior

5. **Deployment**
   - Build with Expo
   - Submit to app stores
   - Configure Supabase production

## Future Enhancements

### Phase 2
- [ ] Audio effects (reverb, delay, filter)
- [ ] Loop sequencer with timeline
- [ ] MIDI controller support
- [ ] Collaborative projects

### Phase 3
- [ ] Live streaming
- [ ] In-app sound pack marketplace
- [ ] AI-powered sound generation
- [ ] Advanced mixing tools

### Phase 4
- [ ] Desktop version (Electron)
- [ ] Web version
- [ ] Plugin system
- [ ] Advanced analytics

## Troubleshooting

### Common Issues

**Audio not playing:**
- Check audio file paths
- Verify Expo AV initialization
- Test on real device (simulator audio issues)

**Supabase connection errors:**
- Verify environment variables
- Check API keys
- Ensure network connectivity

**Build failures:**
- Clear cache: `expo start --clear`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Update Expo CLI: `npm install -g expo-cli@latest`

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- [Supabase Docs](https://supabase.com/docs)
- [React Navigation](https://reactnavigation.org/)
- [Expo AV](https://docs.expo.dev/versions/latest/sdk/av/)

---

Last updated: 2025-12-18
