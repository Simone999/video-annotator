# Architecture

## Overview

The application uses one main review surface:

- real app routes are `/`, `/review/:videoId`, and `*`
- playback video remains visible in the surface
- overlayed annotations stay on the same surface
- metadata panel: backend-owned review facts for the selected video

This avoids browser-video timing ambiguity without splitting review into separate playback and exact-frame panes.

## High-level components

### Frontend
Responsible for:
- rendering the backend-backed `video-library` route page at `/` from `frontend/src/features/video-library/pages/library-page.tsx`
- rendering the feature-owned `/review/:videoId` route page from `frontend/src/features/video-review/pages/review-page.tsx` and the live review surface from `frontend/src/features/video-review/components/live-review-screen.tsx`
- rendering a small not-found route at `*` with a path back to `/`
- keeping app bootstrap and router wiring under `frontend/src/app/` while reusable frontend primitives live under `frontend/src/shared/`
- keeping committed frontend browser specs under `frontend/tests/e2e/` while shared Playwright setup stays under repo-root `tests/e2e/`
- pausing contextual playback before exact-frame jumps or canonical mutations so backend frame truth stays authoritative
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
- explicit schema migration and seed-friendly bootstrap around those indexed videos
- preparing local SQLite state before `npm run backend:dev`, including known pre-Alembic legacy repair for local DBs
- reading host and E2E runtime ports from repo env files instead of package-script literals
- returning exact frames
- serving library review state and progress
- managing annotations
- saving masks
- handling exports
- creating SAM2 sessions
- orchestrating propagation jobs
- resolving lazy SAM2 runtime config from `SAM2_CONFIG_PATH`, `SAM2_CHECKPOINT_PATH`, and optional `SAM2_DEVICE`
- allowing localhost and `127.0.0.1` browser origins during local dev and E2E runs

## Test layout

- frontend Vitest suites live under `frontend/tests/unit/` and `frontend/tests/integration/`
- frontend-owned Playwright specs and browser fixtures live under `frontend/tests/e2e/`
- shared Playwright harness stays under `tests/e2e/playwright.config.ts` and `tests/e2e/global.setup.ts`
- repo env files now own host dev, host E2E, and Docker E2E ports; local dev defaults use backend `127.0.0.1:8000`, while host Playwright E2E uses backend `127.0.0.1:8001`

### SAM2 worker/service
Responsible for:
- model loading
- lightweight persisted session lifecycle plus lazy predictor-state load on first prompt
- prompt handling
- propagation
- returning masks as PNG or RLE

## Core decision: canonical frame ownership

The backend owns the true frame index.

The frontend must never derive annotation truth from browser `currentTime`.
Edit, save, delete, and SAM2 actions are paused-only and must target the canonical backend current frame.

## Milestone-01 indexing flow

- backend scans configured local source dir: `data/videos`
- DB schema is created explicitly through Alembic under `backend/alembic/`; FastAPI startup does not create tables
- local and E2E indexing run explicitly through `backend/scripts/seed_e2e.py` baseline seed or direct service calls
- only backend inspection decides stored review metadata
- scan walks supported video files, extracts metadata with `ffprobe`, and upserts `Video` rows
- `Video.id` stays deterministic per relative source path, so repeated scans update same row instead of creating duplicates
- stored metadata stays local-first: DB keeps review fields, source files stay on disk
- explicit seed plus migrate keeps review workspace and browser E2E deterministic without mixing test fixtures into app startup

## Milestone-01 exact-frame flow

- frontend loads contextual playback from `/api/videos/{video_id}/source`
- frontend frame controls keep typed frame input separate from canonical review state until backend exact-frame request succeeds
- frontend pauses contextual playback before exact-frame fetches or other canonical-frame mutations
- frontend auto-loads a useful canonical landing frame from manifest `annotated_frames`, falling back to frame `0` when no annotation exists yet
- frontend prev/next controls step from canonical frame state, clamp at `0` and `frame_count - 1`, and only update the visible frame number after backend exact-frame fetch succeeds
- frontend annotated-frame and keyframe jump controls use manifest indices directly instead of browser playback time or ad hoc summary routes
- frontend keyboard shortcuts act on canonical frame state only when focus is outside interactive inputs, so `Space`, arrow keys, `g`, and `Delete` stay review-specific without hijacking form editing
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
4. Frontend displays playback video and overlayed annotations in one single-stage review surface
5. Annotation actions target `/frame/{frame_idx}` and related annotation endpoints only while paused on the canonical backend frame
6. SAM2 prompt/propagation happens through dedicated backend services
7. Results are persisted in DB + filesystem

## Library review-state flow

- frontend default host reads `/api/videos` through `frontend/src/features/video-library/api.ts` and maps backend review facts into route-owned library summary metrics plus cards
- frontend library cards read `review_state`, `propagation_progress_percent`, and `review_summary` from the backend
- `review_state` values are `not_started`, `started`, `in_progress`, `ready`, and `exported`
- progress bar means propagation completion only and is visible only while `review_state = in_progress`
- shipped derivation lives in `backend/app/services/review_summaries.py`
- current runtime does not emit `exported` because export completion is not persisted yet

## Annotation-foundation manifest flow

- backend reads `Video` plus derived review summary metadata
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

## Mask editing and cleanup flow

- refine stays same-frame through `POST /api/videos/{video_id}/sam2/refine-mask` and reuses persisted same-frame mask PNG as backend seed input
- frame-local cleanup now uses `DELETE /api/videos/{video_id}/annotations/frame/{frame_idx}/object/{object_id}/mask`
- whole-object cleanup now uses `DELETE /api/videos/{video_id}/annotations/object/{object_id}/masks`
- whole-track delete now uses `DELETE /api/videos/{video_id}/objects/{object_id}`
- frame-local cleanup clears only persisted mask fields plus backing PNG when box truth still exists; mask-only propagated rows are deleted so summary truth does not keep ghost frames
- whole-object cleanup reuses that same per-row clear-or-delete contract across all selected-object rows and must not touch unrelated object rows
- whole-track delete removes the selected track row plus all linked annotation rows and backing mask PNG files
- frame-local cleanup must not touch adjacent-frame rows
- live review inspector must label frame-local and whole-object cleanup scopes clearly so reviewers do not confuse them with full annotation-row delete
- live review must refetch manifest before current-frame reload after whole-track delete so selection fallback and inspector summary reset come from backend truth

## Selected-object summary flow

- backend returns a derived selected-object summary for the active review surface object
- shipped response includes `bbox_xyxy_px`, nullable `mask_confidence`, and `track_summary { frames, propagated, corrected }`
- frame-annotation storage now persists nullable `mask_confidence` for untouched `source = "sam2"` rows and clears it on manual rewrites
- selected-object summary now reuses that persisted current-frame confidence when present, and derives `track_summary.corrected` from non-keyframe `source = "sam2_edited"` rows

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
- prompt and propagation share one `Sam2Service` seam with lazy predictor load and per-session runtime state

## Reuse from SAM2 demo (`~/projects/sam2/demo`)

Reuse mainly from the demo backend:
- session lifecycle ideas
- predictor wrapper logic
- propagation flow
- mask serialization helpers

Default local runtime now uses that shared `Sam2Service` seam for both prompt and propagation. `POST /sam2/session` stays lightweight, prompt or propagation lazily load predictor state on first runtime use, and prompt or propagation recreate process-local session state from the open DB row if backend memory lost it before runtime work starts. `direction = "both"` is translated into forward or reverse `propagate_in_video(...)` passes while the job layer keeps canonical target-frame filtering and persistence.

Do not treat the demo frontend as the application architecture.
