# Looper - Loop Pad & Social Remix Platform

A React Native + TypeScript music creation app featuring a real-time loop pad with social sharing and remix capabilities.

## Features

### Loop Pad Studio
- **16-pad grid** (4x4) with real-time audio triggering
- **Multiple sound packs** (Hip Hop, Electronic, Trap, Lo-Fi, House, Vocal)
- **BPM control** (60-200 BPM)
- **Project saving** and loading
- **Volume control** per pad
- **Visual feedback** with color-coded pads

### Social Features
- **Track sharing** - Upload and share your creations
- **Remix system** - Remix other users' tracks
- **Likes & Comments** - Engage with the community
- **User profiles** - Follow creators
- **Discovery feed** - Explore trending tracks

### Technical Stack
- **React Native** with **Expo** for cross-platform development
- **TypeScript** for type safety
- **Expo AV** for audio playback and recording
- **Supabase** for backend (database, auth, storage)
- **React Navigation** for routing

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/CL25JEWELS/looper-app-project.git
   cd looper-app-project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Run the SQL schema from `supabase-schema.sql` in your Supabase SQL editor
   - Create storage buckets for `tracks` and `covers`
   - Copy your Supabase URL and anon key

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your Supabase credentials:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

5. **Start the development server**
   ```bash
   npm start
   ```

6. **Run on device/simulator**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app for physical device

## Project Structure

```
looper-app-project/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── LoopPad.tsx   # Main loop pad grid
│   │   └── TrackCard.tsx # Track display card
│   ├── screens/          # Screen components
│   │   ├── LoopPadScreen.tsx
│   │   ├── DiscoverScreen.tsx
│   │   ├── TrackDetailScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   ├── SoundPacksScreen.tsx
│   │   └── ProjectListScreen.tsx
│   ├── navigation/       # Navigation configuration
│   │   └── AppNavigator.tsx
│   ├── services/         # Business logic & API
│   │   ├── audio.ts      # Audio playback service
│   │   ├── recording.ts  # Recording & export
│   │   └── supabase.ts   # Database operations
│   ├── config/           # App configuration
│   │   └── constants.ts  # Colors, settings
│   └── types/            # TypeScript types
│       └── index.ts
├── assets/
│   └── sounds/           # Sound pack samples
├── App.tsx               # Root component
├── package.json
└── README.md
```

## Usage

### Creating a Loop
1. Open the **Studio** tab
2. Tap a pad to trigger a sound
3. Long-press a pad to assign a new sound
4. Adjust BPM with +/- controls
5. Save your project

### Sound Packs
1. Navigate to **Sound Packs** from the studio
2. Select a pack to load samples
3. Packs are automatically assigned to pads

### Exporting & Sharing
1. Create your loop in the studio
2. Tap **Export** to render your track
3. Add title, description, and tags
4. Upload to share with the community

### Social Features
1. Browse tracks in the **Feed** tab
2. Like tracks by tapping the heart icon
3. Remix tracks to create your own version
4. Comment to engage with creators

## Development

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

### Building for Production
```bash
# iOS
expo build:ios

# Android
expo build:android
```

## Architecture

### Audio System
- **Expo AV** manages all audio playback
- Sounds are loaded on-demand and cached
- Real-time triggering with minimal latency
- Support for simultaneous pad playback

### State Management
- Component-level state with React hooks
- Audio state managed by AudioService singleton
- Persistent storage via Supabase

### Backend (Supabase)
- **PostgreSQL** for relational data
- **Row Level Security** for data protection
- **Storage** for audio files and images
- **Real-time subscriptions** for social features

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Support

For questions or issues, please open an issue on GitHub.

## Roadmap

- [ ] Audio recording directly in the app
- [ ] Loop sequencer with timeline
- [ ] Effects (reverb, delay, filter)
- [ ] Collaborative projects
- [ ] Live streaming performances
- [ ] In-app sound pack marketplace
- [ ] MIDI controller support

---

Built with ❤️ using React Native, Expo, and Supabase
# 🎵 Looper App

> **Professional loop pad music creation app with integrated social remix platform**

A modular, scalable, real-time audio application built for music creators. Create beats, share tracks, and remix the community's creations.

![Architecture](https://img.shields.io/badge/Architecture-Modular-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![React](https://img.shields.io/badge/React-18.2-61dafb)
![Audio](https://img.shields.io/badge/Audio-Web%20Audio%20API-orange)

## ✨ Features

### 🎹 Loop Pad Engine
- Real-time audio triggering with ultra-low latency
- Polyphonic playback supporting 32+ simultaneous voices
- Comprehensive sound categories (kicks, snares, 808s, bass, melodies, vocals, FX)
- Per-pad controls: volume, pitch, filter, pan, effects
- Tempo sync and quantization
- Multiple playback modes: one-shot, loop, sustained

### 🎼 Project System
- Full project save/load with state preservation
- Export to audio files (WAV, MP3, OGG)
- Auto-save functionality
- Version compatibility
- Arrangement and timeline support

### 📦 Sound Pack System
- Modular sound pack architecture
- Built-in and downloadable packs
- Category-based organization
- Sound preview functionality
- Easy sound pack creation

### 🌐 Social Platform
- User profiles with stats and followers
- Upload and share your tracks
- Remix system with full versioning chain
- Discovery feeds (trending, new, recommended)
- Social interactions (likes, comments, shares)
- Cloud storage for projects and audio

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Usage Example

```typescript
import { LooperApp, defaultConfig } from 'looper-app-project';

// Initialize the app
const app = new LooperApp(defaultConfig);
await app.initialize();

// Create a project
const projectManager = app.getProjectManager();
const project = projectManager.createProject('My Beat');

// Configure and trigger a pad
const audioEngine = app.getAudioEngine();
audioEngine.configurePad('pad-0', {
  id: 'pad-0',
  soundId: 'kick-01',
  volume: 0.8,
  pitch: 0,
  playbackMode: 'one_shot',
  pan: 0,
  effects: []
});

audioEngine.triggerPad('pad-0', { quantize: true });
```

## 📁 Project Structure

```
src/
├── core/                    # Core audio and project logic
│   ├── audio-engine/       # Real-time audio processing
│   ├── sound-packs/        # Sound pack management
│   ├── project/            # Project management
│   └── LooperApp.ts        # Main app orchestrator
├── services/               # External services
│   ├── api/                # Backend API client
│   └── storage/            # Local/cloud storage
├── ui/                     # User interface
│   ├── components/         # Reusable React components
│   └── screens/            # Full-screen views
└── types/                  # TypeScript definitions
```

## 📖 Documentation

- [Full Documentation](./DOCUMENTATION.md) - Complete architecture and usage guide
- [API Specification](./API_SPEC.md) - Backend API endpoints and data models

## 🏗️ Architecture Highlights

- **Modular Design**: Clean separation between audio engine, UI, and services
- **Platform Agnostic**: Core works in browsers, React Native, and Electron
- **Type Safe**: Full TypeScript coverage
- **Performance First**: Audio isolated from UI thread, optimized for real-time
- **Scalable**: Easy to add features, sound packs, and effects

## 🎯 Key Design Principles

1. **Low Latency Audio**: Optimized for real-time performance
2. **Separation of Concerns**: Audio engine completely isolated from UI
3. **Modular Architecture**: Add features without touching core
4. **Type Safety**: TypeScript throughout for reliability
5. **Clean Code**: Readable, maintainable, well-documented

## 🔧 Technology Stack

- **Frontend**: React 18, TypeScript 5
- **Audio**: Web Audio API
- **Architecture**: Modular, service-oriented
- **Platforms**: Web, React Native (planned), Electron (planned)

## 🚧 Roadmap

- [ ] Effects expansion (reverb, delay, distortion, etc.)
- [ ] Arrangement view with timeline
- [ ] MIDI controller support
- [ ] Real-time collaboration
- [ ] AI-powered sound generation
- [ ] Mobile apps (iOS/Android)
- [ ] Desktop apps (macOS/Windows/Linux)
- [ ] Live performance mode

## 🤝 Contributing

Contributions welcome! Key areas:
- Sound pack creation
- New effects processors
- UI/UX improvements
- Performance optimization
- Backend implementation
- Platform-specific ports

## 📄 License

MIT License - See [LICENSE](./LICENSE) file

## 🙏 Acknowledgments

Inspired by industry-leading music production tools:
- Ableton Push/Live
- Native Instruments Maschine
- Teenage Engineering OP-1
- BandLab, SoundCloud, Splice

---

**Built for creators, by creators** 🎵

Made with ❤️ and Web Audio API
