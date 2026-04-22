---
title: Annotation Foundation and Manual Box Workflow
type: feature
canonical: true
domain: review
aliases:
- annotation foundation
- manual box workflow
- object selection
status: active
permalink: video-annotator/features/annotation-foundation-and-manual-box-workflow
tags:
- feature
- annotation
- objects
- manual-box
---

# Annotation Foundation and Manual Box Workflow

This feature owns stable object identity, manifest-backed selection, and persisted manual box CRUD on canonical backend frames.

## Target Behavior

- Reviewer opens a video, creates or selects an object, pauses on canonical frame `N`, draws a box, reloads, still sees it, edits it, and deletes it without losing frame identity.
- Object identity comes from backend persistence and manifest state, not local temp ids or text inputs.
- Manual rows remain visible and editable even when no mask exists yet.
- Draw, move, resize, delete, and save stay paused-only on canonical current frame.

## Contracts

- Backend contracts:
  - `GET /api/videos/{video_id}/manifest`
  - `POST /api/videos/{video_id}/objects`
  - `GET /api/videos/{video_id}/annotations/frame/{frame_idx}`
  - `PUT /api/videos/{video_id}/annotations/frame/{frame_idx}`
  - `DELETE /api/videos/{video_id}/annotations/frame/{frame_idx}/object/{object_id}`
- Frontend contracts:
  - object selection stays manifest-backed
  - draw, move, resize, delete, and save run only while playback is paused on canonical current frame
  - saved manual boxes stay separate from generic frame annotations
  - manual rows from reload must use `mask: null`
- Data or storage contracts:
  - `ObjectTrack` persists stable `id`, `video_id`, `label`, `color`, and `status`
  - manual writes upsert one row by `(video_id, frame_idx, object_id)` with `source = manual`

## Verification Strategy

- Durable evidence:
  - `backend/tests/integration/api/test_annotation_foundation_manual_box.py`
  - `frontend/tests/integration/video-review/live-review-screen.test.tsx`
- Manual browser proof exists and should be tracked in archive task notes when it changes.
- No committed browser E2E is required while backend and frontend integration cover the durable truth directly.

## Observations

- [status] This feature ships on the live review path. #feature
- [scope] Richer object controls, whole-track actions, and mask editing live outside this feature. #feature #scope
- [pattern] Manual rows with `mask: null` are critical for saved-box reload and editability. #manual-box
- [guardrail] Manual-box transforms should commit from final pointer coordinates, not only the last prior move event. #frontend
- [rule] Manual box create, move, resize, delete, and save are paused-only actions on canonical current frame. #manual-box #frames
- [retrieval] Use this note for object selection, manual box CRUD, or saved manual reload queries. #search

## Relations

- relates_to [[Annotation Foundation Persistence Patterns]]
- relates_to [[API]]
- relates_to [[Data Model]]
