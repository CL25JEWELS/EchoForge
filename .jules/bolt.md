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

## 2025-05-23 - StudioScreen Re-render Cascade
**Learning:** High-frequency state updates (e.g., every 50ms) in a main screen component like `StudioScreen` can cause a massive re-render cascade of the entire UI tree. Even if child components are memoized, they will re-render if the parent provides fresh function references or non-stabilized objects as props.
**Action:** Always stabilize service instances from props with `useMemo`, wrap all event handlers in `useCallback` (using functional updates to keep dependencies stable), and memoize any derived data calculations (flatMap, filter, etc.) to ensure that child components' `React.memo` checks actually pass.
