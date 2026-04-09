# M0 - Skeleton

Status: `in_progress`

## Milestone summary

Milestone 0 establishes the project skeleton required by the spec: repo structure, required documentation foundations, an empty React + TypeScript + Vite shell, a FastAPI hello-world backend, SQLite initialization, and backend video indexing metadata.

## Workstreams

- Foundation scaffold
- Required documentation baseline
- Frontend shell
- Backend service foundation
- Persistence and video indexing
- Milestone validation and tracking

## Progress tracking

- Task statuses use: `todo`, `ready`, `in_progress`, `blocked`, `in_review`, `done`.
- Milestone statuses use: `not_started`, `in_progress`, `blocked`, `done`.
- A task moves to `ready` only when all listed dependencies are `done`.
- Every task status change must update both this file and `docs/delivery/progress.md`.
- Any blocker must be added to `docs/delivery/blockers.md`.
- Milestone percent complete = required tasks marked `done` / 9 required tasks.
- Milestone `done` requires all required tasks to be `done` with validation evidence recorded.

## Task list

### T01 - Scaffold Milestone 0 repository layout and placeholders
Status: done

Outcome:
- The required top-level directory structure exists for frontend, backend, local data, exports, masks, and engineering/product docs.
- Placeholder files make the scaffold navigable without implying unimplemented behavior.

Scope:
- Files/modules/components likely involved:
  - `frontend/`
  - `backend/`
  - `data/`
  - `exports/`
  - `masks/`
  - `docs/product/`
  - `docs/engineering/`
  - `.gitignore`
  - `README.md`

Dependencies:
- none

Acceptance criteria:
- The repo contains `frontend/`, `backend/`, `data/`, `exports/`, `masks/`, `docs/product/`, and `docs/engineering/` in names and roles aligned with the spec.
- Placeholder files or READMEs explain the purpose of empty directories where needed.
- No build, lint, typecheck, or test command is documented unless the corresponding config exists.

Validation:
- Manual verification that the required directory layout is present and matches the spec’s scaffold.
- Manual verification that local-only storage paths are clearly documented or ignored appropriately.

Risk:
- low

Parallelizable:
- no

Recommended owner type:
- infra

Notes:
- Keep the scaffold narrow. Do not add feature behavior beyond Milestone 0 requirements.

### T02 - Write product, ADR, and runbook baseline docs
Status: done

Outcome:
- Product requirements, initial architecture decisions, and the runbook exist with Milestone 0 scope and invariants captured.

Scope:
- Files/modules/components likely involved:
  - `docs/product/requirements.md`
  - `docs/engineering/adrs/README.md`
  - `docs/engineering/adrs/0001-backend-decoded-frames-canonical.md`
  - `docs/engineering/adrs/0002-react-fastapi-split.md`
  - `docs/engineering/adrs/0003-sam2-isolated-service.md`
  - `docs/engineering/adrs/0004-masks-on-disk.md`
  - `docs/engineering/runbook.md`

Dependencies:
- T01

Acceptance criteria:
- The product requirements doc covers problem, users, scope, success criteria, and non-goals for the local-first reviewer.
- The ADR set includes explicit records for backend-decoded frames as canonical, the React/FastAPI split, SAM2 isolation, and masks on disk or local filesystem storage.
- The runbook covers local startup expectations, storage locations, model/cache placeholders, and common-recovery sections without pretending later-milestone steps already exist.

Validation:
- Manual review against the required documentation set in the spec.
- Manual review that the docs preserve local-only, deterministic-frame, and no-browser-time-canonical constraints.

Risk:
- low

Parallelizable:
- yes

Recommended owner type:
- docs

Notes:
- Mark unresolved operational details explicitly rather than implying they are already solved.

### T03 - Define Milestone 0 API, data-model, and frontend interaction contracts
Status: ready

Outcome:
- The exact Milestone 0 contracts are documented for the health/indexing API, the initial SQLite schema, and the empty two-pane UI shell, with explicit deferred sections for later-milestone behavior required by the spec.

Scope:
- Files/modules/components likely involved:
  - `docs/engineering/api-spec.md`
  - `docs/engineering/data-model.md`
  - `docs/engineering/frontend-interaction-spec.md`

Dependencies:
- T01

Acceptance criteria:
- The API spec defines the Milestone 0 backend route set, request shapes, response fields, request or response examples, error behavior, and a placeholder section for future streaming behavior.
- The data-model spec defines the initial `videos` table, local file-layout assumptions, the frame-indexing contract, and explicit deferred sections for object and mask lifecycle rules.
- The frontend interaction spec defines the placeholder two-pane layout, reserved shortcut vocabulary, and explicit deferred sections for tools, selection rules, and timeline behavior.

Validation:
- Manual review that all Milestone 0 contract gaps left implicit by the spec are resolved explicitly here.
- Manual review that zero-based frame indexing and backend-decoded-frame canonical rules remain intact.

Risk:
- medium

Parallelizable:
- yes

Recommended owner type:
- fullstack

Notes:
- The spec is explicit about deliverables but not every endpoint or schema detail. Resolve those details here before implementation tasks proceed.

### T04 - Stub remaining milestone-required engineering docs
Status: ready

Outcome:
- The SAM2 integration spec, export spec, and test plan exist as Milestone 0 foundations with future work clearly deferred.

Scope:
- Files/modules/components likely involved:
  - `docs/engineering/sam2-integration-spec.md`
  - `docs/engineering/export-spec.md`
  - `docs/engineering/test-plan.md`

Dependencies:
- T01

Acceptance criteria:
- Each required engineering doc exists and distinguishes Milestone 0 scope from later milestones.
- The SAM2 and export docs state local-only assumptions and defer unsupported implementation details without contradiction.
- The test plan identifies expected unit, integration, UI, and golden-fixture coverage areas and what Milestone 0 can realistically validate now.

Validation:
- Manual review that the required documentation set is complete after this task.
- Manual review that deferred areas are called out explicitly instead of silently omitted.

Risk:
- low

Parallelizable:
- yes

Recommended owner type:
- docs

Notes:
- No SAM2 worker or export pipeline implementation belongs in this task.

### T05 - Scaffold frontend app shell and empty two-pane layout
Status: ready

Outcome:
- A React + TypeScript + Vite frontend exists and renders an empty shell aligned to the playback-pane and exact-frame-pane workflow.

Scope:
- Files/modules/components likely involved:
  - `frontend/package.json`
  - `frontend/tsconfig.json`
  - `frontend/vite.config.ts`
  - `frontend/index.html`
  - `frontend/src/main.tsx`
  - `frontend/src/app/App.tsx`
  - `frontend/src/components/layout/`
  - `frontend/src/features/video/`
  - `frontend/src/features/annotations/`

Dependencies:
- T01
- T03

Acceptance criteria:
- The frontend scaffold uses React + TypeScript + Vite as required by the spec.
- The rendered shell includes placeholder regions for the playback pane, exact-frame pane, and future controls/status.
- The layout works on desktop and mobile without implying browser-time-based annotation behavior.

Validation:
- Launch the scaffolded frontend locally and confirm the placeholder shell renders.
- Manual responsive check for desktop and narrow viewport layouts.

Risk:
- low

Parallelizable:
- yes

Recommended owner type:
- frontend

Notes:
- Preserve the two-pane center workflow and shortcut vocabulary, but do not implement annotation behavior yet.

### T06 - Scaffold backend FastAPI service and local health route
Status: ready

Outcome:
- A Python 3.12, uv-managed FastAPI backend exists with app startup and a minimal local smoke-test route.

Scope:
- Files/modules/components likely involved:
  - `backend/pyproject.toml`
  - `backend/app/main.py`
  - `backend/app/api/`
  - `backend/app/core/`
  - `backend/app/schemas/`

Dependencies:
- T01

Acceptance criteria:
- The backend scaffold uses FastAPI on Python 3.12 with uv-managed project metadata.
- A minimal local route responds successfully for smoke testing.
- The backend package structure matches the spec closely enough to add database and service modules next.

Validation:
- Start the backend locally with a uv-managed server command.
- Request the health or hello-world endpoint and confirm a successful response.

Risk:
- low

Parallelizable:
- yes

Recommended owner type:
- backend

Notes:
- Do not introduce auth, gallery flows, or generic demo features.

### T07 - Add SQLite bootstrap and initial `videos` schema
Status: todo

Outcome:
- The backend can initialize a local SQLite database containing the first persisted video metadata schema.

Scope:
- Files/modules/components likely involved:
  - `backend/app/db/`
  - `backend/app/models/`
  - `backend/app/db/init_db.py`
  - `data/`

Dependencies:
- T03
- T06

Acceptance criteria:
- The application can create or open the local SQLite database in the repository’s local storage area.
- The initial schema includes the `videos` table with fields defined in the data-model spec.
- Database initialization is safe to rerun locally without destructive side effects.

Validation:
- Initialize the database and inspect the resulting schema for the `videos` table.
- Manual verification that database location and lifecycle match the runbook and local-only expectations.

Risk:
- medium

Parallelizable:
- yes

Recommended owner type:
- backend

Notes:
- Use the contract from T03. Do not invent extra persistence layers or remote dependencies.

### T08 - Implement video indexing service and metadata API
Status: todo

Outcome:
- The backend can inspect a local video, derive canonical metadata, persist it, and return it via the documented API.

Scope:
- Files/modules/components likely involved:
  - `backend/app/api/videos.py`
  - `backend/app/services/video_frames.py`
  - `backend/app/schemas/video.py`
  - `backend/app/models/video.py`

Dependencies:
- T03
- T06
- T07

Acceptance criteria:
- The indexing flow decodes a local video on the backend and returns fps, total frames, resolution, and duration.
- Indexed metadata is persisted to SQLite using the `videos` table contract.
- Error handling for invalid or missing video inputs is documented and implemented within Milestone 0 scope.

Validation:
- Exercise the documented indexing endpoint with a local sample video and confirm the response fields.
- Verify that the indexed video row is persisted in SQLite with matching metadata.
- Use the committed fixture `examples/bedroom.mp4` for the default smoke check so results are repeatable across sessions.

Risk:
- medium

Parallelizable:
- no

Recommended owner type:
- backend

Notes:
- Backend-decoded frames are canonical. Do not derive canonical frame IDs from browser `currentTime`.

### T09 - Run Milestone 0 smoke validation and close the milestone tracker
Status: todo

Outcome:
- Milestone 0 has recorded validation evidence, follow-up tasks if needed, and consistent status updates across the delivery tracker.

Scope:
- Files/modules/components likely involved:
  - `docs/delivery/milestones.md`
  - `docs/delivery/progress.md`
  - `docs/delivery/blockers.md`
  - `docs/engineering/runbook.md`

Dependencies:
- T02
- T03
- T04
- T05
- T06
- T07
- T08

Acceptance criteria:
- The frontend shell, backend health route, SQLite bootstrap, and video indexing flow are all validated end-to-end.
- Validation evidence, follow-up tasks, and any remaining risks are recorded in the delivery tracker.
- Milestone status only moves to `done` if every required task is validated and complete.

Validation:
- Execute the Milestone 0 smoke checklist from the runbook and record results.
- Review the delivery tracker files to confirm status, percent complete, and notes are consistent.
- Run the indexing smoke check against the committed fixture `examples/bedroom.mp4` unless a later task replaces it with a better checked-in sample.

Risk:
- medium

Parallelizable:
- no

Recommended owner type:
- test

Notes:
- Do not mark `done` based on implementation alone. Create new tasks for any discovered work instead of hiding it here.

## Execution order

- Phase 1: T01
- Phase 2: T02, T03, T04, T06
- Phase 3: T05, T07
- Phase 4: T08
- Phase 5: T09

## Parallel groups

- Group A: T02, T03, T04, T06 after T01 is done
- Group B: T05 and T07 after their dependencies are done
- Group C: T08 after T03, T06, and T07 are done
- Group D: T09 after T02 through T08 are done

## Critical unknowns

- The spec names Milestone 0 video indexing but does not fully prescribe the exact endpoint path or request shape; T03 must define that contract before T08 starts.
- The spec does not mandate a specific metadata-extraction library or SQLite migration tool for Milestone 0.
- The minimum placeholder content for the empty frontend shell is only partially specified beyond the two-pane workflow and reserved shortcuts.
