# Bolt's Journal

## 2024-05-22 - [Example Entry]
**Learning:** This is an example entry.
**Action:** Use this format for future entries.

## 2026-01-18 - React.FC and React.memo Type Mismatch
**Learning:** Explicitly typing a component with `React.FC` when wrapping it in `React.memo` causes a type mismatch because `React.memo` returns a `NamedExoticComponent`.
**Action:** Let TypeScript infer the return type of memoized components or use `React.NamedExoticComponent` if explicit typing is necessary.

## 2026-02-01 - Unit Testing React.memo Comparison
**Learning:** In a Node.js-only test environment where component rendering is restricted, exporting the custom comparison function (e.g., `areEqual`) from a `React.memo` wrapper allows for direct unit testing of memoization logic.
**Action:** Export comparison functions from memoized components to verify optimization logic without mounting components.
