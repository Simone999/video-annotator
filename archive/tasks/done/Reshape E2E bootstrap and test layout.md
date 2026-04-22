---
id: task-reshape-e2e-bootstrap-and-test-layout
title: Reshape E2E bootstrap and test layout
status: done
completed:
steps:
- creation
- planning
- execution
- wrap_up
tags:
- task
- backend
- frontend
- tests
- e2e
- alembic
- playwright
permalink: video-annotator/tasks/reshape-e2e-bootstrap-and-test-layout
---

# Reshape E2E bootstrap and test layout

## Creation Phase

### Description

Replace the mixed startup-seed path with explicit database migration plus seeding, move frontend and browser tests into the requested directory structure, and make local E2E flow deterministic from reset to browser run.

### Scope

- In scope: add Alembic environment under `backend/alembic/`, remove runtime schema creation from FastAPI startup, move reusable E2E seed helpers under `backend/app/db/seeds/`, add `backend/scripts/seed_e2e.py`, move backend tests into `backend/tests/{unit,integration}/`, move frontend tests into `frontend/tests/{unit,component}/`, move Playwright into `tests/e2e/`, wire `global.setup.ts`, add `.env.development` plus `.env.e2e`, switch frontend API default to `VITE_API_BASE_URL`, update affected docs and memory truth
- Out of scope: new review behavior, new export behavior, backend SPA serving, or unrelated UI polish

### Affected Features

- [[Video Ingest and Exact-Frame Review]]
- [[Review Workspace Ergonomics]]

### Acceptance Criteria

- [x] FastAPI startup no longer creates schema or runs E2E seed fixtures implicitly
- [x] Alembic exists under `backend/alembic/` and one initial migration builds the current schema
- [x] Baseline and scenario E2E seed flow runs from `backend/scripts/seed_e2e.py` with reusable helpers under `backend/app/db/seeds/`
- [x] Root scripts support explicit E2E reset, migrate, baseline seed, scenario seed, backend start, frontend start, and Playwright run
- [x] Frontend client code reads default API base from `import.meta.env.VITE_API_BASE_URL`
- [x] `frontend/.env.development` and `frontend/.env.e2e` exist with correct API base behavior
- [x] No frontend Vitest files remain under `frontend/src/`
- [x] Frontend Vitest suites live under `frontend/tests/unit/` or `frontend/tests/component/`
- [x] Backend pytest suites live under `backend/tests/unit/` or `backend/tests/integration/`
- [x] Playwright config, global setup, fixtures, and specs live under `tests/e2e/`
- [x] Browser E2E includes route proof plus seeded review-navigation proof against real local stack
- [x] Docs and memory reflect the explicit bootstrap and moved test layout truth

### Test Intent

- Backend: targeted migration plus seed regression tests first, then backend pytest pass from new tree
- Frontend: targeted unit and component regression after move plus full frontend Vitest pass
- Manual: none planned unless Playwright setup leaves a real browser-only gap

### Definition of Done

- [x] Relevant tests pass
- [x] Typecheck passes
- [x] Docs and memory updated honestly
- [x] Task wrap-up records exact commands and outcomes

## Planning Phase

### Planned Integration Tests

- Backend:
  - add integration proof that explicit Alembic upgrade creates the current schema and allows app reads without startup table creation
  - add integration proof that baseline seed indexes videos explicitly and that review-navigation scenario writes manifest markers idempotently
- Frontend:
  - keep current route and live-review stories, but run them from `frontend/tests/component/`
  - add unit proof that API clients still build URLs correctly with default env-backed base URL fallback

### Planned E2E Tests

- Add Playwright route spec for `/` -> `/review/:videoId` -> back path on real stack
- Add Playwright review-navigation spec that runs scenario seed fixture and proves annotated or keyframe jump controls on real `/review/:videoId`

### Planned Implementation

- Step 1: create task-owned failing backend integration tests under target tree for migrations plus seed helpers, then run targeted pytest and confirm RED
- Step 2: add Alembic environment, initial migration, explicit seed helpers, and CLI script until backend tests turn GREEN
- Step 3: move backend pytest tree into `unit` plus `integration` layout and fix imports or pytest discovery
- Step 4: move frontend shared test setup and suites into `frontend/tests/`, add env files, and update API-client default base URL
- Step 5: move Playwright into `tests/e2e/`, add global setup and scenario fixture, then add real route and review-navigation specs
- Step 6: update root scripts, docs, and memory truth, then run full verification

### Feature Matrix Updates

- `[[Video Ingest and Exact-Frame Review]]` must stop claiming startup indexing creates DB tables implicitly and must point frontend proof to moved test paths
- `[[Review Workspace Ergonomics]]` must point route and live-review proof to moved frontend and Playwright paths, plus new E2E setup flow

## Execution Phase

### Implementation Notes

- 2026-04-21: Read `AGENTS.md`, `[[Workflow]]`, current testing notes, and current repo config before code. Existing worktree already contained partial earlier attempt under `backend/e2e_seeds/`; this task replaces that direction instead of layering a second seed path on top.

## Wrap-Up Phase

### Verification

- Commands run:
  - `uv run --project backend pytest backend/tests -q`
  - `npm --workspace frontend run test`
  - `npm run typecheck`
  - `FRONTEND_E2E_PORT=3100 npm run test:e2e`
- Results:
  - backend pytest: passed
  - frontend Vitest: passed
  - backend Pyright plus frontend TypeScript: passed
  - Playwright route flow plus review-navigation flow: passed

### Final Summary

- Added explicit backend bootstrap with Alembic in `backend/alembic/`, reusable seed helpers in `backend/app/db/seeds/`, and CLI entrypoint `backend/scripts/seed_e2e.py`.
- Removed runtime schema creation and startup fixture seeding from FastAPI app startup.
- Moved backend tests to `backend/tests/{unit,integration}`, frontend tests to `frontend/tests/{unit,component}`, and Playwright to `tests/e2e/`.
- Added explicit Playwright suite bootstrap in `tests/e2e/global.setup.ts` plus scenario fixture `tests/e2e/fixtures/review-navigation.ts`.
- Switched frontend API base handling to `import.meta.env.VITE_API_BASE_URL` with `frontend/.env.development` and `frontend/.env.e2e`.
- Added local frontend CORS allowance in backend so browser E2E can call absolute backend API base directly.

### Completion Gate

- [x] Acceptance Criteria checkboxes updated to match reality
- [x] Definition of Done checkboxes updated to match reality
- [x] Only now may `status` change to `done`
