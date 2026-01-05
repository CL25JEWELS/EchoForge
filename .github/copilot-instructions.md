# GitHub Copilot Instructions for EchoForge

## Project Overview

**EchoForge** (formerly Looper App) is a professional-grade loop pad music creation application with an integrated social remix platform. The app enables music creators to:
- Create beats using a real-time audio loop pad engine
- Share tracks with the community
- Remix and build upon others' creations
- Discover new music through social feeds

### Key Features
- **Loop Pad Engine**: Real-time audio triggering with ultra-low latency (< 10ms)
- **Polyphonic Playback**: Support for 32+ simultaneous voices
- **Sound Categories**: kicks, snares, beats, 808s, plucks, bass, melodies, vocals, FX
- **Project System**: Full save/load with state preservation and export to audio files
- **Sound Pack System**: Modular, downloadable sound packs with category organization
- **Social Platform**: User profiles, track sharing, remix versioning, social interactions

### Target Users
Music creators, beat makers, and audio enthusiasts looking for a professional loop pad tool with social features.

## Tech Stack

### Core Technologies
- **Language**: TypeScript 5.5+ (strict mode enabled)
- **UI Framework**: React 18.2
- **Audio**: Web Audio API
- **Build Tool**: TypeScript Compiler (tsc)
- **Testing**: Jest 29 with ts-jest
- **Linting**: ESLint with TypeScript and React plugins
- **Formatting**: Prettier

### Key Dependencies
- **Audio Processing**: Web Audio API (native browser)
- **Cloud Storage**: Firebase, Supabase, AWS S3
- **Social Backend**: Custom API service layer
- **React**: v18.2.0 with TypeScript support

### Node Version
- Minimum: Node.js 16.0.0+
- Recommended: Node.js 18+ or 20+

## Coding Standards

### TypeScript Guidelines
- **Strict Mode**: Always enabled (`strict: true` in tsconfig.json)
- **Type Safety**: Avoid `any` types; use explicit types or generics
- **Interfaces**: Prefer interfaces for object shapes and public APIs
- **Naming Conventions**:
  - Interfaces start with `I` (e.g., `IAudioEngine`, `IStorage`)
  - Types use PascalCase (e.g., `PadConfig`, `SoundPack`)
  - Functions and variables use camelCase
  - Constants use SCREAMING_SNAKE_CASE (e.g., `MAX_VOICES`)

### Code Style (Prettier)
- **Semicolons**: Always use semicolons
- **Quotes**: Single quotes for strings
- **Trailing Commas**: None
- **Print Width**: 100 characters
- **Tab Width**: 2 spaces
- **React JSX**: Use `react-jsx` transform (no need to import React)

### React Patterns
- **Functional Components**: Use hooks, avoid class components
- **Props**: Always type props interfaces explicitly
- **State Management**: Use React hooks (`useState`, `useEffect`, etc.)
- **No React Import**: React 18+ uses automatic JSX runtime

### Audio Programming Best Practices
- **Audio Context**: Always check for user gesture before starting audio
- **Voice Management**: Implement proper voice stealing for polyphony limits
- **Performance**: Keep audio processing on Web Audio API thread, never block the audio thread
- **Latency**: Target < 10ms trigger latency
- **Sample Rate**: Use native sample rate when possible

## Directory Structure

```
EchoForge/
├── .github/                     # GitHub configuration and CI/CD
│   └── copilot-instructions.md  # This file
├── src/                         # Source code
│   ├── core/                    # Core audio and project logic
│   │   ├── audio-engine/        # Real-time audio processing
│   │   │   ├── IAudioEngine.ts          # Engine interface (platform abstraction)
│   │   │   └── WebAudioEngine.ts        # Web Audio API implementation
│   │   ├── sound-packs/         # Sound pack management
│   │   │   └── SoundPackManager.ts      # Load/manage sound packs
│   │   ├── project/             # Project management
│   │   │   └── ProjectManager.ts        # Save/load/export projects
│   │   └── LooperApp.ts         # Main app orchestrator
│   ├── services/                # External service integrations
│   │   ├── api/                 # Backend API client
│   │   │   └── ApiService.ts            # Social platform API
│   │   └── storage/             # Local/cloud storage
│   │       └── StorageService.ts        # Storage abstraction layer
│   ├── ui/                      # User interface components
│   │   ├── components/          # Reusable UI components
│   │   │   ├── Pad.tsx                  # Individual pad button
│   │   │   ├── PadGrid.tsx              # Grid of pads (loop pad interface)
│   │   │   ├── PlaybackControls.tsx     # Transport controls
│   │   │   ├── SoundBrowser.tsx         # Sound selection UI
│   │   │   ├── TrackCard.tsx            # Track display card
│   │   │   ├── TrackFeed.tsx            # Social feed of tracks
│   │   │   └── UserProfile.tsx          # User profile display
│   │   └── screens/             # Full screen views
│   │       ├── StudioScreen.tsx         # Main music creation interface
│   │       └── SocialScreen.tsx         # Discovery & social features
│   ├── types/                   # TypeScript type definitions
│   │   ├── audio.types.ts       # Audio engine types
│   │   ├── project.types.ts     # Project & arrangement types
│   │   ├── soundpack.types.ts   # Sound pack types
│   │   └── social.types.ts      # Social platform types
│   ├── __tests__/               # Top-level tests
│   └── index.ts                 # Main entry point
├── examples/                    # Example code and usage
├── dist/                        # Compiled JavaScript output (git ignored)
├── node_modules/                # Dependencies (git ignored)
├── ARCHITECTURE.md              # Architecture deep dive
├── API_SPEC.md                  # Backend API specification
├── DOCUMENTATION.md             # Full documentation
├── README.md                    # Project overview
├── package.json                 # NPM dependencies and scripts
├── tsconfig.json                # TypeScript configuration
├── jest.config.js               # Jest test configuration
├── .eslintrc.json               # ESLint rules
├── .prettierrc                  # Prettier formatting rules
└── .gitignore                   # Git ignore patterns
```

### Important Directories
- **`src/core/`**: Pure business logic, platform-agnostic, no UI dependencies
- **`src/ui/`**: React components only, no direct audio manipulation
- **`src/services/`**: External integrations (API, storage, cloud services)
- **`src/types/`**: TypeScript type definitions, imported throughout codebase
- **`src/__tests__/`**: Integration and unit tests

## Build, Test, and Development

### Installation
```bash
npm install
```

### Development Mode
Watches for changes and recompiles automatically:
```bash
npm run dev
```

### Build
Compile TypeScript to JavaScript in `dist/` directory:
```bash
npm run build
```

### Testing
Run all Jest tests:
```bash
npm test
```

### Linting
Check code style and quality:
```bash
npm run lint
```

### Formatting
Auto-format code with Prettier:
```bash
npm run format
```

### Test Patterns
- Test files: `**/__tests__/**/*.test.ts` or `**/__tests__/**/*.test.tsx`
- Test environment: Node.js (for unit tests)
- Test framework: Jest with ts-jest preset
- Mock external dependencies (audio APIs, storage, etc.)

## Architecture Principles

### 1. Separation of Concerns
- **Audio Engine**: Completely isolated from UI, uses interface abstraction
- **Core Logic**: Platform-agnostic, works in browser, React Native, Electron
- **UI Components**: Pure React, no direct audio manipulation
- **Services**: External integrations abstracted behind interfaces

### 2. Platform Agnostic Core
- Core logic (audio-engine, project, sound-packs) has zero platform dependencies
- Use interfaces (e.g., `IAudioEngine`, `IStorage`) for platform-specific implementations
- Web Audio API is one implementation; others (Native, VST) possible

### 3. Modular Design
- Sound packs are plug-and-play modules
- Effects processors can be added without touching core
- Services (API, storage) are swappable via interfaces

### 4. Type Safety First
- Full TypeScript coverage with strict mode
- No `any` types in production code
- Explicit return types for all public APIs
- Comprehensive type definitions in `src/types/`

### 5. Performance Focus
- Audio processing isolated from UI thread
- Efficient voice management and garbage collection
- Target < 10ms latency for pad triggers
- Optimize for real-time audio performance

### 6. Clean Code
- Readable, self-documenting code
- Comprehensive JSDoc comments for public APIs
- Consistent naming conventions
- DRY (Don't Repeat Yourself) principle

## Loop Pad Specifics

### What is a "Loop Pad"?
A loop pad is an interactive button/trigger in the pad grid that:
- Plays audio samples when triggered (clicked/tapped)
- Can be configured with different sounds from sound packs
- Supports per-pad controls (volume, pitch, pan, effects)
- Operates in different playback modes (one-shot, loop, sustained)
- Syncs to project tempo with quantization

### Loop Pad Engine Components
1. **PadGrid.tsx**: Visual grid of pads (UI component)
2. **Pad.tsx**: Individual pad button (UI component)
3. **WebAudioEngine.ts**: Handles actual audio triggering
4. **PadConfig**: Type definition for pad configuration

### Ensuring Loop Pad Compatibility
- Always test audio triggering with user gesture (browser requirement)
- Maintain low latency (< 10ms) for responsive pad triggers
- Support polyphonic playback (multiple pads playing simultaneously)
- Implement proper voice stealing when hitting polyphony limits
- Keep audio processing separate from UI rendering

## External Resources

### Documentation
- [Full Documentation](./DOCUMENTATION.md) - Complete architecture and usage guide
- [API Specification](./API_SPEC.md) - Backend API endpoints and data models
- [Architecture Deep Dive](./ARCHITECTURE.md) - Detailed technical specifications

### Web Audio API References
- [MDN Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Web Audio API Specification](https://www.w3.org/TR/webaudio/)

### TypeScript
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

### Testing
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [ts-jest](https://kulshekhar.github.io/ts-jest/)

## Common Workflows

### Adding a New Sound Pack
1. Create JSON file in sound pack format (see `src/types/soundpack.types.ts`)
2. Register pack in `SoundPackManager.ts`
3. Add metadata (name, categories, author, license)
4. Test loading and playback

### Adding a New Effect Processor
1. Define effect type in `src/types/audio.types.ts`
2. Implement effect in `WebAudioEngine.ts` using Web Audio nodes
3. Add UI controls in relevant component
4. Update `PadConfig` type if needed

### Creating a New UI Component
1. Create `.tsx` file in `src/ui/components/`
2. Use functional component with typed props
3. Export from `src/ui/components/index.ts`
4. Follow React 18+ patterns (hooks, no React import)

### Debugging Audio Issues
1. Check browser console for Web Audio API errors
2. Verify audio context state (suspended vs running)
3. Check user gesture requirement (audio must start after click)
4. Monitor voice count and polyphony limits
5. Use performance metrics from audio engine

## Important Notes

### Browser Compatibility
- Web Audio API requires modern browsers (Chrome 34+, Firefox 31+, Safari 14.1+)
- User gesture required to start audio context (browser security policy)
- Test across different browsers and platforms

### Performance Optimization
- Avoid allocations in audio callback
- Reuse audio nodes when possible
- Profile audio thread performance
- Monitor CPU usage and latency

### Security & Privacy
- Never commit API keys or secrets
- Sanitize user inputs (especially file uploads)
- Follow OWASP guidelines for web security
- Use environment variables for sensitive config

## Tips for GitHub Copilot

### When suggesting audio code:
- Always consider Web Audio API best practices
- Check for audio context state before operations
- Maintain voice management and polyphony limits
- Keep latency minimal (< 10ms target)

### When suggesting React code:
- Use functional components with hooks
- Type all props and state explicitly
- Don't import React (using automatic JSX runtime)
- Follow existing component patterns

### When suggesting new features:
- Check existing types in `src/types/` first
- Follow the modular architecture (core/services/ui separation)
- Add appropriate error handling
- Consider platform-agnostic design

### When fixing bugs:
- Look at related test files first
- Check TypeScript compiler errors
- Run linter before suggesting fixes
- Maintain existing code style and patterns
