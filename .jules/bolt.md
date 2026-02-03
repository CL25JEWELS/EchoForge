# Bolt's Journal

## 2024-05-22 - [Example Entry]
**Learning:** This is an example entry.
**Action:** Use this format for future entries.

## 2026-01-18 - React.FC and React.memo Type Mismatch
**Learning:** Explicitly typing a component with `React.FC` when wrapping it in `React.memo` causes a type mismatch because `React.memo` returns a `NamedExoticComponent`.
**Action:** Let TypeScript infer the return type of memoized components or use `React.NamedExoticComponent` if explicit typing is necessary.

## 2024-02-03 - Stabilizing Service References
**Learning:** Service instances retrieved via getter methods (e.g., `app.getAudioEngine()`) inside a component's render body will be re-evaluated on every render. If these instances are used as dependencies for `useCallback` or `useMemo`, they may trigger unnecessary updates even if the underlying `app` instance is stable.
**Action:** Wrap service retrieval in `useMemo` with the provider (e.g., `app`) as a dependency to ensure stable references.
