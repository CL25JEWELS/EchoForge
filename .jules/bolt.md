# Bolt's Journal

## 2024-05-22 - [Example Entry]
**Learning:** This is an example entry.
**Action:** Use this format for future entries.

## 2024-06-25 - React List Optimization Pattern
**Learning:** Inline arrow functions in `map` loops (e.g., `onPlay={() => handlePlay(id)}`) destroy reference equality, forcing child components to re-render even if wrapped in `React.memo`.
**Action:** Define child callback props to accept an ID (e.g., `onPlay: (id: string) => void`) and pass the parent's handler directly. This restores reference stability and enables `React.memo` to work effectively.
