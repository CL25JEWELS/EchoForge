# Bolt's Journal

## 2024-05-22 - [Example Entry]
**Learning:** This is an example entry.
**Action:** Use this format for future entries.

## 2025-05-22 - [List Optimization Pattern]
**Learning:** When optimizing React lists, simply wrapping the item component in `React.memo` is insufficient if the parent passes inline arrow functions (e.g., `onPlay={() => handlePlay(id)}`). This breaks referential equality.
**Action:** Refactor the child component to accept the ID-based callback signature directly (e.g., `onPlay(id)`) so the parent can pass the stable handler reference (e.g., `onPlay={handlePlay}`).
