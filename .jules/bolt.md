# Bolt's Journal

## 2024-05-22 - [Example Entry]
**Learning:** This is an example entry.
**Action:** Use this format for future entries.

## 2026-01-18 - React.FC and React.memo Type Mismatch
**Learning:** Explicitly typing a component with `React.FC` when wrapping it in `React.memo` causes a type mismatch because `React.memo` returns a `NamedExoticComponent`.
**Action:** Let TypeScript infer the return type of memoized components or use `React.NamedExoticComponent` if explicit typing is necessary.

## 2026-02-12 - Pure State Updaters
**Learning:** Placing side effects (like service calls) inside `setState` functional updaters is a performance anti-pattern and violates React's pure-function contract for updaters. This can lead to unpredictable behavior if React re-runs the updater.
**Action:** Keep state updaters pure. Perform side effects in `useEffect` or directly in the event handler after the state update has been scheduled.
