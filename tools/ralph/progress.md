# Ralph Progress Log
Started: 2026-04-15 22:47 CEST
---

## Codebase Patterns
- Exact-frame route validation belongs before decode: reject any `frame_idx` outside persisted `Video.frame_count`, and patch `app.api.videos.load_exact_video_frame` in API tests when response bytes matter more than decoder internals.
- Backend API tests that change `APP_DB_URL` between cases must clear cached `app.db.session.get_engine()` and `get_session_factory()` before creating app, or stale SQLite state can leak across tests.
- Backend API route tests can set `APP_DB_URL` to temp SQLite file, seed rows directly with SQLAlchemy, and rely on `create_app()` startup to bootstrap tables.
- Backend Python tooling in this repo should run through `uv run --project backend ...`; bare `uv --project backend pytest` is not a valid command shape here.
- `FrameAnnotation` persistence keeps both `video_id` and `object_id`; enforce unique `(video_id, frame_idx, object_id)` in DB so video-scoped APIs, SAM2 prompt writes, and propagation writes share one canonical row shape.
- Frame-annotation writes stay row-scoped additive upserts keyed by `(video_id, frame_idx, object_id)`; prompt or propagation updates must not wipe sibling rows on same frame.
- `sam2_sessions` stores only durable lifecycle metadata for reuse/cleanup, while live predictor internals stay inside SAM2 adapter code; `jobs` stores deterministic progress counters plus JSON payload/result metadata for background work.
- SAM2 lifecycle APIs reuse at most one open `Sam2Session` row per video, refresh `last_used_at` on reuse, and validate local `source_path` before any adapter session work starts.
- SAM2 API tests can monkeypatch `app.api.videos.get_sam2_service` with a fake adapter, but must still keep `app.main.VIDEO_SOURCE_DIR` on an empty temp dir so startup indexing does not run `ffprobe` on dummy files.
- Prompt-box mask persistence should write PNG files under `APP_MASKS_DIR` or repo-default `masks/`, persist relative mask paths in SQLite, and backend API tests must point `APP_MASKS_DIR` at a temp dir before `create_app()`.
- Background job workers must open fresh SQLAlchemy sessions from `app.db.session.get_session_factory()`; request-scoped sessions are not safe to reuse across propagation threads.
- Frontend feature modules should parse backend JSON in feature API clients before state updates, and keep canonical `currentFrameIndex` in feature state instead of deriving it from playback UI.
- Exact-frame overlays should render in relative wrapper sized by displayed image element; use normalized percent `left/top/width/height` so boxes and masks track displayed backend frame pixels instead of pane layout.
- For draw-box UI, keep active pointer-drag gesture local to exact-frame component, but store only normalized draft box data in feature state and clear stale drafts when canonical frame or selected object changes.
- When exact-frame content grows after a click, disable browser scroll anchoring on that pane with `overflow-anchor: none` instead of trying to restore scroll position imperatively.

## Progresses
## 2026-04-16 00:29 CEST - US-000
- Implemented a narrow scroll-stability fix for exact-frame review by opting the exact-frame pane out of browser scroll anchoring, so clicking `Load frame` no longer shifts the viewport when the pane expands with the loaded image.
- Added frontend regression coverage that locks the exact-frame pane to `overflow-anchor: none`, and recorded a durable Basic Memory note for future search: `basic-memory/engineering/Exact-frame pane scroll anchoring fix.md`.
- Verified in a real browser against the live local stack with `bedroom.mp4`: document height grew from `876` to `1157` after frame `7` loaded, while `window.scrollY` stayed stable at `9`. Screenshot saved at `/tmp/us000-scroll-browser.png`.
- Files changed: `frontend/src/app/App.test.tsx`, `frontend/src/app/App.tsx`, `tools/ralph/prd.json`, `tools/ralph/progress.md`, `basic-memory/engineering/Exact-frame pane scroll anchoring fix.md`
- **Learnings for future iterations:**
  - Patterns discovered: if exact-frame content can expand after a button click, put `overflow-anchor: none` on the exact-frame pane itself and let browser layout grow without viewport correction.
  - Gotchas encountered: Vite dev must be started as `npm --workspace frontend run dev -- --host 127.0.0.1`; passing `--host` through repo-root `npm run frontend:dev` turned into `vite 127.0.0.1` and served a broken page.
- Useful context: live repro/verification is simplest with already indexed `bedroom.mp4`; scroll bug check only needs open video, set frame `7`, scroll a bit, click `Load frame`, then compare `window.scrollY` before and after.
---
## 2026-04-16 00:38 CEST - US-001
- Implemented persisted backend `Sam2Session` and `Job` models, including lifecycle timestamps, deterministic progress counters, cancel-request metadata, and JSON payload/result storage for future `sam2_propagation` work.
- Added red/green model tests that assert new `sam2_sessions` and `jobs` tables, nullable rules, and persisted JSON/datetime behavior, then updated engineering docs to describe session/job persistence boundaries.
- Fixed stale repo guidance so backend test command uses `uv run --project backend pytest`, which matches working local quality scripts.
- Files changed: `AGENTS.md`, `backend/app/db/__init__.py`, `backend/app/db/models.py`, `backend/tests/models/test_sam2_models.py`, `docs/engineering/architecture.md`, `docs/engineering/data-model.md`, `tools/ralph/prd.json`, `tools/ralph/progress.md`
- **Learnings for future iterations:**
  - Patterns discovered: persist SAM2 session rows as lifecycle metadata only; keep predictor internals out of DB and let job rows carry deterministic counters plus serialized payload/result blobs.
  - Gotchas encountered: repo-root backend test docs were stale; use `uv run --project backend pytest` or the root `npm run test`, not bare `uv --project backend pytest`.
  - Useful context: SQLite-backed model tests here are simplest as pure `Base.metadata.create_all(engine)` checks plus one round-trip `Session` persistence assertion per model.
---
## 2026-04-16 00:46 CEST - US-002
- Implemented isolated backend SAM2 lifecycle service module plus `POST /api/videos/{video_id}/sam2/session` and `DELETE /api/videos/{video_id}/sam2/session/{session_id}` routes, with one reusable open session per video and idempotent close behavior.
- Added API integration tests that fake adapter injection through `app.api.videos.get_sam2_service`, verify create/reuse semantics, verify close persistence, and enforce local-source validation before adapter work starts.
- Updated engineering docs and durable memory note for session route contracts, persistence rules, and test harness gotchas.
- Files changed: `AGENTS.md`, `backend/app/api/videos.py`, `backend/app/schemas/__init__.py`, `backend/app/schemas/sam2.py`, `backend/app/services/__init__.py`, `backend/app/services/sam2.py`, `backend/tests/api/test_sam2_sessions.py`, `docs/engineering/api.md`, `docs/engineering/architecture.md`, `docs/engineering/data-model.md`, `tools/ralph/prd.json`, `tools/ralph/progress.md`, `basic-memory/engineering/US-002 SAM2 session lifecycle API patterns.md`
- **Learnings for future iterations:**
  - Patterns discovered: keep route-level adapter injection on `app.api.videos.get_sam2_service`, so API tests can replace SAM2 runtime cleanly without touching DB persistence logic.
  - Gotchas encountered: startup indexing still runs during `create_app()` in API tests; if dummy media bytes live under patched `VIDEO_SOURCE_DIR`, `ffprobe` fails before request assertions run.
  - Useful context: lifecycle route contract is `POST` -> `{session_id, reused}` and `DELETE` -> `204`, with `404` for unknown video/session and `409` for missing local video source.
---
## 2026-04-16 00:56 CEST - US-003
- Implemented backend `POST /api/videos/{video_id}/sam2/prompt-box`, plus `FrameAnnotation` persistence and mask-file storage for same-frame SAM2 results.
- Added a dedicated frame-annotation persistence helper that normalizes `box_xyxy_px`, writes PNG masks under local mask root, and upserts one row keyed by `(video_id, frame_idx, object_id)`.
- Added red/green coverage for the new model and prompt-box API flow, then updated engineering docs and durable memory notes for the stored annotation contract and test harness gotchas.
- Files changed: `AGENTS.md`, `backend/app/api/videos.py`, `backend/app/core/config.py`, `backend/app/db/__init__.py`, `backend/app/db/models.py`, `backend/app/schemas/__init__.py`, `backend/app/schemas/sam2.py`, `backend/app/services/__init__.py`, `backend/app/services/frame_annotations.py`, `backend/app/services/sam2.py`, `backend/tests/api/test_sam2_prompt_box.py`, `backend/tests/models/test_frame_annotation_models.py`, `docs/engineering/api.md`, `docs/engineering/architecture.md`, `docs/engineering/data-model.md`, `tools/ralph/prd.json`, `tools/ralph/progress.md`, `basic-memory/engineering/US-003 SAM2 prompt-box persistence patterns.md`
- **Learnings for future iterations:**
  - Patterns discovered: same-frame SAM2 writes should return stored annotation metadata, not raw adapter output, so frontend state can stay aligned with persisted backend truth.
  - Gotchas encountered: mask-root config must be read at call time, not import time, or `APP_MASKS_DIR` overrides in tests are ignored and files leak into repo-local `masks/`.
  - Useful context: prompt-box response now carries `{frame_idx, annotation}` with normalized `box_xywh_norm` and relative `mask.path`; persisted mask file lives under `<mask-root>/<video_id>/<object_id>/frame_<idx>.png`.
---
## 2026-04-16 01:10 CEST - US-004
- Implemented backend `POST /api/videos/{video_id}/sam2/propagate`, `GET /api/jobs/{job_id}`, and `POST /api/jobs/{job_id}/cancel`, with persisted `jobs` rows, deterministic frame-based progress counters, background propagation execution, and clean cancel handling.
- Added propagation-specific mask persistence for non-keyframe frame annotations, plus integration coverage that exercises full completion and mid-run cancellation against a fake SAM2 adapter running behind real background threads.
- Updated engineering docs, root agent guidance, and a durable Basic Memory note for the job lifecycle contract and the fresh-session background-worker requirement.
- Files changed: `AGENTS.md`, `backend/app/api/__init__.py`, `backend/app/api/jobs.py`, `backend/app/api/videos.py`, `backend/app/schemas/__init__.py`, `backend/app/schemas/sam2.py`, `backend/app/services/__init__.py`, `backend/app/services/frame_annotations.py`, `backend/app/services/sam2.py`, `backend/tests/api/test_sam2_propagation_jobs.py`, `docs/engineering/api.md`, `docs/engineering/architecture.md`, `docs/engineering/data-model.md`, `tools/ralph/prd.json`, `tools/ralph/progress.md`, `basic-memory/engineering/US-004 SAM2 propagation job lifecycle patterns.md`
- **Learnings for future iterations:**
  - Patterns discovered: propagation workers should open a fresh SQLAlchemy session for each progress/persistence step and poll `cancel_requested_at` before and after consuming adapter frames.
  - Gotchas encountered: the create-job response can race with the worker flipping persisted status to `running`; return an explicit queued snapshot so API clients see deterministic initial state.
  - Useful context: progress counts target frames excluding the seed `start_frame_idx`, while `result_json` carries the concrete persisted frame indices for UI polling and recovery.
---
