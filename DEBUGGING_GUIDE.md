# 🔧 EchoForge Debugging Guide

Debugging this browser DAW isn't one thing — it's **4 different layers**:

1. 🎛 Audio engine (real-time timing & sound)
2. 🧠 Core logic (project + sound packs)
3. 🎨 React UI
4. 🌐 API / backend

If you debug this randomly, you'll drown. So let's do this like a producer — **solo each track**.

---

## 🧭 The Debug Strategy (Layer by Layer)

### 1️⃣ Debug the Audio Engine First (Most Critical)

This is your heart. If timing is off, the whole app feels broken.

#### 🎧 Step 1: Check Debug Logging

The audio engine now includes comprehensive debug logging. Open Chrome DevTools → Console and look for:

```
[AudioEngine] Initialized with configuration:
[AudioEngine]   Sample rate: 48000
[AudioEngine]   Latency hint: interactive
[AudioEngine]   Base latency: 0.003 seconds
[AudioEngine]   State: running
```

#### 🎧 Step 2: Monitor Pad Triggers

When you tap pads, watch the console:

```
[Pad] Clicked: pad-0
[AudioEngine] Trigger pad: pad-0 at 1.234s
[AudioEngine]   Current time: 1.234s
[AudioEngine]   BPM: 120
[AudioEngine]   Quantize grid: 16
[AudioEngine]   Quantize enabled: true
```

Check:
* Is it triggering instantly?
* Is `currentTime` increasing smoothly?
* Are quantized triggers delayed correctly?

#### 🎧 Step 3: Enable the Debug Panel

Click the "🔧 Show Debug" button in the Studio Screen to display real-time metrics:

- **BPM**: Current tempo
- **Current Time**: Web Audio clock time
- **Current Beat**: Current beat position
- **Time Signature**: Numerator/denominator
- **Quantize Grid**: Quantization setting
- **Active Pads**: Which pads are playing
- **Active Voices**: Number of playing sounds
- **CPU Usage**: Engine load estimate
- **Latency**: AudioContext latency
- **Dropouts**: Audio glitches count

#### 👉 If pads feel late:

Check that the AudioContext is using `interactive` latency mode (already configured in the code):

```ts
new AudioContext({ latencyHint: 'interactive' })
```

---

### 2️⃣ Debug Timing (Quantization Issues)

Real-time audio bugs are usually **math bugs**.

If you're quantizing to 16th notes:

```ts
const secondsPerBeat = 60 / bpm;
const sixteenth = secondsPerBeat / 4;
```

Example:
- If BPM = 120
- 60 / 120 = 0.5 seconds per beat
- 0.5 / 4 = **0.125 seconds per 16th**

If your math doesn't match that, timing will drift.

👉 Use Chrome DevTools → Sources → set breakpoints in:

```ts
triggerPad(padId, options) {
  debugger;  // Breakpoint here
}
```

Then step through the quantization logic.

---

### 3️⃣ Debug React UI (Pad Not Responding?)

If a pad visually presses but doesn't play:

The Pad component now logs clicks:

```
[Pad] Clicked: pad-0
```

**If you see the click log but no sound:**
→ Audio layer issue (check if sound is loaded)

**If you don't see the click log:**
→ React event wiring issue (check event handlers)

---

### 4️⃣ Debug Sound Packs (Common Silent Bug)

When loading sounds, check the console for:

```
[SoundPackManager] Preloading 3 sounds from pack: Starter Pack
[AudioEngine] Fetching sound: Kick 1 from /sounds/kick-01.wav
[AudioEngine] Fetched 44100 bytes for Kick 1
[AudioEngine] Loaded sound: Kick 1 (kick-01)
[AudioEngine]   Duration: 0.500s
[AudioEngine]   Channels: 2
[AudioEngine]   Sample rate: 44100Hz
```

Silent pad usually means:
- Fetch returned non-200 status
- `decodeAudioData` failed
- AudioBuffer is empty

The enhanced error handling now logs:

```
[AudioEngine] Failed to load sound: kick-01
[AudioEngine]   URL: /sounds/kick-01.wav
[AudioEngine]   Error: HTTP 404: Not Found
```

---

### 5️⃣ Debug Project Save/Load

If state doesn't restore correctly, check the console:

```
[ProjectManager] Saved project: My Project
[ProjectManager] Project data: {
  "project": {
    "id": "project-123",
    "name": "My Project",
    "tempo": { "bpm": 120, ... },
    ...
  }
}
```

Then reload and compare:

```
[ProjectManager] Loading project from data: { ... }
[ProjectManager] Loaded project: My Project
[ProjectManager]   Tempo: 120 BPM
[ProjectManager]   Pads: 16
[ProjectManager]   Master volume: 0.8
```

You're looking for:
- Missing pad effects
- Incorrect tempo
- Layout mismatch

---

### 6️⃣ Debug API Upload Issues

When uploading tracks, check the console:

```
[ApiService] Uploading track: My Track
[ApiService]   Audio size: 1234567 bytes
[ApiService]   JWT attached: true
[ApiService]   Endpoint: https://api.example.com/tracks
[ApiService] Upload response status: 200 OK
[ApiService] Upload successful: { ... }
```

Open DevTools → Network tab and check:

- Status code (200? 401? 500?)
- Is JWT attached?
- Is audioBlob actually non-empty?

A valid MP3 export should be at least several KB.

---

## 🎯 Pro Debug Setup (VS Code)

The repository now includes `.vscode/launch.json` with two configurations:

### Debug Full App

Press F5 → select "Debug Full App"

This runs `npm run dev` with debugging enabled.

Set breakpoints in:
- `src/core/audio-engine/WebAudioEngine.ts`
- `src/core/project/ProjectManager.ts`
- `src/services/api/ApiService.ts`

### Debug Tests

Select "Debug Tests" configuration to debug Jest tests with breakpoints.

---

## 🧪 What You Should Debug First (Priority Order)

If building this for production:

1. ✅ Pad triggering timing
2. ✅ Quantization accuracy
3. ✅ Sound pack preload reliability
4. ✅ Project save/load symmetry
5. ✅ Audio export integrity
6. ✅ API upload

**Do NOT build social features further until audio core is rock solid.**

---

## 🚨 Common Bugs You WILL Hit

| Problem | Cause | Solution |
|---------|-------|----------|
| First pad press delayed | Browser requires user interaction to unlock audio context | Add click handler to resume AudioContext |
| Sound plays twice | React StrictMode double render | Use useEffect cleanup or refs to prevent |
| Pads drift over time | Not scheduling ahead using Web Audio clock | Use `audioContext.currentTime` for scheduling |
| Export sounds different | OfflineAudioContext mismatch | Match settings between realtime and offline contexts |
| Remix loses data | Mutating project object instead of cloning | Use spread operators or deep clone |

---

## 📊 Using the Debug Panel

The Debug Panel shows real-time metrics in the corner of the Studio Screen:

1. Click "🔧 Show Debug" button
2. Watch metrics update in real-time (50ms polling)
3. Monitor for anomalies:
   - Latency spikes
   - CPU usage peaks
   - Dropout counts

**Pro Tip:** Keep the debug panel open during development and testing.

---

## 🔍 Console Logging Reference

All major components use tagged console logging:

- `[AudioEngine]` - Web Audio API operations
- `[SoundPackManager]` - Sound pack loading
- `[ProjectManager]` - Project save/load
- `[ApiService]` - API requests
- `[Pad]` - UI interactions

Filter console by tag to focus on specific layers.

---

You're not building a toy. You're building a **browser DAW + remix social network**.

Debug like a pro. 🎧

---

## 🎯 Quick Reference: Debug Commands

### Enable Debug Panel in UI
```typescript
// Click the "🔧 Show Debug" button in Studio Screen
// Or programmatically:
setShowDebugPanel(true);
```

### Browser DevTools Console Filtering

Use the built-in filter feature in browser DevTools Console to focus on specific subsystems:

**In Chrome DevTools Console:**

1. Open Console tab (F12 → Console)
2. Locate the filter input field at the top of the console
3. Type the tag you want to filter by

**Examples:**
- Type `[AudioEngine]` to show only audio engine logs
- Type `[ApiService]` to show only API logs  
- Type `[Pad]` to show pad interactions

**Programmatically control logging in your code:**

```javascript
// Use environment variables or flags to control logging
const DEBUG_AUDIO = true;

if (DEBUG_AUDIO) {
  console.log('[AudioEngine]', 'Debug info');
}
```

### Browser DevTools Network Tab

When debugging API issues:

1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "Fetch/XHR"
4. Look for:
   - Request headers (especially Authorization)
   - Request payload
   - Response status
   - Response body

### Performance Profiling

To debug audio performance issues:

1. Open Chrome DevTools
2. Go to Performance tab
3. Click Record
4. Trigger pads / play music
5. Stop recording
6. Look for:
   - Long tasks (>50ms)
   - Layout thrashing
   - Script execution time

---

## 📝 Development Notes

### Code Style

All debug logs follow this pattern:

```typescript
console.log('[ComponentName] Action description:', data);
console.error('[ComponentName] Error description:', error);
console.warn('[ComponentName] Warning description:', data);
```

This makes it easy to filter logs by component.

### Performance Considerations

The Debug Panel polls at 50ms intervals. This is acceptable for development but should be disabled in production builds.

### Security Note

Debug logs may contain sensitive information. Always disable verbose logging in production builds. Consider using environment variables:

```typescript
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  console.log('[AudioEngine] Debug info:', sensitiveData);
}
```

---

## 🚀 Production Checklist

Before deploying to production:

- [ ] Disable debug panel by default
- [ ] Remove or gate verbose console logging
- [ ] Test with React StrictMode disabled
- [ ] Verify AudioContext latency settings
- [ ] Test on multiple browsers (Chrome, Firefox, Safari)
- [ ] Test on mobile devices
- [ ] Profile for memory leaks
- [ ] Test with real network conditions (throttling)

---

## 📚 Additional Resources

- [Web Audio API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Chrome DevTools Guide](https://developer.chrome.com/docs/devtools/)
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Performance Best Practices](https://web.dev/performance/)

---

**Happy Debugging! 🎧**

---

## 🔒 Production-Safe Debug Logging

The codebase uses an environment-aware debug logging utility (`src/utils/debug.ts`) that automatically gates verbose logs based on the environment:

### Debug Utility API

```typescript
import { debugLog } from '../utils/debug';

// Only logs in development mode
debugLog.log('AudioEngine', 'Verbose debug info', data);
debugLog.error('AudioEngine', 'Debug error', error);
debugLog.warn('AudioEngine', 'Debug warning', data);

// Always logs regardless of environment (for critical errors)
debugLog.alwaysError('AudioEngine', 'Critical error', error);
debugLog.alwaysWarn('AudioEngine', 'Important warning', data);
```

### Hot Path Considerations

Performance-critical code paths (like pad triggering) use `debugLog.log()` which is automatically disabled in production builds. This prevents:

- Console spam in production
- Performance overhead from string interpolation
- Potential memory leaks from excessive logging

### Environment Configuration

The debug mode is automatically detected based on your build environment:

```typescript
// For traditional bundlers (Webpack, etc.)
process.env.NODE_ENV === 'development'

// For Vite
import.meta.env.MODE === 'development'
```

The debug utility checks both, so it works with any bundler. Set the environment in your build configuration or `.env` file:

```bash
# .env.development
NODE_ENV=development

# For Vite
MODE=development

# .env.production  
NODE_ENV=production

# For Vite
MODE=production
```

---
