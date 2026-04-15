# Architecture

## Overview

The application uses a two-pane model:

- playback pane: normal video watching and rough navigation
- annotation pane: exact backend-decoded frame for annotation
- metadata panel: backend-owned review facts for the selected video

This split avoids browser-video timing ambiguity.

## High-level components

### Frontend
Responsible for:
- rendering video playback
- rendering exact frame image and overlays
- keyboard shortcuts
- timeline markers
- object list and selection
- calling backend APIs
- showing SAM2 progress/results

### Backend
Responsible for:
- indexing videos
- returning exact frames
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
- frontend exact-frame pane keeps typed frame input separate from canonical review state until backend exact-frame request succeeds
- frontend prev/next controls step from canonical frame state, clamp at `0` and `frame_count - 1`, and only update the visible frame number after backend exact-frame fetch succeeds
- frontend requests `/api/videos/{video_id}/frame/{frame_idx}` with canonical zero-based frame index
- backend looks up persisted `Video` metadata first and rejects any frame index outside `0 <= frame_idx < frame_count`
- backend can stream the indexed source video for playback, but that playback path is not annotation truth
- backend decodes exact frame from local source file and returns PNG bytes
- repeated requests for same `video_id` and `frame_idx` must return stable exact-frame content
- browser playback stays contextual only; it must not define annotation frame identity

## Milestone-02 annotation CRUD flow

- frontend bootstraps selected video state from `/api/videos/{video_id}/manifest`
- frontend reads persisted frame rows through `/api/videos/{video_id}/annotations` or `/api/videos/{video_id}/annotations/frame/{frame_idx}`
- frontend exact-frame loads trigger a follow-up frame-annotation fetch for that same canonical `frame_idx`; a saved box overlay only renders from the current frame's persisted rows
- frontend draw-box flow maps pointer coordinates against the rendered exact-frame wrapper, keeps transient drag gesture local to the overlay component, and stores only normalized draft box data keyed by current `frame_idx` and selected `object_id`
- overlay geometry is applied from normalized `box_xywh_norm` values onto the rendered backend exact-frame image, not onto playback UI state or the broader pane container
- backend validates `video_id` first, then validates canonical `frame_idx` against stored `Video.frame_count` before any annotation read or write
- annotation request bodies are parsed at the API boundary and reject any `box_xywh_norm` payload that is not exactly four normalized values
- frame writes upsert rows by the durable database key `(video_id, frame_idx, object_id)` so manual edits replace prior geometry without creating duplicate rows
- frame deletes remove only the targeted `(video_id, frame_idx, object_id)` row and leave other frames and objects untouched
- browser playback remains navigation-only; annotation CRUD never uses browser `currentTime` as persisted truth

## Data flow

1. User opens a video
2. Frontend loads manifest and annotations
3. Frontend displays playback video and the current exact frame
4. Annotation actions target `/frame/{frame_idx}` and related annotation endpoints
5. SAM2 prompt/propagation happens through dedicated backend services
6. Results are persisted in DB + filesystem

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
