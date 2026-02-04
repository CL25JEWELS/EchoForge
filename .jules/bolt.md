# Bolt's Journal

## 2024-05-22 - [Example Entry]
**Learning:** This is an example entry.
**Action:** Use this format for future entries.

## 2025-02-04 - Stabilizing Services and Callbacks in High-Frequency Screens
**Learning:** In screens with high-frequency state updates (e.g., 50ms ticks), child components will re-render unnecessarily if props or services are not stabilized. Even if a service instance is conceptually stable, retrieving it via a method call (e.g., `app.getAudioEngine()`) in the render body creates a dependency that can trigger re-renders or hook invalidation if not wrapped in `useMemo`.
**Action:** Always memoize service instances with `useMemo` and wrap all callbacks in `useCallback` when they are passed to memoized children in high-frequency update screens like `StudioScreen`.

## 2026-01-18 - React.FC and React.memo Type Mismatch
**Learning:** Explicitly typing a component with `React.FC` when wrapping it in `React.memo` causes a type mismatch because `React.memo` returns a `NamedExoticComponent`.
**Action:** Let TypeScript infer the return type of memoized components or use `React.NamedExoticComponent` if explicit typing is necessary.

## 2025-05-22 - Audio vs Visual Prop Separation
**Learning:** Audio applications often have high-frequency state updates (like pan or filter automation) that are processed by the audio engine but not visualized on every component. Passing these props to UI components causes unnecessary re-renders if standard shallow comparison is used.
**Action:** Use custom `arePropsEqual` functions in `React.memo` to explicitly ignore audio-only properties that don't affect the visual rendering, ensuring the UI only updates when strictly necessary.
