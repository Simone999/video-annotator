---
title: US-003 SAM2 prompt-box persistence patterns
type: note
permalink: video-annotator/engineering/us-003-sam2-prompt-box-persistence-patterns
tags:
- backend
- sam2
- annotations
- testing
---

# US-003 SAM2 prompt-box persistence patterns

Backend `POST /api/videos/{video_id}/sam2/prompt-box` now treats backend frame index as canonical, calls isolated SAM2 adapter for one same-frame mask, persists mask PNG on local disk, and upserts one `FrameAnnotation` row keyed by `(video_id, frame_idx, object_id)`.

## Observations
- [pattern] Prompt-box route parses request payload at FastAPI/Pydantic boundary and returns stored annotation metadata instead of raw adapter internals #api #sam2
- [pattern] Normalize `box_xyxy_px` against persisted `Video.width` and `Video.height` before saving annotation metadata #annotations
- [pattern] Persist mask files under `APP_MASKS_DIR` or repo-default `masks/`, then store relative path like `masks/<video_id>/<object_id>/frame_<idx>.png` in SQLite #storage
- [pattern] Prompt and propagation writes should upsert one row per `(video_id, frame_idx, object_id)` so sibling annotations on same frame survive #data-model
- [gotcha] Backend API tests that persist mask files must set `APP_MASKS_DIR` to a temp dir before `create_app()` #testing

## Relations
- extends [[US-002 SAM2 session lifecycle API patterns]]
- relates_to [[SAM2 session and job persistence contract]]
- relates_to [[Milestone 3: SAM2 Prompt + Propagation]]
