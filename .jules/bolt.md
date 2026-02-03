# Bolt's Journal

## 2024-05-22 - [Example Entry]
**Learning:** This is an example entry.
**Action:** Use this format for future entries.

## 2026-01-18 - React.FC and React.memo Type Mismatch
**Learning:** Explicitly typing a component with `React.FC` when wrapping it in `React.memo` causes a type mismatch because `React.memo` returns a `NamedExoticComponent`.
**Action:** Let TypeScript infer the return type of memoized components or use `React.NamedExoticComponent` if explicit typing is necessary.

## 2026-06-15 - List Unmounting on Pagination
**Learning:** Using a single `loading` state for both initial fetch and pagination ("load more") causes the entire list to unmount and remount, destroying DOM state and scroll position.
**Action:** Introduce a separate `loadingMore` state for pagination. Ensure the main render condition `loading ?` only checks the initial loading state, allowing the list to remain mounted while `loadingMore` is active.
