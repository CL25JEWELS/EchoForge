# Bolt's Journal

## 2024-05-22 - [Example Entry]
**Learning:** This is an example entry.
**Action:** Use this format for future entries.

## 2026-01-18 - React.FC and React.memo Type Mismatch
**Learning:** Explicitly typing a component with `React.FC` when wrapping it in `React.memo` causes a type mismatch because `React.memo` returns a `NamedExoticComponent`.
**Action:** Let TypeScript infer the return type of memoized components or use `React.NamedExoticComponent` if explicit typing is necessary.

## 2025-05-23 - Pagination Loading State
**Learning:** Using a shared `loading` state for both initial load and pagination causes the entire list to unmount/remount during "Load More", destroying DOM and scroll position.
**Action:** Always use a separate `loadingMore` state for pagination to keep the list mounted while fetching new data.
