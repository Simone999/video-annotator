---
title: Fix review transport playback propagation and object colors
type: note
permalink: video-annotator/tasks/fix-review-transport-playback-propagation-and-object-colors
id: task-fix-review-transport-playback-propagation-and-object-colors
status: in_progress
created: 2026-04-24
steps:
- creation
- planning
- execution
tags:
- task
- frontend
- backend
- review
- transport
- propagation
- colors
---

# Fix review transport playback propagation and object colors

## Creation Phase

### Description

Make review transport and playback actually work, then align object color flow and mockup truth to that working behavior.

### Scope

- In scope: transport range editing, playback pause commit, thumbnails, propagation seed or range controls, object create color, overlay color alignment, review html mockup updates, and durable notes.
- Out of scope: removing advanced SAM2 or mask flows, redesigning non-review routes, or changing export behavior.

### Acceptance Criteria

- [ ] range bar resizes with handles and stays synced with start/end inputs
- [ ] current-frame playhead is separate from propagation range
- [ ] pause lands on viewed frame instead of old canonical frame
- [ ] visible thumbnails use real frame previews
- [ ] create-object dialog supports fixed palette color choice
- [ ] box and mask colors align to object color
- [ ] review html includes bottom nav buttons plus seed or range controls that match shipped behavior

### Test Intent

- Backend unit and route coverage for create-object color, exact-frame preview width, and propagation seed or range validation.
- Frontend unit and integration coverage for transport, playback pause commit, thumbnails, create-object palette, and overlay tinting.

## Planning Phase

### Planned Verification

- Targeted backend unit or route tests for videos, video frames, and sam2 propagation
- Targeted frontend unit and integration review tests
- `npm run lint`
- `npm run typecheck`

### Planned Implementation

- Split transport state into current frame, playback preview frame, propagation range, and propagation seed.
- Extend backend contracts first where frontend cannot honestly implement requested behavior without them.
- Update mockup html only after live behavior is settled enough to mirror it honestly.

### Backend Slice

- Backend ownership in this session only:
  - create-object request accepts explicit `color` and persists it
  - exact-frame route accepts optional preview width on existing route
  - SAM2 propagation request uses `seed_frame_idx`, `range_start_frame_idx`, `range_end_frame_idx`, `direction`, `object_ids`, `session_id`
  - backend validates `range_start_frame_idx <= seed_frame_idx <= range_end_frame_idx`
- Test-first files for this slice:
  - `backend/tests/unit/api/test_videos_routes.py`
  - `backend/tests/unit/services/test_video_frames.py`
  - `backend/tests/unit/services/test_sam2.py`
  - other backend tests only if schema or persisted payload changes require them

## Execution Phase

### Backend Progress

- Added failing unit coverage first for:
  - create-object `color` request and route passthrough
  - exact-frame `width` query passthrough and ffmpeg scale filter
  - SAM2 propagation request shape with explicit seed and range bounds
- Implemented minimal backend changes in owned schema, route, and service files only.
- Detected concurrent backend edits already present in owned files for this slice and kept them intact when they matched requested contract.

### Verification Run

- Red:
  - `uv run --project backend pytest backend/tests/unit/api/test_videos_routes.py backend/tests/unit/services/test_video_frames.py backend/tests/unit/services/test_object_tracks.py backend/tests/unit/services/test_sam2.py backend/tests/unit/models/test_sam2_models.py`
  - result: `27 failed, 37 passed`
- Green:
  - `uv run --project backend pytest backend/tests/unit/api/test_videos_routes.py backend/tests/unit/services/test_video_frames.py backend/tests/unit/services/test_object_tracks.py backend/tests/unit/services/test_sam2.py backend/tests/unit/models/test_sam2_models.py`
  - result: `64 passed in 2.61s`
- Green after overlap cleanup:
  - `uv run --project backend pytest backend/tests/unit/api/test_videos_routes.py backend/tests/unit/services/test_video_frames.py backend/tests/unit/services/test_object_tracks.py backend/tests/unit/services/test_sam2.py backend/tests/unit/models/test_sam2_models.py`
  - result: `64 passed in 2.90s`
