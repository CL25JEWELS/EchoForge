# Bolt's Journal

## 2024-05-22 - [Example Entry]
**Learning:** This is an example entry.
**Action:** Use this format for future entries.

## 2026-01-18 - React.FC and React.memo Type Mismatch
**Learning:** Explicitly typing a component with `React.FC` when wrapping it in `React.memo` causes a type mismatch because `React.memo` returns a `NamedExoticComponent`.
**Action:** Let TypeScript infer the return type of memoized components or use `React.NamedExoticComponent` if explicit typing is necessary.

## 2024-06-25 - Expensive Derivations in Render
**Learning:** The `SoundBrowser` component was re-calculating `flatMap` on `soundPacks` (potentially large dataset) on every keystroke of the search input.
**Action:** Watch for heavy array operations (flatMap, filter, map) on `SoundPack` or `Track` arrays inside components and aggressively memoize them.
