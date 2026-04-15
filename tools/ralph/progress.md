## Codebase Patterns
- `uv run --project backend pytest` collects tests from repo root; keep `backend/tests/conftest.py` to add `backend/` to `sys.path` before importing `app.*`.
- Milestone-01 persisted video metadata uses `source_path` and `display_name`; keep docs, ORM fields, and future API payloads on those names.
- Milestone-01 video indexing should derive deterministic `Video.id` values from the file path relative to configured `data/videos`; repeated scans must update same row, not mint new IDs from DB order.
- Backend video services should accept injected inspector/decoder callables in tests so unit coverage stays fast and does not require real media fixtures or `ffprobe`.
- Exact-frame route validation belongs before decode: reject any `frame_idx` outside persisted `Video.frame_count`, and patch `app.api.videos.load_exact_video_frame` in API tests when response bytes matter more than decoder internals.
- Backend API tests that change `APP_DB_URL` between cases must clear cached `app.db.session.get_engine()` and `get_session_factory()` before creating the app, or stale SQLite state can leak across tests.
- Root `npm run test` delegates to the frontend workspace script; keep frontend `vitest` tooling declared, and use `--passWithNoTests` until the repo has real frontend tests.
- Backend API route tests can set `APP_DB_URL` to a temp SQLite file, seed rows directly with SQLAlchemy, and rely on `create_app()` startup to bootstrap tables.
- Frontend milestone-01 feature modules should parse backend JSON in the feature API client before state updates, and store canonical `currentFrameIndex` in feature state instead of deriving it from playback UI.
- Frontend playback should use backend-served `/api/videos/{video_id}/source`; persisted `source_path` is metadata, not a browser-safe URL.
- Frontend exact-frame flows should keep fetched blob/status state in feature hooks, but keep `URL.createObjectURL` and `URL.revokeObjectURL` in the rendered image component so browser URL lifecycle stays local to UI.
- Frontend UI tests can run under `// @vitest-environment jsdom` with `@testing-library/react`; keep `frontend/src/types/react-dom-compat.d.ts` so React DOM subpath imports still typecheck under workspace `moduleResolution: Bundler`.
- Frontend browser verification can use Playwright against local Vite dev server with intercepted `/api/videos` responses when validating UI flow rather than backend integration.

## Progresses
## 2026-04-14 22:45 CEST - US-001
- Added a typed persisted `Video` SQLAlchemy model for milestone-01 review metadata and a shared backend declarative base.
- Added a backend persistence test that creates the `videos` table in SQLite and round-trips a stored `Video` record.
- Updated `docs/engineering/data-model.md` so the milestone-01 stored video fields match the persisted model names.
- Files changed: `backend/app/db/__init__.py`, `backend/app/db/base.py`, `backend/app/db/models.py`, `backend/tests/conftest.py`, `backend/tests/models/test_video.py`, `backend/pyproject.toml`, `backend/uv.lock`, `docs/engineering/data-model.md`, `tools/ralph/prd.json`, `tools/ralph/progress.md`
- **Learnings for future iterations:**
  - `sqlalchemy` was only present transitively; backend code that imports it should declare it directly in `backend/pyproject.toml`.
  - Repo-root backend pytest needs the `backend/tests/conftest.py` path bootstrap until packaging/import setup is formalized.
  - The `Video` table is the milestone-01 persistence contract, not the indexing service itself; keep indexing/bootstrap logic for later stories.
---
## 2026-04-14 22:53 CEST - US-002
- Added a typed backend indexing service that scans configured local source dir, filters supported video suffixes, extracts backend-owned metadata, and upserts deterministic `Video` rows.
- Added a typed `ffprobe` metadata helper and service tests that verify scan persistence, repeat-scan upsert behavior, and missing-source-dir behavior without real media fixtures.
- Updated `docs/engineering/architecture.md` with milestone-01 indexing flow and deterministic ID rule.
- Quality checks run: backend `ruff`, backend `pyright`, backend `pytest`, root `npm run lint`, root `npm run typecheck`, and root `npm run test`. Root test command still fails before frontend execution because workspace script calls `vitest` but frontend package does not declare/install it.
- Files changed: `backend/app/core/config.py`, `backend/app/services/__init__.py`, `backend/app/services/video_indexing.py`, `backend/app/services/video_metadata.py`, `backend/tests/services/test_video_indexing.py`, `docs/engineering/architecture.md`
- **Learnings for future iterations:**
  - Keep video-source scanning in small backend services; API routes should call service modules, not embed path walking or metadata extraction logic inline.
  - Use deterministic IDs from relative paths so re-indexing is idempotent even before richer DB migration/bootstrap exists.
  - Root frontend test command is currently blocked by missing `vitest` dependency, so repo-wide green test runs need that toolchain gap fixed first.
---
## 2026-04-14 23:00 CEST - US-002
- Verified the backend indexing implementation against the milestone doc and PRD acceptance criteria, then marked `US-002` passing in `tools/ralph/prd.json`.
- Restored the repo-wide test command by adding frontend `vitest` tooling and switching the empty frontend suite to `vitest run --passWithNoTests`, so `npm run test` now succeeds while no frontend tests exist yet.
- Files changed: `AGENTS.md`, `frontend/package.json`, `package-lock.json`, `tools/ralph/prd.json`, `tools/ralph/progress.md`
- **Learnings for future iterations:**
  - Repo-wide quality verification depends on the frontend workspace test script even for backend-only stories; keep that toolchain healthy or root checks will fail before story verification is complete.
---
## 2026-04-14 23:08 CEST - US-003
- Added milestone-01 API route tests for video list, video detail, and unknown-id 404 behavior using temp SQLite databases.
- Implemented typed FastAPI list/detail routes, a small indexed-video catalog service, and backend session/bootstrap helpers so catalog payloads are parsed at the API boundary.
- Updated `docs/engineering/api.md` so the list/detail contract now matches `source_path` and `display_name`.
- Quality checks run: `npm run lint`, `npm run typecheck`, and `npm run test`.
- Files changed: `AGENTS.md`, `backend/app/api/videos.py`, `backend/app/core/config.py`, `backend/app/db/__init__.py`, `backend/app/db/init_db.py`, `backend/app/db/session.py`, `backend/app/main.py`, `backend/app/schemas/__init__.py`, `backend/app/schemas/video.py`, `backend/app/services/__init__.py`, `backend/app/services/video_catalog.py`, `backend/tests/api/test_videos.py`, `docs/engineering/api.md`, `tools/ralph/prd.json`, `tools/ralph/progress.md`
- **Learnings for future iterations:**
  - Keep milestone-01 catalog routes thin: route layer should validate/serialize with Pydantic, while SQLAlchemy queries stay in small service modules.
  - `APP_DB_URL` is the clean test seam for backend API coverage; no route-specific test hooks are needed when startup bootstraps the schema.
  - Old draft docs still mention `name` and `filepath`; update contracts to `display_name` and `source_path` whenever new API/UI work consumes indexed videos.
---
## 2026-04-14 23:16 CEST - US-004
- Added milestone-01 exact-frame API tests for success, unknown video, out-of-range indices, and repeated-request byte stability.
- Implemented a typed backend exact-frame service plus `GET /api/videos/{video_id}/frame/{frame_idx}` that validates canonical frame bounds before decoding PNG bytes from local video files.
- Updated exact-frame contract docs in `docs/engineering/api.md` and `docs/engineering/architecture.md` to make backend-canonical zero-based frame handling explicit.
- Quality checks run: `npm run lint`, `npm run typecheck`, and `npm run test`.
- Files changed: `AGENTS.md`, `backend/app/api/videos.py`, `backend/app/services/__init__.py`, `backend/app/services/video_frames.py`, `backend/tests/api/test_videos.py`, `docs/engineering/api.md`, `docs/engineering/architecture.md`, `tools/ralph/prd.json`, `tools/ralph/progress.md`
- **Learnings for future iterations:**
  - Keep exact-frame response handling binary at HTTP boundary with `fastapi.Response`; no JSON wrapper needed for milestone-01 frame bytes.
  - Validate `frame_idx` from persisted metadata before calling decoder so bad requests fail fast without touching media tooling.
  - API tests can pin response-byte behavior by patching `app.api.videos.load_exact_video_frame`, while unpatched cases still exercise route validation and DB lookup.
---
## 2026-04-14 23:23 CEST - US-005
- Added a small `frontend/src/features/video-review` module with typed client methods for indexed-video list/detail requests and exact-frame image requests, including runtime parsing of backend JSON payloads before they enter frontend state.
- Added feature-scoped reducer state for `selectedVideo` and canonical `currentFrameIndex`, plus Vitest coverage for payload parsing, image fetch behavior, and state transitions.
- Wired the placeholder app shell to consume the new review-state hook without building the later selection UI yet.
- Files changed: `AGENTS.md`, `basic-memory/engineering/US-005 frontend video review data module patterns.md`, `frontend/src/app/App.tsx`, `frontend/src/features/video-review/api.ts`, `frontend/src/features/video-review/api.test.ts`, `frontend/src/features/video-review/index.ts`, `frontend/src/features/video-review/state.test.ts`, `frontend/src/features/video-review/state.ts`, `tools/ralph/prd.json`, `tools/ralph/progress.md`
- **Learnings for future iterations:**
  - Keep milestone-01 frontend runtime validation close to the feature API client; UI components should receive parsed `IndexedVideo` objects, not raw `unknown` JSON.
  - Treat exact-frame fetches as binary `image/png` responses and keep object-URL lifecycle decisions in UI code that actually renders the image.
  - Reset canonical frame state when selection changes so later prev/next and jump-to-frame controls start from a stable backend-owned index.
---
## 2026-04-14 23:36 CEST - US-006
- Built the milestone-01 indexed video list and selection UI, including initial list loading, empty-state handling, and detail fetch on selection before marking the active review target.
- Added a small `useVideoReviewWorkspace` hook to keep list loading/selection state outside presentation, while reusing the existing feature-scoped canonical frame reducer.
- Added frontend UI tests with `jsdom` and `@testing-library/react`, then verified browser behavior with Playwright against local Vite app using intercepted video API responses; screenshot saved at `/tmp/us006-browser-check.png`.
- Files changed: `AGENTS.md`, `basic-memory/engineering/US-006 frontend video list selection patterns.md`, `frontend/package.json`, `frontend/src/app/App.test.tsx`, `frontend/src/app/App.tsx`, `frontend/src/app/app.css`, `frontend/src/features/video-review/index.ts`, `frontend/src/features/video-review/workspace.ts`, `frontend/src/types/react-dom-compat.d.ts`, `frontend/tsconfig.json`, `package-lock.json`, `tools/ralph/prd.json`, `tools/ralph/progress.md`
- **Learnings for future iterations:**
  - Keep list loading and selection-detail fetching in a feature hook so presentational UI stays small and later playback/exact-frame panes can read one workspace seam.
  - Under workspace `moduleResolution: Bundler`, React UI test tooling may need a local `react-dom` subpath compatibility declaration even when `@types/react-dom` is installed.
  - Browser verification for frontend-only stories can mock `/api/videos` and `/api/videos/:id` in Playwright to validate UI behavior without depending on backend fixture setup.
---
## 2026-04-15 03:07 CEST - US-007
- Replaced the playback placeholder with a real `<video>` pane that loads the selected source through a backend `/api/videos/{video_id}/source` URL while leaving canonical exact-frame state independent from playback controls.
- Reworked the right panel into a backend metadata panel that shows display name, frame count, FPS, resolution, duration, and source path for the selected review target.
- Added a backend route test for source-video bytes, updated frontend UI coverage for playback and metadata rendering, and verified the browser flow with Playwright using intercepted video APIs; screenshot saved at `/tmp/us007-browser-check.png`.
- Files changed: `AGENTS.md`, `backend/app/api/videos.py`, `backend/tests/api/test_videos.py`, `docs/engineering/api.md`, `docs/engineering/architecture.md`, `frontend/src/app/App.test.tsx`, `frontend/src/app/App.tsx`, `frontend/src/app/app.css`, `frontend/src/features/video-review/api.ts`, `frontend/src/features/video-review/index.ts`, `tools/ralph/prd.json`, `tools/ralph/progress.md`
- **Learnings for future iterations:**
  - Playback needs a backend-served URL for local-first browser access; the persisted `source_path` should stay metadata only.
  - API tests that swap `APP_DB_URL` across temp databases must clear cached session helpers first or they can read stale rows.
  - Keep playback messaging explicit that browser controls are contextual and not the source of truth for canonical frame selection.
---
## 2026-04-15 03:15 CEST - US-008
- Replaced the exact-frame placeholder with a dedicated pane that accepts frame N, validates it against selected video bounds, requests the backend exact-frame PNG, and renders the canonical image separately from playback UI.
- Extended `useVideoReviewWorkspace` to own exact-frame request state and backend-loaded blobs while keeping `currentFrameIndex` canonical only after a successful frame fetch.
- Added frontend UI coverage for jump-to-frame and same-frame reload behavior, updated architecture docs for draft-vs-canonical frame state, and verified the browser flow with Playwright using intercepted video/source/frame routes; screenshot saved at `/tmp/us008-browser-check.png`.
- Files changed: `AGENTS.md`, `basic-memory/engineering/US-008 exact frame pane and jump input patterns.md`, `docs/engineering/architecture.md`, `frontend/src/app/App.test.tsx`, `frontend/src/app/App.tsx`, `frontend/src/app/app.css`, `frontend/src/features/video-review/workspace.ts`, `tools/ralph/prd.json`, `tools/ralph/progress.md`
- **Learnings for future iterations:**
  - Keep jump-to-frame input as draft UI state; only promote frame number into canonical `currentFrameIndex` after backend exact-frame request succeeds.
  - Keep exact-frame blob fetch state in feature hooks, but create/revoke blob URLs in the rendering component so browser URL lifecycle stays local.
  - Repeated same-frame reload tests need to wait for async blob-URL replacement instead of assuming DOM `img.src` changes synchronously.
---
