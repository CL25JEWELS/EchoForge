# Bolt's Journal

## 2024-05-22 - [Example Entry]
**Learning:** This is an example entry.
**Action:** Use this format for future entries.

## 2024-05-24 - [React List Performance]
**Learning:** `TrackFeed` was creating inline arrow functions for every `TrackCard`, defeating memoization.
**Action:** Pass `trackId` to `TrackCard` callbacks and use stable handlers in parent to enable effective `React.memo`.

## 2024-05-24 - [ESLint and Memo]
**Learning:** `React.memo` components lose their name inference in this build setup, triggering `react/display-name`.
**Action:** Explicitly set `displayName` on memoized components.
