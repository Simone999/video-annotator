---
title: Fix review transport playback propagation and object colors
type: note
permalink: video-annotator/tasks/fix-review-transport-playback-propagation-and-object-colors
id: task-fix-review-transport-playback-propagation-and-object-colors
status: done
created: 2026-04-24
steps:
- creation
- planning
- execution
- wrap_up
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

- [x] range bar resizes with handles and stays synced with start/end inputs
- [x] current-frame playhead is separate from propagation range
- [x] pause lands on viewed frame instead of old canonical frame
- [x] visible thumbnails use real frame previews
- [x] create-object dialog supports fixed palette color choice
- [x] box and mask colors align to object color
- [x] review html includes bottom nav buttons plus seed or range controls that match shipped behavior

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

### Frontend and shipped-behavior follow-through

- Frontend later landed the matching transport/runtime slice:
  - range handles and numeric inputs stay synced
  - current-frame playhead is separate from propagation range
  - pause commits the viewed frame
  - review thumbnails use real frame previews
  - create-object dialog exposes fixed palette color choice
  - overlay box and mask colors align to object color
  - review HTML mockup was updated to match shipped bottom controls

## Wrap-Up Phase

### Verification

- Commands run:
  - `npm exec --workspace frontend vitest run tests/unit/video-review/review-transport-controls.test.tsx tests/unit/video-review/review-video-list-panel.test.tsx tests/unit/video-review/use-live-review-controller-propagation.test.ts tests/integration/video-review/export-ui-flow.test.tsx --coverage.enabled=false`
  - `npm run typecheck`
  - `npm run lint`
- Results:
  - Focused frontend transport/runtime tests passed: `4` files, `20` tests.
  - `npm run typecheck` passed for backend pyright and frontend `tsc`.
  - `npm run lint` passed for backend Ruff and frontend ESLint.

### Final Summary

- Review transport now keeps playhead separate from propagation range, pause lands on the viewed frame, thumbnails use real previews, and object palette truth stays aligned across dialog, boxes, and masks.
- Backend contracts for create-object color, preview-width exact frames, and seeded propagation range landed first; frontend/runtime behavior later matched those contracts and shipped.

### Completion Gate

- [x] Acceptance Criteria checkboxes updated to match reality
- [x] Verification and wrap-up record current truth honestly
- [x] Only now may `status` change to `done`
