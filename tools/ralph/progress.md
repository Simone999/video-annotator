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
