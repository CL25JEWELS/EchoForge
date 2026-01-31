# Bolt's Journal

## 2024-05-22 - [Example Entry]
**Learning:** This is an example entry.
**Action:** Use this format for future entries.

## 2026-01-18 - React.FC and React.memo Type Mismatch
**Learning:** Explicitly typing a component with `React.FC` when wrapping it in `React.memo` causes a type mismatch because `React.memo` returns a `NamedExoticComponent`.
**Action:** Let TypeScript infer the return type of memoized components or use `React.NamedExoticComponent` if explicit typing is necessary.

## 2026-01-18 - Stable Callbacks with Functional State Updates
**Learning:** When using `useCallback` to stabilize event handlers for memoized children, if the handler needs to update state based on its current value (e.g., toggling or merging objects), using functional updates (`setState(prev => ...)`) removes the state itself from the dependency array, ensuring the callback reference remains stable.
**Action:** Prefer functional state updates inside `useCallback` to maximize stability of child component props.
