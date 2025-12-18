# Setup Guide for Looper App

This guide will walk you through setting up the complete development environment for the Looper app.

## Prerequisites

### Required Software
- **Node.js** (v16+): [Download](https://nodejs.org/)
- **npm** or **yarn**: Comes with Node.js
- **Expo CLI**: Install globally
  ```bash
  npm install -g expo-cli
  ```
- **Git**: [Download](https://git-scm.com/)

### Mobile Development (Optional)
- **iOS**: macOS with Xcode for iOS simulator
- **Android**: Android Studio for Android emulator
- **Physical Device**: Expo Go app ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

## Step-by-Step Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/CL25JEWELS/looper-app-project.git
cd looper-app-project

# Install dependencies
npm install
```

### 2. Supabase Setup

#### Create a Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in project details:
   - Name: `looper-app`
   - Database Password: (create a strong password)
   - Region: (choose closest to you)
5. Wait for the project to be created (~2 minutes)

#### Set Up Database Schema
1. In your Supabase dashboard, go to the **SQL Editor**
2. Open the `supabase-schema.sql` file from the project
3. Copy all the SQL code
4. Paste it into the SQL Editor
5. Click **Run** to execute the schema

#### Configure Storage
1. Go to **Storage** in the sidebar
2. The schema should have created `tracks` and `covers` buckets
3. Verify both buckets exist and are set to public

#### Get Your API Keys
1. Go to **Settings** → **API**
2. Copy your:
   - Project URL (e.g., `https://xxxxx.supabase.co`)
   - `anon` public key

### 3. Configure Environment Variables

```bash
# Copy the example env file
cp .env.example .env

# Edit .env and add your Supabase credentials
# Use any text editor
nano .env
```

Add your values:
```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Add Sound Assets (Optional)

To get started quickly, you can skip this step. The app will work without sound files, but pads won't play audio.

To add sounds:
1. Place audio files in `assets/sounds/` subdirectories
2. Supported formats: WAV, MP3, M4A
3. Recommended: Short samples (1-5 seconds)

Example structure:
```
assets/sounds/
├── hip-hop/
│   ├── kick.wav
│   ├── snare.wav
│   └── hihat.wav
└── ...
```

### 5. Start the Development Server

```bash
npm start
```

This will:
- Start the Expo development server
- Open Expo DevTools in your browser
- Display a QR code

### 6. Run on Your Device

#### Option A: Physical Device (Easiest)
1. Install **Expo Go** app on your phone
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Android Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
2. Open Expo Go
3. Scan the QR code from your terminal/browser
4. App will load on your device

#### Option B: iOS Simulator (macOS only)
1. Install Xcode from the Mac App Store
2. Install iOS Simulator tools
3. Press `i` in the terminal where Expo is running
4. Simulator will open automatically

#### Option C: Android Emulator
1. Install [Android Studio](https://developer.android.com/studio)
2. Set up an Android Virtual Device (AVD)
3. Start the emulator
4. Press `a` in the terminal where Expo is running

## Troubleshooting

### "Cannot find module" errors
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
```

### Expo DevTools won't open
```bash
# Try starting with different options
npx expo start --clear
```

### "Network request failed" in app
- Verify your `.env` file has correct Supabase credentials
- Check that Supabase project is running
- Ensure you're on the same network as your dev machine (for physical devices)

### Audio not playing
- Check that Expo AV is properly installed: `expo install expo-av`
- Verify audio files exist in `assets/sounds/`
- Check device volume and not in silent mode

### Build errors on iOS
- Make sure Xcode is up to date
- Clear iOS build cache: `expo prebuild --clean`
- Try deleting `ios/` folder and run `expo prebuild` again

### Android build issues
- Update Android Studio to latest version
- Verify Android SDK is installed
- Clear Android cache: `cd android && ./gradlew clean`

## Development Workflow

### Making Changes
1. Edit code in your preferred editor (VS Code recommended)
2. Save files - Expo will hot reload automatically
3. Test on your device/simulator
4. Commit changes with git

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

### Testing on Multiple Platforms
- Test on both iOS and Android when possible
- Different devices may have different audio behavior
- Verify UI scales properly on different screen sizes

## Next Steps

### Add Custom Assets
1. Create app icons (1024x1024px)
2. Design splash screen
3. Add sound pack samples

### Enable Authentication
1. In Supabase dashboard, go to **Authentication**
2. Enable Email provider (enabled by default)
3. Optionally enable social providers (Google, GitHub, etc.)
4. Update app to use real authentication (replace `'demo-user'`)

### Deploy to Production
1. Build the app:
   ```bash
   expo build:android  # or build:ios
   ```
2. Submit to app stores following Expo documentation

## Getting Help

- **Expo Documentation**: [docs.expo.dev](https://docs.expo.dev)
- **Supabase Documentation**: [supabase.com/docs](https://supabase.com/docs)
- **React Native Docs**: [reactnative.dev](https://reactnative.dev)
- **GitHub Issues**: Report bugs on the project repository

## Resources

- [Expo AV Documentation](https://docs.expo.dev/versions/latest/sdk/av/)
- [React Navigation Docs](https://reactnavigation.org/docs/getting-started)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript/introduction)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

---

Happy coding! 🎵
