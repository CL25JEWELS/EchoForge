# Bolt's Journal

## 2024-05-22 - [Example Entry]
**Learning:** This is an example entry.
**Action:** Use this format for future entries.

## 2026-01-18 - React.FC and React.memo Type Mismatch
**Learning:** Explicitly typing a component with `React.FC` when wrapping it in `React.memo` causes a type mismatch because `React.memo` returns a `NamedExoticComponent`.
**Action:** Let TypeScript infer the return type of memoized components or use `React.NamedExoticComponent` if explicit typing is necessary.

## 2024-05-23 - Unstable Callbacks Break React.memo
**Learning:** Even if a child component is wrapped in `React.memo`, it will re-render if the parent passes new function references (callbacks) on every render.
**Action:** Always memoize callbacks (`useCallback`) in the parent component when passing them to memoized children to ensure `React.memo` effectively prevents re-renders.
