## Codebase Patterns
- Exact-frame reload must hydrate `savedManualAnnotationsByFrame[frame_idx][object_id]` from fetched manual rows, not only `frameAnnotations`; otherwise saved boxes render after reload but move/resize/delete controls lose their editable source of truth.
- Frame-scoped annotation reads must return manual `FrameAnnotation` rows with `mask: null`; filtering to masked rows only breaks exact-frame manual box reload while writes still appear to succeed.
- Manifest summary routes should read stable object metadata from `ObjectTrack`, and derive `annotated_frames` plus `keyframes` from distinct `FrameAnnotation.frame_idx` queries scoped to one `video_id`.
- When adding backend ORM models, export them from `backend/app/db/__init__.py` and cover them first with a cheap SQLite `Base.metadata.create_all(engine)` plus one `Session` round-trip test.
- `uv run --project backend pytest` collects tests from repo root; keep `backend/tests/conftest.py` to add `backend/` to `sys.path` before importing `app.*`.
- Milestone-01 persisted video metadata uses `source_path` and `display_name`; keep docs, ORM fields, and future API payloads on those names.
- Milestone-01 video indexing should derive deterministic `Video.id` values from the file path relative to configured `data/videos`; repeated scans must update same row, not mint new IDs from DB order.
- Startup indexing tests should patch `app.main.VIDEO_SOURCE_DIR` and `app.main.extract_video_metadata`, then enter `TestClient(create_app())` so lifespan coverage stays real while media inspection stays fake.
- Backend video services should accept injected inspector/decoder callables in tests so unit coverage stays fast and does not require real media fixtures or `ffprobe`.
- Exact-frame route validation belongs before decode: reject any `frame_idx` outside persisted `Video.frame_count`, and patch `app.api.videos.load_exact_video_frame` in API tests when response bytes matter more than decoder internals.
- Backend API tests that change `APP_DB_URL` between cases must clear cached `app.db.session.get_engine()` and `get_session_factory()` before creating the app, or stale SQLite state can leak across tests.
- Root `npm run test` delegates to the frontend workspace script; keep frontend `vitest` tooling declared, and use `--passWithNoTests` until the repo has real frontend tests.
- Backend API route tests can set `APP_DB_URL` to a temp SQLite file, seed rows directly with SQLAlchemy, and rely on `create_app()` startup to bootstrap tables.
- Frontend milestone-01 feature modules should parse backend JSON in the feature API client before state updates, and store canonical `currentFrameIndex` in feature state instead of deriving it from playback UI.
- Annotation-foundation frontend state should store object summary separately from canonical `currentFrameIndex`, and key saved manual annotations by `frame_idx` then `object_id` so later current-frame CRUD stays backend-frame-based.
- Frontend video-open flows now fetch both `/api/videos/{id}` and `/api/videos/{id}/manifest`; workspace and app tests that mock selection must stub both routes or the UI stays in selection-error state.
- Frontend playback should use backend-served `/api/videos/{video_id}/source`; persisted `source_path` is metadata, not a browser-safe URL.
- Frontend exact-frame flows should keep fetched blob/status state in feature hooks, but keep `URL.createObjectURL` and `URL.revokeObjectURL` in the rendered image component so browser URL lifecycle stays local to UI.
- Frontend prev/next exact-frame controls should clamp with `selectedVideo.frame_count`, call the backend exact-frame fetch for the target index, and rely on the canonical-state effect to sync the frame input after success.
- Frontend UI tests can run under `// @vitest-environment jsdom` with `@testing-library/react`; keep `frontend/src/types/react-dom-compat.d.ts` so React DOM subpath imports still typecheck under workspace `moduleResolution: Bundler`.
- Frontend browser verification can use Playwright against local Vite dev server with intercepted `/api/videos` responses when validating UI flow rather than backend integration.
- Live frontend dev needs Vite to proxy relative `/api` requests to backend `127.0.0.1:8000`; otherwise real browser validation hits `5173/api/*` and fails before reaching FastAPI.
- Repo-root backend dev needs `uv --directory backend run uvicorn app.main:app --reload`; running uvicorn from repo root misses backend env/import path.
- Video-scoped create routes should verify parent `Video` existence inside a small service module, keep backend defaults there, and let FastAPI routes translate missing parents into `404`.
- Manual frame-annotation writes should verify `video_id`, canonical `frame_idx`, and `object_id` ownership in a backend service, then upsert by `(video_id, frame_idx, object_id)` and clear mask fields for `source = "manual"` writes.
- Review object selection should stay manifest-backed in frontend state; create/select UI should drive reducer `selectedObjectId`, and App tests for that flow must stub both manifest and object-create routes.

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
## 2026-04-15 03:24 CEST - US-009
- Added previous and next exact-frame actions beside the jump form, with button state clamped against the selected video's canonical frame bounds.
- Kept frame stepping backend-canonical by routing each step through `loadExactFrame`, then letting the existing canonical-state effect resync the frame input only after a successful fetch.
- Added frontend UI coverage for stepping from frame 0 to 1, jumping to frame 83, stepping back to 82, and verifying disabled boundary buttons; verified the browser flow with Playwright using intercepted video/source/frame routes and saved `/tmp/us009-browser-check.png`.
- Files changed: `AGENTS.md`, `docs/engineering/architecture.md`, `frontend/src/app/App.test.tsx`, `frontend/src/app/App.tsx`, `frontend/src/app/app.css`, `tools/ralph/prd.json`, `tools/ralph/progress.md`
- **Learnings for future iterations:**
  - Prev/next exact-frame actions should reuse the backend fetch path instead of mutating frame UI state locally, or the displayed image and canonical index can drift.
  - Clamp nav requests in the UI and disable boundary buttons so frame `0` and `frame_count - 1` never issue redundant backend calls.
  - When asserting stepped frame input values in Vitest, wait for the input sync effect after the canonical frame label changes.
---
## 2026-04-15 03:31 CEST - Milestone-01 Ralph audit
- Audited `tools/ralph/prd.json` against `docs/plans/milestone-01-exact-frame-review.md`, current backend/frontend code, and current docs.
- Verified `US-001` through `US-009` have concrete implementation coverage in code/tests/docs, and reran repo checks with `npm run test` plus `npm run typecheck`.
- Found uncovered milestone gaps: backend startup only calls `initialize_database()` in `backend/app/main.py`, so no real indexing happens on app boot, and current browser verification for UI stories uses intercepted API responses instead of a real local video.
- Added `US-010` for startup indexing integration and `US-011` for real-video milestone validation.
- Files changed: `tools/ralph/prd.json`, `tools/ralph/progress.md`
- **Learnings for future iterations:**
  - Service-level completion is not same as milestone-ready integration; Ralph stories need explicit startup or orchestration tasks when UX depends on background boot behavior.
  - Mocked browser checks are good for UI shape, but milestone acceptance still needs one unmocked local-video pass when PRD validation says "manual check on at least one video".
---
## 2026-04-15 03:49 CEST - US-010
- Wired backend startup to bootstrap tables and then run milestone-01 video indexing automatically through a small `app.main` helper that reuses the existing indexing service.
- Added a `create_app()` lifespan regression test that patches startup source-dir and metadata inspection, drops a temp video into a temp `videos/` tree, and verifies `/api/videos` returns the indexed row without manual DB seeding.
- Updated startup/indexing docs and root agent guidance so local videos belong in `data/videos/` and backend startup indexing is part of normal local review setup.
- Files changed: `AGENTS.md`, `backend/app/main.py`, `backend/tests/api/test_videos.py`, `docs/engineering/architecture.md`, `docs/runbooks/dev-setup.md`, `tools/ralph/prd.json`, `tools/ralph/progress.md`
- **Learnings for future iterations:**
  - Keep startup orchestration in a tiny helper near the FastAPI lifespan and reuse service modules underneath instead of moving indexing into route or DB bootstrap code.
  - Resolve startup defaults like source dir and metadata inspector at call time, not in default-arg bindings, or monkeypatch-based lifespan tests become brittle.
  - For startup integration coverage, assert against `/api/videos` after entering `TestClient(create_app())`; that proves bootstrap, indexing, and serialization work together.
---
## 2026-04-15 03:58 CEST - US-011
- Ran milestone-01 smoke validation against a real local video by copying `data/examples/bedroom.mp4` into `data/videos/`, starting live backend/frontend, opening the app in Playwright, selecting the indexed video, loading frame `42`, stepping to `43`, and stepping back to `42`.
- Fixed two live-dev gaps uncovered by the real-browser pass: repo-root `npm run backend:dev` now launches uvicorn from `backend/`, and Vite now proxies relative `/api` requests to backend so unmocked browser checks hit FastAPI instead of `5173/api/*`.
- Updated the dev runbook with concrete real-video setup and smoke-check steps, including repeated exact-frame hash verification; browser screenshot saved at `/tmp/us011-browser-check.png`.
- Files changed: `AGENTS.md`, `docs/runbooks/dev-setup.md`, `frontend/vite.config.ts`, `package.json`, `tools/ralph/prd.json`, `tools/ralph/progress.md`
- **Learnings for future iterations:**
- Mocked UI checks can hide local-stack issues; always run one unmocked browser pass before calling milestone validation complete.
- Use a real file inside `data/videos/` for smoke checks; current deterministic relative-path indexing does not support symlinks that resolve outside the source tree.
- Real frontend dev for this repo depends on Vite proxying `/api` to backend port `8000`, while repo-root backend dev must enter `backend/` so `app.main` imports resolve.
---
## 2026-04-17 00:02 CEST - US-001
- Added persisted `ObjectTrack` SQLAlchemy model with stable `id`, `video_id`, `label`, `color`, and `status` fields.
- Added backend model test that creates `object_tracks` in SQLite and round-trips one object row for one persisted video.
- Updated milestone memory plus root `AGENTS.md` with backend ORM export and model-test pattern.
- Files changed: `AGENTS.md`, `backend/app/db/__init__.py`, `backend/app/db/models.py`, `backend/tests/models/test_object_track.py`, `tools/ralph/progress.md`
- **Learnings for future iterations:**
  - New backend ORM models should stay reachable from `app.db` by updating `backend/app/db/__init__.py`, or tests and services lose stable imports.
  - Cheap model-level persistence coverage in this repo does not need API fixtures; use SQLite `Base.metadata.create_all(engine)` plus one SQLAlchemy `Session` round trip.
  - SAM2 demo has no reusable persisted object-track storage pattern; for object identity work, reuse stops at keeping durable DB state separate from runtime predictor state.
---
## 2026-04-17 00:14 CEST - US-001
- Verified existing `ObjectTrack` implementation on branch against user-provided annotation-foundation PRD, after finding branch-local Ralph backlog files still pointed at old milestone-01 work.
- Ran story-specific and repo-wide quality checks: `uv run --project backend pytest backend/tests/models/test_object_track.py -q`, `npm run lint`, `npm run typecheck`, and `npm run test`.
- Synced `tools/ralph/prd.json` to the annotation-foundation backlog and marked `US-001` passed there.
- Files changed: `tools/ralph/prd.json`, `tools/ralph/progress.md`
- **Learnings for future iterations:**
  - When Ralph branch already contains code for story, verify against prompt-provided PRD before writing more code; backlog files on branch may lag behind requested milestone.
  - For backend-only story verification in this repo, still run root `npm` quality commands because frontend workspace tooling is part of green bar.
  - No SAM2 demo reuse needed for persisted object-track storage; reuse boundary remains runtime-session ideas, not DB schema.
---
## 2026-04-17 01:09 CEST - US-002
- Added persisted `FrameAnnotation` ORM model plus a small manifest query service and typed manifest schemas for review bootstrap reads.
- Implemented `GET /api/videos/{video_id}/manifest` with empty and populated backend tests covering stable object ids, annotated frame indices, and keyframe indices for one video.
- Updated required engineering docs and root `AGENTS.md` so manifest contract, storage rules, and backend query pattern stay aligned.
- Files changed: `AGENTS.md`, `backend/app/api/videos.py`, `backend/app/db/__init__.py`, `backend/app/db/models.py`, `backend/app/schemas/__init__.py`, `backend/app/schemas/video.py`, `backend/app/services/__init__.py`, `backend/app/services/video_manifest.py`, `backend/tests/api/test_videos.py`, `docs/engineering/api.md`, `docs/engineering/architecture.md`, `docs/engineering/data-model.md`, `tools/ralph/prd.json`, `tools/ralph/progress.md`
- **Learnings for future iterations:**
  - Manifest reads need real persisted frame rows; without `FrameAnnotation`, `annotated_frames` and `keyframes` become guesswork instead of canonical backend summaries.
  - Keep manifest query logic in a dedicated backend service so route layer only handles HTTP errors and typed response assembly.
  - Manifest payload should expose stable string object ids plus backend zero-based frame indices; do not mix in playback time or UI-local object state.
---
## 2026-04-17 01:16 CEST - US-003
- Added `POST /api/videos/{video_id}/objects` with a small backend service that verifies parent video existence, persists one stable `ObjectTrack`, and returns typed object summary fields for later object-panel work.
- Added API tests for successful object creation plus unknown-video `404`, including a temp-SQLite persistence assertion after the request.
- Updated required engineering docs and root `AGENTS.md` so object-create defaults and video-scoped service pattern stay explicit.
- Files changed: `AGENTS.md`, `backend/app/api/videos.py`, `backend/app/schemas/__init__.py`, `backend/app/schemas/video.py`, `backend/app/services/__init__.py`, `backend/app/services/object_tracks.py`, `backend/tests/api/test_videos.py`, `docs/engineering/api.md`, `docs/engineering/architecture.md`, `docs/engineering/data-model.md`, `tools/ralph/prd.json`, `tools/ralph/progress.md`
- **Learnings for future iterations:**
  - Keep video-scoped create routes thin: service verifies parent `Video`, assigns backend defaults, commits, then route only maps `None` to `404` and serializes response.
  - API create-route coverage in this repo should assert both HTTP payload and persisted SQLite row, not only status code.
  - SAM2 demo has no reusable object-create backend path here; reuse remains out of scope for this story.
---
## 2026-04-17 01:26 CEST - US-004
- Added `PUT /api/videos/{video_id}/annotations/frame/{frame_idx}` plus `DELETE /api/videos/{video_id}/annotations/frame/{frame_idx}/object/{object_id}` with a small backend service for manual frame-box persistence on canonical backend frames.
- Added API coverage for create, update, reload, and delete on one frame, and updated engineering docs plus root `AGENTS.md` so manual box contract and storage guardrails stay aligned.
- Files changed: `AGENTS.md`, `backend/app/api/videos.py`, `backend/app/db/models.py`, `backend/app/schemas/__init__.py`, `backend/app/schemas/video.py`, `backend/app/services/__init__.py`, `backend/app/services/manual_frame_annotations.py`, `backend/tests/api/test_videos.py`, `docs/engineering/api.md`, `docs/engineering/architecture.md`, `docs/engineering/data-model.md`, `tools/ralph/prd.json`, `tools/ralph/progress.md`
- **Learnings for future iterations:**
  - Manual box writes should force `source = "manual"` in backend service code instead of trusting client payload.
  - Reload coverage for frame-annotation CRUD should reopen SQLite in a fresh session after update, then delete and confirm the row is gone.
  - SAM2 demo has no reusable manual box CRUD flow for this repo; reuse boundary still stops at SAM2 runtime/session ideas, not annotation persistence APIs.
---
## 2026-04-17 01:35 CEST - US-005
- Added typed frontend client methods and runtime payload parsing for manifest, object create, manual annotation upsert, and manual annotation delete routes.
- Expanded review feature state to keep object summaries, selected object identity, and saved manual annotations keyed by canonical frame index separately from `currentFrameIndex`.
- Added frontend tests for new API payload parsing and reducer state transitions.
- Files changed: `AGENTS.md`, `frontend/src/features/video-review/api.ts`, `frontend/src/features/video-review/api.test.ts`, `frontend/src/features/video-review/index.ts`, `frontend/src/features/video-review/state.ts`, `frontend/src/features/video-review/state.test.ts`, `tools/ralph/prd.json`, `tools/ralph/progress.md`
- **Learnings for future iterations:**
  - Keep backend-contract parsing inside `frontend/src/features/video-review/api.ts`; reducers and components should receive typed values only.
  - Saved manual annotation state should be keyed by backend `frame_idx` and `object_id`, not derived from current playback state or a single current-frame slot.
  - This story stops at client/state boundaries; object-panel UI wiring belongs in later stories.
---
## 2026-04-17 03:44 CEST - US-005
- Implemented typed manifest, object-create, manual-annotation upsert, and manual-annotation delete frontend clients, then wired video selection to load manifest state alongside video detail.
- Expanded review reducer state with object summaries, manifest frame markers, selected object identity, and saved manual annotations keyed by backend `frame_idx` and `object_id`; updated app/workspace tests to mock manifest fetches.
- Files changed: `AGENTS.md`, `frontend/src/app/App.tsx`, `frontend/src/app/App.test.tsx`, `frontend/src/features/video-review/api.ts`, `frontend/src/features/video-review/api.test.ts`, `frontend/src/features/video-review/index.ts`, `frontend/src/features/video-review/state.ts`, `frontend/src/features/video-review/state.test.ts`, `frontend/src/features/video-review/workspace.ts`, `frontend/src/features/video-review/workspace.test.ts`, `tools/ralph/prd.json`, `tools/ralph/progress.md`
- **Learnings for future iterations:**
  - Opening a video in frontend now depends on both detail and manifest routes; if tests or future hooks only stub `/api/videos/{id}`, selection fails before playback or exact-frame UI renders.
  - Keep selected object identity in annotation-foundation state, not the SAM2 session slice, so later manual-box and object-panel work can share one canonical selection source.
  - Manual annotation CRUD state can stay reducer-only until UI story starts; this keeps US-005 scoped to typed boundaries and state transitions.
---
## 2026-04-17 03:54 CEST - US-006
- Replaced exact-frame free-text `Object ID` entry with a left-side manifest-backed object panel that lists persisted objects, creates new ones through `POST /api/videos/{video_id}/objects`, and keeps selection in reducer-backed frontend state.
- Added frontend coverage for manifest-backed object panel render, create-and-select flow, and removal of the old raw object-id input; browser-verified create/select flow with Playwright against mocked `/api` responses and saved screenshot at `/tmp/video-annotator-us006-object-panel.png`.
- Files changed: `AGENTS.md`, `frontend/src/app/App.tsx`, `frontend/src/app/App.test.tsx`, `frontend/src/app/app.css`, `frontend/src/features/video-review/state.ts`, `frontend/src/features/video-review/workspace.ts`, `tools/ralph/prd.json`, `tools/ralph/progress.md`
- **Learnings for future iterations:**
  - Review object selection should flow through manifest-backed `objectSummaries` plus reducer `selectedObjectId`; reintroducing free-text object typing will break persisted identity flow.
  - App-level object panel tests must stub both manifest reads and object-create POSTs, because selection uses manifest preload while creation appends returned summaries locally.
  - Exact-frame submit is safer when it reads current form value on submit; this avoids stale controlled-input state during React test timing.
---
## 2026-04-17 04:11 CEST - US-007
- Fixed the missing draw-save-reload path for exact-frame manual boxes by returning manual frame-annotation rows from backend reads with `mask: null`, auto-saving one normalized manual box on canvas pointer-up, and rendering the saved box again after reloading the same canonical frame.
- Added regression coverage for backend frame reads plus frontend draw-save-reload behavior, updated required engineering docs, refreshed reusable memory notes, and browser-verified the flow with Playwright against mocked `/api` routes; screenshot saved at `/tmp/video-annotator-us007-draw-save-reload.png`.
- Files changed: `AGENTS.md`, `backend/app/api/videos.py`, `backend/app/schemas/sam2.py`, `backend/app/services/frame_annotations.py`, `backend/tests/api/test_videos.py`, `basic-memory/engineering/Frontend annotation foundation client and state pattern.md`, `basic-memory/engineering/Manual frame annotation route pattern.md`, `docs/engineering/api.md`, `docs/engineering/architecture.md`, `docs/engineering/data-model.md`, `frontend/src/app/App.test.tsx`, `frontend/src/app/App.tsx`, `frontend/src/features/video-review/exact-frame-canvas.tsx`, `frontend/src/features/video-review/state.ts`, `frontend/src/features/video-review/workspace.ts`, `tools/ralph/prd.json`, `tools/ralph/progress.md`
- **Learnings for future iterations:**
  - Backend `GET /api/videos/{video_id}/annotations/frame/{frame_idx}` must include manual rows even when no mask file exists yet; otherwise reload loses saved boxes while manual writes still return `200`.
  - Frontend manual-box fixtures should use `mask: null` for manual annotations, while SAM2 fixtures keep `mask.path`; mixing those shapes hides reload regressions.
  - Pointer-up auto-save can coexist with same-frame SAM2 draft flow if saved manual overlays are rendered separately and duplicate draft rendering is suppressed from saved-box state.
---
## 2026-04-17 04:28 CEST - US-008
- Added current-frame saved manual box edit flow in frontend: reloaded manual rows now hydrate editable saved-box state, selected saved boxes can move by drag, resize from one corner handle, and delete through the existing frame-scoped delete route.
- Added regression coverage for reducer reload hydration plus app-level move/resize/delete behavior, updated engineering docs and root `AGENTS.md`, and browser-verified the UI with Playwright against mocked `/api` routes; screenshot saved at `/tmp/video-annotator-us008-edit-delete.png`.
- Files changed: `AGENTS.md`, `basic-memory/engineering/Frontend annotation foundation client and state pattern.md`, `docs/engineering/api.md`, `docs/engineering/architecture.md`, `docs/engineering/data-model.md`, `frontend/src/app/App.test.tsx`, `frontend/src/app/App.tsx`, `frontend/src/app/app.css`, `frontend/src/features/video-review/exact-frame-canvas.tsx`, `frontend/src/features/video-review/state.test.ts`, `frontend/src/features/video-review/state.ts`, `frontend/src/features/video-review/workspace.ts`, `tools/ralph/prd.json`, `tools/ralph/progress.md`
- **Learnings for future iterations:**
  - Frame reload must repopulate saved-manual edit state from fetched manual rows; overlay-only reload state makes boxes visible but non-editable.
  - One-corner resize plus box-body drag is enough for current-frame manual box correction in this repo; no heavier canvas library needed yet.
  - Browser verification for this story can stay frontend-only by mocking `/api` while still using real drag interactions and current-frame delete reload checks in Playwright.
---
