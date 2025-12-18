# Quick Start Guide

Get up and running with Looper in 5 minutes!

## Prerequisites

Make sure you have:
- **Node.js** (v16+) installed
- **npm** or **yarn**
- **Expo Go** app on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

## Installation

```bash
# 1. Clone the repository
git clone https://github.com/CL25JEWELS/looper-app-project.git
cd looper-app-project

# 2. Install dependencies
npm install

# 3. Start the development server
npm start
```

## Run on Your Device

1. **Open Expo Go** on your phone
2. **Scan the QR code** shown in your terminal
3. **Wait for the app to load** (~30 seconds first time)

That's it! The app should now be running on your device.

## Without Supabase (Demo Mode)

The app will work in demo mode without Supabase setup, but with limited functionality:
- ✅ Loop pad works
- ✅ UI navigation works
- ✅ Project creation (local only)
- ❌ Social features disabled
- ❌ Cloud sync disabled
- ❌ Track upload disabled

## With Supabase (Full Features)

To enable all features, set up Supabase (5 minutes):

1. **Create a free Supabase account** at [supabase.com](https://supabase.com)
2. **Create a new project**
3. **Run the schema:**
   - Go to SQL Editor in Supabase dashboard
   - Copy contents from `supabase-schema.sql`
   - Paste and run
4. **Get your keys:**
   - Go to Settings → API
   - Copy Project URL and anon key
5. **Configure the app:**
   ```bash
   cp .env.example .env
   # Edit .env with your keys
   ```
6. **Restart the dev server:**
   ```bash
   npm start
   ```

Now all features are enabled! 🎉

## Project Structure

```
src/
├── components/    # UI components (LoopPad, TrackCard)
├── screens/       # App screens (Studio, Feed, Profile)
├── services/      # Business logic (audio, database)
├── navigation/    # Navigation config
└── types/         # TypeScript types
```

## Key Features

### Loop Pad Studio
- 16-pad grid for creating loops
- BPM control (60-200)
- Save/load projects
- Export tracks

### Social Features (requires Supabase)
- Browse tracks from other users
- Like and comment on tracks
- Remix tracks
- User profiles

## Development Tips

### Hot Reload
- Save any file to see changes instantly
- Shake device to open dev menu
- Press 'r' in terminal to reload

### TypeScript
- Types are in `src/types/index.ts`
- Run `npm run type-check` to check types

### Adding Sounds
- Place audio files in `assets/sounds/`
- Supported formats: WAV, MP3, M4A
- Update sound pack config in app

### Debugging
- Shake device → "Debug JS Remotely"
- Use `console.log()` (shows in terminal)
- Check Expo DevTools in browser

## Common Commands

```bash
# Start dev server
npm start

# Type check
npm run type-check

# Lint code
npm run lint

# Run on iOS simulator (macOS only)
npm run ios

# Run on Android emulator
npm run android
```

## Troubleshooting

**App won't load:**
- Make sure phone and computer are on same WiFi
- Try `npx expo start --tunnel`

**Audio not working:**
- Test on real device (simulator audio can be buggy)
- Check device volume
- Ensure audio files exist

**"Cannot connect to Metro":**
- Restart dev server: `npx expo start --clear`

**Type errors:**
- Run `npm install` again
- Delete `node_modules` and reinstall

## Next Steps

- Read [SETUP.md](./SETUP.md) for detailed setup
- Check [ARCHITECTURE.md](./ARCHITECTURE.md) to understand the code
- Explore the code in `src/` directory
- Add your own sounds to `assets/sounds/`
- Customize colors in `src/config/constants.ts`

## Getting Help

- Open an issue on GitHub
- Check Expo docs: [docs.expo.dev](https://docs.expo.dev)
- Supabase docs: [supabase.com/docs](https://supabase.com/docs)

---

Happy looping! 🎵
