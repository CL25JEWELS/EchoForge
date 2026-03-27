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

## 2025-10-27 - Expensive Derived State in High-Frequency Render Loop
**Learning:** The `StudioScreen` drives a 50ms render loop for audio visualization. Child components like `SoundBrowser` were performing expensive `flatMap` operations on every render. Even with `React.memo`, if the component re-renders (e.g., due to local state like search input), these expensive calculations re-run unnecessarily.
**Action:** Always wrap expensive array operations (like `flatMap` over nested collections) in `useMemo`, and wrap the component in `React.memo` to protect it from the parent's high-frequency render loop.
