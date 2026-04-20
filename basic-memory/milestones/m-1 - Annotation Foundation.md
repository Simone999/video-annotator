---
title: 'm-1: Annotation Foundation'
type: note
permalink: video-annotator/milestones/m-1-annotation-foundation
tags:
- milestone
- roadmap
- annotation
- box-crud
---

# m-1: Annotation Foundation

This note is canonical next milestone. Goal is simple: finish durable object identity and persisted manual box CRUD on canonical backend frames.

## Status
Partial.

## Goal
User can create or select one object, draw one box on frame `N`, reload and still see it, move or resize it, and delete that frame box without touching browser playback time.

## Current Code Already Has
- Exact-frame canvas with transient drag-to-draw box state.
- Persisted `ObjectTrack` model with stable `id`, `video_id`, `label`, `color`, and `status` fields.
- Persisted `FrameAnnotation` storage now powers manifest summaries for annotated frames and keyframes.
- `GET /api/videos/{video_id}/manifest` returns review video metadata, object summary, annotated frame indices, and keyframe indices.
- Mask and box overlay rendering for persisted SAM2 annotations.
- Canonical backend `frame_idx` flow for exact-frame review.

## Missing
- No backend create path for stable objects yet.
- No backend create or update path for manual frame annotations.
- No persisted manual box create, reload, move, resize, or delete flow.
- No object panel. Current UI still uses free-text `Object ID`.

## Acceptance Gate
- `ObjectTrack` exists and is persisted per video.
- `GET /api/videos/{video_id}/manifest` returns object summary plus annotated-frame and keyframe summaries.
- `POST /api/videos/{video_id}/objects` creates stable object identity.
- `PUT /api/videos/{video_id}/annotations/frame/{frame_idx}` and `DELETE /api/videos/{video_id}/annotations/frame/{frame_idx}/object/{object_id}` persist manual frame box state.
- Frontend uses object panel create or select flow instead of raw object-id typing.
- User can draw, reload, move, resize, and delete a saved manual box on exact frame `N`.

## Evidence
- `backend/app/db/models.py` now has `ObjectTrack` beside `Video`, with one model test that creates the table and round-trips one persisted row for one video.
- `backend/app/api/videos.py` still has frame reads and SAM2 routes, but no manifest route, object create route, manual annotation upsert route, or current-frame delete route.
- `frontend/src/app/App.tsx` still renders raw `Object ID` input and uses it to drive SAM2 actions.
- `frontend/src/features/video-review/exact-frame-canvas.tsx` only supports drawing draft boxes, not editing saved manual boxes.
- `frontend/src/features/video-review/state.ts` only tracks `draftBox` and SAM2 state, not manual annotation CRUD state.

## Dumb Subagent Check
One context-poor subagent can implement this milestone if it reads `[[Product Requirements]]`, `[[Frontend Interaction Spec]]`, `[[API]]`, `[[Data Model]]`, `[[Test Plan]]`, and this note first. If a planned task needs more than those notes, split the task smaller or add the missing memory first.

## 2026-04-17 Audit Update
Audit against `tools/ralph/prd.json` says `US-001` through `US-004` are really implemented in current code, but `US-005` is a false positive.

### Current Truth
- Backend now has `POST /api/videos/{video_id}/objects` and manual annotation `PUT` and `DELETE` routes in `backend/app/api/videos.py`.
- Backend foundation verification is no longer tracked by concrete test file path in this milestone note; use task and testing notes for current verification inventory.
- Frontend still does not expose typed manifest or manual annotation client methods.
- Frontend state still does not store `objectSummaries` or `savedManualAnnotationsByFrame`.
- UI still uses raw object-id input in `frontend/src/app/App.tsx`.

### Implication
Milestone m-1 backend foundation is real, but frontend object panel and saved manual annotation state flow are still not finished. Treat `US-005` as not done until typed client methods, state, and tests exist again.

### Likely Search Queries
- `US-005 false positive`
- `m-1 frontend object panel missing`
- `prd passes true audit annotation foundation`

## Observations
- [goal] m-1 finishes object identity and manual box CRUD before later review or SAM2 polish work.
- [status] `US-001` and `US-002` are done: backend now persists stable `ObjectTrack` rows per video and exposes manifest summary reads, but object-create and manual box CRUD APIs are still missing.
- [pattern] Manifest summary reads stable object identity from `ObjectTrack` and derives `annotated_frames` plus `keyframes` from distinct `FrameAnnotation.frame_idx` values for one `video_id`. #manifest #api #frame-index
- [dependency] Later workspace and SAM2 milestones depend on this milestone being real, not assumed.
- [guardrail] Tasks under m-1 must stay small enough for a dumb subagent to execute from memories alone.
- [verification] Cheap model-level persistence coverage in this repo uses SQLite `Base.metadata.create_all(engine)` plus one SQLAlchemy `Session` round trip, without API fixtures.

## Relations
- part_of [[Milestones Index]]
- depends_on [[Product Requirements]]
- depends_on [[Frontend Interaction Spec]]
- depends_on [[API]]
- depends_on [[Data Model]]
- depends_on [[Test Plan]]
- relates_to [[Task Breakdown Guide]]

## 2026-04-17 US-005 Update
Frontend annotation-foundation boundary is now real.

### Current Truth
- `frontend/src/features/video-review/api.ts` now exposes typed manifest, object-create, manual annotation upsert, and manual annotation delete clients with runtime payload parsing.
- `frontend/src/features/video-review/state.ts` now stores `objectSummaries`, `selectedObjectId`, `annotatedFrameIndices`, `keyframeIndices`, and `savedManualAnnotationsByFrame` separate from canonical `currentFrameIndex`.
- `frontend/src/features/video-review/workspace.ts` now loads manifest data during video selection so object summary state is ready before later object-panel UI work.
- UI still keeps raw object-id input, so `US-006` through `US-008` remain open.

### Implication
`US-005` is done. Next work should start at object-panel UI replacement, then saved manual draw-reload flow.
## 2026-04-17 US-006 Update
Frontend object identity flow is now visible in the review UI.

### Current Truth
- `frontend/src/app/App.tsx` now renders a left-side manifest-backed object panel with persisted object label and id display.
- Creating an object in the panel calls `POST /api/videos/{video_id}/objects`, appends the returned summary into reducer state, and selects the new stable object id.
- Selecting an existing object now happens through the panel buttons backed by `selectedObjectId`; raw free-text `Object ID` input is gone from the exact-frame form.
- Frontend object-panel verification inventory is no longer tracked by concrete test file path in this milestone note; use task and testing notes for current verification details.

### Implication
`US-006` is done. Remaining m-1 work is saved manual box draw, reload, edit, and delete on canonical frames.
