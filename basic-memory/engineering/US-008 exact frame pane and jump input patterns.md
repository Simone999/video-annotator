---
title: US-008 exact frame pane and jump input patterns
type: note
permalink: video-annotator/engineering/us-008-exact-frame-pane-and-jump-input-patterns
tags:
- frontend
- milestone-01
- exact-frame
- testing
---

# US-008 exact frame pane and jump input patterns

Milestone-01 exact-frame review now renders a dedicated pane with a frame-number form, a backend-loaded PNG preview, and browser verification of the jump flow. The feature workspace still owns selected-video state, canonical `currentFrameIndex`, and exact-frame fetch status, while the rendered component owns blob URL creation and cleanup for the displayed `<img>`. This keeps backend frame index as annotation truth without leaking browser image URL lifecycle into shared state.

## Observations
- [pattern] Keep exact-frame request status and returned blob in `frontend/src/features/video-review/workspace.ts`, then create and revoke object URLs in the component that renders the image #frontend #state
- [pattern] Treat jump-to-frame input as draft UI state; only update canonical `currentFrameIndex` after backend exact-frame request succeeds #frontend #ux
- [technique] Frontend tests can stub `URL.createObjectURL` and `URL.revokeObjectURL` to verify repeated same-frame reloads without real media fixtures #testing #vitest
- [technique] Playwright browser verification for exact-frame UI can intercept `/api/videos`, `/api/videos/:id`, `/api/videos/:id/frame/:frame_idx`, and `/api/videos/:id/source` together, then assert the canonical frame label and exact-frame image render #playwright #verification

## Relations
- extends [[US-007 playback pane and metadata panel patterns]]
- extends [[US-006 frontend video list selection patterns]]
- relates_to [[frontend/src/app/App.tsx]]
- relates_to [[frontend/src/features/video-review/workspace.ts]]
- relates_to [[tools/ralph/progress]]