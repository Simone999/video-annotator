# Architecture

## Overview

The application uses one main review surface:

- playback video remains visible in the surface
- overlayed annotations stay on the same surface
- metadata panel: backend-owned review facts for the selected video

This avoids browser-video timing ambiguity without splitting review into separate playback and exact-frame panes.

## High-level components

### Frontend
Responsible for:
- rendering the video library entry screen
- rendering video playback
- rendering the main review surface with playback and overlays
- keyboard shortcuts
- timeline markers
- object list and selection
- calling backend APIs
- showing SAM2 progress/results

### Backend
Responsible for:
- indexing videos
- returning exact frames
- serving library review state and progress
- managing annotations
- saving masks
- handling exports
- creating SAM2 sessions
- orchestrating propagation jobs

### SAM2 worker/service
Responsible for:
- model loading
- predictor state/session lifecycle
- prompt handling
- propagation
- returning masks as PNG or RLE

## Core decision: canonical frame ownership

The backend owns the true frame index.

The frontend must never derive annotation truth from browser `currentTime`.
Edit, save, delete, and SAM2 actions are paused-only and must target the canonical backend current frame.

## Milestone-01 indexing flow

- backend scans configured local source dir: `data/videos`
- backend startup bootstraps DB tables first, then runs milestone-01 indexing automatically
- only backend inspection decides stored review metadata
- scan walks supported video files, extracts metadata with `ffprobe`, and upserts `Video` rows
- `Video.id` stays deterministic per relative source path, so repeated scans update same row instead of creating duplicates
- stored metadata stays local-first: DB keeps review fields, source files stay on disk
- startup indexing means review workspace can load real local videos without manual DB seeding

## Milestone-01 exact-frame flow

- frontend loads contextual playback from `/api/videos/{video_id}/source`
- frontend frame controls keep typed frame input separate from canonical review state until backend exact-frame request succeeds
- frontend prev/next controls step from canonical frame state, clamp at `0` and `frame_count - 1`, and only update the visible frame number after backend exact-frame fetch succeeds
- frontend requests `/api/videos/{video_id}/frame/{frame_idx}` with canonical zero-based frame index
- backend looks up persisted `Video` metadata first and rejects any frame index outside `0 <= frame_idx < frame_count`
- backend can stream the indexed source video for playback, but that playback path is not annotation truth
- backend decodes exact frame from local source file and returns PNG bytes
- repeated requests for same `video_id` and `frame_idx` must return stable exact-frame content
- browser playback stays contextual only; it must not define annotation frame identity

## Data flow

1. User opens a video
2. Frontend loads `/api/videos/{video_id}/manifest` for object summary plus annotated-frame and keyframe markers
3. Frontend can create one stable object through `/api/videos/{video_id}/objects` before manual or SAM2 annotation work starts
4. Frontend displays playback video and overlayed annotations in the main review surface
5. Annotation actions target `/frame/{frame_idx}` and related annotation endpoints only while paused on the canonical backend frame
6. SAM2 prompt/propagation happens through dedicated backend services
7. Results are persisted in DB + filesystem

## Library review-state flow

- frontend library cards read `review_state` and `propagation_progress` from the backend
- `review_state` values are `not_started`, `started`, `in_progress`, `ready`, and `exported`
- progress bar means propagation completion only and is visible only while `review_state = in_progress`
- these fields are documented as planned backend contract additions if the runtime has not shipped them yet

## Annotation-foundation manifest flow

- backend reads `Video` for review metadata
- backend reads `ObjectTrack` rows for stable object summary
- backend reads distinct `FrameAnnotation.frame_idx` values for `annotated_frames`
- backend reads distinct keyframe `FrameAnnotation.frame_idx` values where `is_keyframe = true`
- frontend treats manifest frame lists as canonical backend indices, never playback-time estimates

## Annotation-foundation object-create flow

- frontend sends one label to `POST /api/videos/{video_id}/objects`
- backend verifies selected `video_id` exists before writing any row
- backend persists one stable `ObjectTrack` with default `color` and `status`
- frontend reuses returned stable object summary for later panel selection and frame-scoped annotation writes

## Annotation-foundation manual box flow

- frontend sends one selected `object_id`, `is_keyframe`, and normalized `box_xywh_norm` to `PUT /api/videos/{video_id}/annotations/frame/{frame_idx}`
- backend verifies selected `video_id`, canonical `frame_idx`, and `object_id` before any write
- backend upserts one `FrameAnnotation` row by `(video_id, frame_idx, object_id)` with `source = "manual"`
- manual box writes clear persisted mask metadata so same-frame box state stays explicit until later SAM2 or mask-edit flows add masks
- backend frame-annotation reads must still return those manual rows with `mask = null`, or exact-frame reload loses saved boxes
- frontend frame-load state must hydrate editable saved-manual box state from those fetched manual rows, or move/resize/delete controls stop working after reload
- frontend removes one current-frame box through `DELETE /api/videos/{video_id}/annotations/frame/{frame_idx}/object/{object_id}`
- selected saved manual box can move by dragging box body, resize from its corner handle, and persist each edit through the same frame-scoped `PUT` route
- edit, save, delete, and SAM2 actions remain paused-only on the canonical backend current frame

## Selected-object summary flow

- backend returns a derived selected-object summary for the active review surface object
- the planned response shape includes `bbox_xyxy_px`, `mask_confidence`, and `track_summary { frames, propagated, corrected }`
- this response is a contract target, not a promise that the runtime already ships the endpoint

## Recommended stack

### Frontend
- React
- TypeScript
- Vite
- Zustand or Redux Toolkit
- React Query
- Konva or Fabric.js

### Backend
- FastAPI
- Python 3.12
- Pydantic
- SQLAlchemy/SQLModel
- Uvicorn

### Storage
- SQLite
- local filesystem for masks and exports

### Video
- TorchCodec for exact frame decoding

### SAM2
- official SAM2 package
- adapted behind an internal service layer

## Reuse from SAM2 demo (`~/projects/sam2/demo`)

Reuse mainly from the demo backend:
- session lifecycle ideas
- predictor wrapper logic
- propagation flow
- mask serialization helpers

Do not treat the demo frontend as the application architecture.
