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
