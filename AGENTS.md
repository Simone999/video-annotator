# AGENTS.md

## Preliminary
- Use `caveman:full` style to talk with user, write docs and tasks.
- Use `basic-memory` MCP as knowledge base. Search and write durable notes (project: `video-annotator`).
- Make no assumptions. If notes/docs do not answer, ask user and record answer.
- When user corrects you or you solve hard problem, write note.
- If doc too long or information hard to find, write note.

## Product constraints
- The backend-decoded frame index is canonical.
- Never use browser video time as the source of annotation truth.
- Keep the app local-first.
- Prefer small typed modules and clear service boundaries.

## Architecture rules

- Frontend: React + TypeScript
- Backend: FastAPI + Python 3.12
- Parse data shapes at boundaries
- Backend API tests can point `APP_DB_URL` at a temp SQLite file; `create_app()` startup should bootstrap tables before requests hit routes.
- Backend API tests that switch `APP_DB_URL` between cases should clear cached `app.db.session.get_engine()` and `get_session_factory()` before building the app.
- Backend API tests that call `create_app()` should patch `app.main.VIDEO_SOURCE_DIR` to a temp empty dir unless startup indexing is the thing under test, or local `data/videos/` files can leak into assertions.
- Exact-frame routes should validate `frame_idx` against persisted `Video.frame_count` before decode, and API tests can patch `app.api.videos.load_exact_video_frame` to avoid real media fixtures.
- Video-scoped create routes should verify parent `Video` existence inside a small service module and let the route translate missing parent rows into HTTP 404.
- Manual frame-annotation writes should live in a small service that verifies `video_id`, canonical `frame_idx`, and `object_id` ownership, then upserts by `(video_id, frame_idx, object_id)` and clears mask fields for `source = "manual"` writes.
- Manifest reads should summarize one `video_id` from DB state: object summary comes from `ObjectTrack`, while `annotated_frames` and `keyframes` come from distinct `FrameAnnotation.frame_idx` queries, never playback-derived estimates.
- Startup indexing tests can patch `app.main.VIDEO_SOURCE_DIR` and `app.main.extract_video_metadata` before `create_app()` so lifespan coverage uses temp files instead of real media tooling.
- When adding backend ORM models, export them from `backend/app/db/__init__.py` and prefer a cheap SQLite `Base.metadata.create_all(engine)` plus one `Session` round-trip test before wiring higher layers.
- Exact frame retrieval through the backend video frame service.
- SAM2 isolated behind a dedicated adapter/service module.
- Persist metadata in the DB and masks on disk.

## Code style

### Python
- Python 3.12 via `uv`
- strong typing (Pyright strict mode): PEP 695 type parameters, `Annotated`. No `TypeVar`, `Generic`
- create stubs for poor typed third-party code.
- no `from __future__ import annotations` unless strictly necessary
- use `is` for enum member identity checks, including `StrEnum`, use `==` only for value comparison
- prefer `Sequence[T]` over `tuple[T, ...]`
- google docstring with typed `Args:`
- small clear functions
- service-oriented modules
- avoid giant files

### Frontend
- domain-oriented feature folders
- typed API clients
- live local browser checks rely on Vite proxying relative `/api` requests to backend `127.0.0.1:8000`; keep frontend API URLs relative and keep proxy config aligned with backend dev port
- milestone-01 frontend feature API modules should parse backend JSON with local runtime assertions before data enters UI state; keep canonical `currentFrameIndex` in feature state, not derived from playback components
- milestone-01 playback should use a backend-served `/api/videos/{video_id}/source` URL; `source_path` is metadata, not a browser-safe URL
- milestone-01 exact-frame fetches should keep blob/media state in feature hooks, while rendered components own `URL.createObjectURL` lifecycle for displayed images
- milestone-01 prev/next exact-frame controls should request the backend frame for the clamped target index and only let successful fetches update canonical frame/input UI; do not mutate `currentFrameIndex` optimistically in the component
- annotation-foundation frontend state should keep `objectSummaries`, `selectedObjectId`, and saved manual annotations keyed by canonical `frame_idx` plus `object_id`, separate from `currentFrameIndex`
- avoid mixing business logic into presentational components
- frontend UI tests can use `// @vitest-environment jsdom` with `@testing-library/react`; keep `frontend/src/types/react-dom-compat.d.ts` so workspace-hoisted React DOM subpath imports still typecheck under `moduleResolution: Bundler`
- keep `vitest` declared in `frontend/package.json`; until real frontend tests exist, repo-root `npm run test` should use `vitest run --passWithNoTests`

## Required docs

When behavior or contracts change, update the relevant docs under `docs/`.

At minimum:
- `docs/engineering/api.md`
- `docs/engineering/data-model.md`
- `docs/engineering/architecture.md`

## Milestone workflow

Before coding:
1. read this file
2. read the relevant file in `docs/plans/`
3. define what to reuse from sam2 demo
4. produce a short implementation plan
5. challenge the plan. Add gotchas and guardrails
6. then code

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

## Done when

A task is done only if:
- Relevant tests pass
- Types/lint pass
- Docs updated if API or behavior changed
- Changes match the milestone doc under `docs/plans/`
- Struggles, user corrections, and impactful decisions recorded

## Commands

### Frontend
- dev: `npm run dev`
- tests: `npm run test`

### Backend
- dev: `npm run backend:dev`
- tests: `uv --project backend pytest`

### Quality commands

- `npm run format`
- `npm run lint:fix`
- `npm run lint`
- `npm run typecheck`
- `npm run test`

## Dev setup gotchas

- repo-root backend dev should run through `uv --directory backend run uvicorn app.main:app --reload`; running `uvicorn` from repo root misses backend env/import path

## Git Workflow

- Use feature branches for tasks, for example `tasks/task-123-feature-name`.
- Commit format: `TASK-123 - Title of task`
- PR title format: `{taskId} - {taskTitle}`
- Use `gh` whenever possible for PRs and issues.
