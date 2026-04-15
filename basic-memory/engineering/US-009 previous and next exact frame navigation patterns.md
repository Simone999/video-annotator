---
title: US-009 previous and next exact frame navigation patterns
type: note
permalink: video-annotator/engineering/us-009-previous-and-next-exact-frame-navigation-patterns
tags:
- frontend
- milestone-01
- exact-frame
- navigation
- testing
---

# US-009 previous and next exact frame navigation patterns

Milestone-01 exact-frame navigation now includes previous and next actions that stay tied to the backend exact-frame fetch path instead of mutating UI-only frame state. The selected video's persisted `frame_count` remains the source for nav bounds, while canonical `currentFrameIndex` still changes only after `loadExactFrame` succeeds. This keeps the frame label, jump input, and rendered image aligned around backend truth even when users step repeatedly at the edges.

## Observations
- [pattern] Prev/next exact-frame controls should clamp target indices with selected video `frame_count` and disable boundary buttons instead of issuing redundant backend requests #frontend #ux
- [pattern] Frame stepping should reuse the same backend exact-frame fetch path as jump-to-frame so canonical state, blob state, and rendered image stay in sync #frontend #state
- [technique] UI tests for stepped navigation should wait for the input-sync effect after the canonical frame label changes, because the input value updates on a later render than the successful fetch #testing #vitest
- [technique] Browser verification can intercept `/api/videos`, `/api/videos/:id`, `/api/videos/:id/source`, and `/api/videos/:id/frame/:frame_idx`, then assert disabled nav buttons at frame `0` and `frame_count - 1` #playwright #verification

## Relations
- extends [[US-008 exact frame pane and jump input patterns]]
- relates_to [[frontend/src/app/App.tsx]]
- relates_to [[frontend/src/app/App.test.tsx]]
- relates_to [[docs/engineering/architecture.md]]
- relates_to [[tools/ralph/progress]]