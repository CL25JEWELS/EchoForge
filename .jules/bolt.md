# Bolt's Journal

## 2024-05-22 - [Example Entry]
**Learning:** This is an example entry.
**Action:** Use this format for future entries.

## 2026-01-18 - React.FC and React.memo Type Mismatch
**Learning:** Explicitly typing a component with `React.FC` when wrapping it in `React.memo` causes a type mismatch because `React.memo` returns a `NamedExoticComponent`.
**Action:** Let TypeScript infer the return type of memoized components or use `React.NamedExoticComponent` if explicit typing is necessary.

## 2025-05-22 - Audio vs Visual Prop Separation
**Learning:** Audio applications often have high-frequency state updates (like pan or filter automation) that are processed by the audio engine but not visualized on every component. Passing these props to UI components causes unnecessary re-renders if standard shallow comparison is used.
**Action:** Use custom `arePropsEqual` functions in `React.memo` to explicitly ignore audio-only properties that don't affect the visual rendering, ensuring the UI only updates when strictly necessary.

## 2025-06-25 - Polling Architecture & Child Re-renders
**Learning:** The application uses a 50ms interval in `StudioScreen` to poll audio engine state (`padStates`). This triggers frequent re-renders of the parent component. Without `React.memo` and stable props (via `useMemo`/`useCallback`), all child components (even heavy ones like `SoundBrowser`) re-render on every tick, causing significant performance degradation.
**Action:** When working in the main screen loop, aggressively memoize all child components and ensure all props passed to them (including arrays and callbacks) are stable references.
