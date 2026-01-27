# Bolt's Journal

## 2024-05-22 - [Example Entry]
**Learning:** This is an example entry.
**Action:** Use this format for future entries.

## 2026-01-18 - React.FC and React.memo Type Mismatch
**Learning:** Explicitly typing a component with `React.FC` when wrapping it in `React.memo` causes a type mismatch because `React.memo` returns a `NamedExoticComponent`.
**Action:** Let TypeScript infer the return type of memoized components or use `React.NamedExoticComponent` if explicit typing is necessary.

## 2026-01-27 - List Unmounting on Pagination
**Learning:** Using a single `loading` state for both initial load and pagination ("Load More") causes the entire list to unmount and remount when loading more items. This destroys the DOM and scroll position, leading to poor performance and UX.
**Action:** Implement a separate `loadingMore` state for pagination. Ensure the list remains mounted while fetching additional data, and use `useCallback` for handlers to prevent re-rendering existing list items.
