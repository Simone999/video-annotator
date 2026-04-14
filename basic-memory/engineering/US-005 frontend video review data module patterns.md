---
title: US-005 frontend video review data module patterns
type: note
permalink: video-annotator/engineering/us-005-frontend-video-review-data-module-patterns
tags:
- frontend
- milestone-01
- api
- state
---

# US-005 frontend video review data module patterns

## Summary
Milestone-01 frontend now has a `frontend/src/features/video-review` module that owns typed list/detail/frame requests plus feature-scoped selected-video and canonical frame-index state.

## Learnings
- Parse backend JSON inside the feature API client with runtime assertions before values enter React state or presentation code.
- Keep exact-frame requests binary and typed as `image/png` blobs; UI rendering code can decide later whether to create object URLs.
- Keep canonical `currentFrameIndex` in feature state and reset it when the selected video changes so later jump/step controls start from backend-owned state.

## Related
- [[frontend/src/features/video-review/api.ts]]
- [[frontend/src/features/video-review/state.ts]]
- [[tools/ralph/progress]]