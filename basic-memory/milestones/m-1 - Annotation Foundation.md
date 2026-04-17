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
