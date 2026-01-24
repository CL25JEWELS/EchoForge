# Bolt's Journal

## 2024-05-22 - [Example Entry]
**Learning:** This is an example entry.
**Action:** Use this format for future entries.

## 2026-01-18 - React.FC and React.memo Type Mismatch
**Learning:** Explicitly typing a component with `React.FC` when wrapping it in `React.memo` causes a type mismatch because `React.memo` returns a `NamedExoticComponent`.
**Action:** Let TypeScript infer the return type of memoized components or use `React.NamedExoticComponent` if explicit typing is necessary.

## 2024-06-25 - Polling State Updates in React
**Learning:** `StudioScreen` uses a `setInterval` loop to update pad states from the audio engine, causing the entire screen to re-render every ~50ms during playback. This makes `React.memo` optimization of child components (like `SoundBrowser` and `PadGrid`) absolutely critical to prevent performance degradation, especially for components doing expensive calculations.
**Action:** Always check for polling mechanisms in parent components and aggressively memoize expensive children and their props (using `useCallback`, `useMemo`) to isolate them from the polling cycle.
