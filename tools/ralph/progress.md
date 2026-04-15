# Ralph Progress Log
Started: 2026-04-15 04:21 CEST
---

## Codebase Patterns
- `uv run --project backend pytest` collects tests from repo root; keep `backend/tests/conftest.py` to add `backend/` to `sys.path` before importing `app.*`.
- Exact-frame route validation belongs before decode: reject any `frame_idx` outside persisted `Video.frame_count`, and patch `app.api.videos.load_exact_video_frame` in API tests when response bytes matter more than decoder internals.
- Backend API tests that change `APP_DB_URL` between cases must clear cached `app.db.session.get_engine()` and `get_session_factory()` before creating the app, or stale SQLite state can leak across tests.
- Backend API route tests can set `APP_DB_URL` to a temp SQLite file, seed rows directly with SQLAlchemy, and rely on `create_app()` startup to bootstrap tables.
- Milestone-02 box persistence keeps both `FrameAnnotation.video_id` and `object_id`; enforce unique `(video_id, frame_idx, object_id)` in DB so video-scoped APIs and exact-frame writes share one canonical row shape.
- Video manifest queries should order `ObjectTrack` rows by persisted `id` and compute sorted distinct frame-index lists from `FrameAnnotation` so reloads stay deterministic.
- Root `npm run test` delegates to frontend workspace script; keep frontend `vitest` tooling declared, and use `--passWithNoTests` until repo has real frontend tests.
- Frontend feature modules should parse backend JSON in feature API clients before state updates, and keep canonical `currentFrameIndex` in feature state instead of deriving it from playback UI.
- Frontend exact-frame flows should keep fetched blob/status state in feature hooks, but keep `URL.createObjectURL` and `URL.revokeObjectURL` in rendered image components so browser URL lifecycle stays local to UI.
- Frontend prev/next exact-frame controls should clamp with `selectedVideo.frame_count`, call backend exact-frame fetch for target index, and rely on canonical-state effects to sync frame input after success.
- Frontend UI tests can run under `// @vitest-environment jsdom` with `@testing-library/react`; keep `frontend/src/types/react-dom-compat.d.ts` so React DOM subpath imports still typecheck under workspace `moduleResolution: Bundler`.
- Frontend browser verification can use Playwright against local Vite dev server with intercepted `/api` responses when validating UI flow without backend fixture setup.
- Live frontend dev needs Vite to proxy relative `/api` requests to backend `127.0.0.1:8000`; otherwise real browser validation hits `5173/api/*` instead of FastAPI.

---

## Progresses

## 2026-04-15 04:32 CEST - US-001
- Implemented persisted `ObjectTrack` and `FrameAnnotation` SQLAlchemy models with foreign keys to indexed videos, normalized box fields, and unique `(video_id, frame_idx, object_id)` enforcement for exact-frame rows.
- Added model-level backend tests for schema shape, foreign keys, uniqueness contract, and round-trip persistence of one manual box row.
- Updated `docs/engineering/data-model.md` and root `AGENTS.md` to record milestone-02 persistence rules for optional mask fields and video-scoped annotation identity.
- Files changed: `AGENTS.md`, `backend/app/db/__init__.py`, `backend/app/db/models.py`, `backend/tests/models/test_annotation_models.py`, `docs/engineering/data-model.md`, `tools/ralph/prd.json`, `tools/ralph/progress.md`
- **Learnings for future iterations:**
  - Patterns discovered: keep `FrameAnnotation.video_id` even though `object_id` links to `ObjectTrack`; later APIs are video-scoped and tests/docs stay simpler with explicit video ownership on annotation rows.
  - Gotchas encountered: box-only milestone-02 rows need nullable `mask_path` and `mask_rle`, or manual annotation persistence cannot represent pre-SAM2 state cleanly.
  - Useful context: current persistence lives entirely in `backend/app/db/models.py`; minimal schema-first tests in `backend/tests/models/` are enough to lock contract before API stories build on top.
---

## 2026-04-15 14:01 CEST - US-002
- Implemented `GET /api/videos/{video_id}/manifest` and `POST /api/videos/{video_id}/objects` with typed schemas, thin FastAPI routes, and service-layer manifest aggregation / object persistence.
- Added backend API tests covering manifest payload shape, unknown-video errors, object creation, and manifest reload after object persistence.
- Updated `docs/engineering/api.md` and Basic Memory notes to capture actual manifest and object-create contracts.
- Files changed: `backend/app/api/videos.py`, `backend/app/schemas/__init__.py`, `backend/app/schemas/video.py`, `backend/app/services/__init__.py`, `backend/app/services/video_catalog.py`, `backend/tests/api/test_videos.py`, `docs/engineering/api.md`, `tools/ralph/prd.json`, `tools/ralph/progress.md`
- **Learnings for future iterations:**
  - Patterns discovered: keep manifest assembly in backend service layer, then convert ORM rows with response models at route boundary; this matches existing catalog API shape and keeps handlers small.
  - Gotchas encountered: manifest frame lists must use `distinct` over `FrameAnnotation.frame_idx`, or one frame with multiple objects will duplicate marker entries.
  - Useful context: object creation currently defaults new rows to `status = active` and `color = null`; frontend stories can rely on those fields already existing in both create and manifest responses.
---
