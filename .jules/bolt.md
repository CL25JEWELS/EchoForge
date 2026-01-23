# Bolt's Journal

## 2024-05-22 - [Example Entry]
**Learning:** This is an example entry.
**Action:** Use this format for future entries.

## 2026-01-18 - React.FC and React.memo Type Mismatch
**Learning:** Explicitly typing a component with `React.FC` when wrapping it in `React.memo` causes a type mismatch because `React.memo` returns a `NamedExoticComponent`.
**Action:** Let TypeScript infer the return type of memoized components or use `React.NamedExoticComponent` if explicit typing is necessary.

## 2025-02-15 - Unstable Callbacks Defeat React.memo
**Learning:** `SocialScreen` was passing inline functions to `TrackFeed`, causing it (and its children) to re-render on every state change (e.g. `loading` toggle), negating the benefits of `React.memo` on children.
**Action:** Always wrap handlers passed to list components in `useCallback` to ensure reference stability, otherwise `React.memo` is useless.
