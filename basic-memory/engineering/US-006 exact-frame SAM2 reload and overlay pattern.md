---
title: US-006 exact-frame SAM2 reload and overlay pattern
type: note
permalink: video-annotator/engineering/us-006-exact-frame-sam2-reload-and-overlay-pattern
tags:
- frontend
- sam2
- annotations
- playwright
---

# US-006 exact-frame SAM2 reload and overlay pattern

## Summary
Same-frame SAM2 UI now draws box gestures on the displayed exact-frame image, auto-creates or reuses a SAM2 session on `Run SAM2`, and reloads persisted masks from backend annotation read routes instead of trusting prompt response state as durable truth.

## Learnings
- Fetch `/api/videos/{video_id}/frame/{frame_idx}` and `/api/videos/{video_id}/annotations/frame/{frame_idx}` together when exact-frame state changes; keep image blob in workspace hook state, but treat annotation readback as persisted source of overlay truth.
- Render persisted mask overlays through `/api/videos/{video_id}/annotations/frame/{frame_idx}/object/{object_id}/mask` so Vite proxy keeps requests under `/api` and frontend does not need direct filesystem/static access.
- Keep active pointer-drag gesture local to the exact-frame canvas component, but store only normalized draft box data in feature state. Convert normalized box fractions back to canonical backend pixel coordinates only when sending prompt-box API requests.
- In Playwright verification, the mocked exact-frame PNG can be tiny; set an explicit canvas size in the test before dispatching pointer events or the draw box gesture collapses to a 1px-wide target.

## Evidence
- Repo checks: `npm run typecheck`, `npm run lint`, `npm run test`
- Browser verification: mocked Vite + Playwright flow confirmed two annotation reads, mask overlay reload, and object mask URL `/api/videos/video-123/annotations/frame/7/object/object-1/mask`
- Screenshot: `/tmp/us006-run-sam2.png`

## Related
- [[frontend/src/features/video-review/exact-frame-canvas.tsx]]
- [[frontend/src/features/video-review/workspace.ts]]
- [[backend/app/api/videos.py]]
- [[tools/ralph/progress]]