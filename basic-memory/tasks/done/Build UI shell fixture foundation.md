---
id: task-build-ui-shell-fixture-foundation
title: Build UI shell fixture foundation
status: done
completed: 2026-04-21
steps:
- creation
- planning
- execution
- wrap_up
tags:
- task
- frontend
- ui
- fixtures
- mockup
permalink: video-annotator/tasks/build-ui-shell-fixture-foundation
---

## Creation Phase

### Description

Build the fixture-backed UI shell and swap the default frontend entry to it. Read `docs/ui/video-library.html`, `docs/ui/video-annotation.html`, `[[Review Workspace Ergonomics]]`, and `[[Frontend Interaction Spec]]` first. Keep this shell UI-only.

### Scope

- In scope: `ui-shell` feature namespace, UI-only types, fixture loader, default `App` swap, and shell-local screen state
- Out of scope: backend calls, new review business logic, `video-review/api.ts` changes, router library, or live contract wiring

### Affected Features

- [[Review Workspace Ergonomics]]

### Acceptance Criteria

- [x] Default app renders the fixture-backed shell instead of the live review app
- [x] Shell data loads through static frontend fixtures and one tiny UI-only loader
- [x] Local page enum state decides which shell screen shows
- [x] Existing live review feature code stays untouched except one tiny host adapter if truly needed
- [x] Task note later records frontend verification honestly

### Test Intent

- Backend: none; backend is out of scope
- Frontend: prove the shell host loads fixture data and shows the right default screen without touching live `/api`
- Manual: open the frontend and confirm the library shell is the default entry

### Definition of Done

- [x] Relevant frontend tests pass
- [x] Feature note updated
- [x] Docs or memory updated if behavior or contracts changed

## Planning Phase

### Planned Integration Tests

- Backend: none; backend stays out of scope for this shell-foundation task.
- Frontend:
  - add one `App` render test that proves the default entry is the fixture-backed shell host, not the live review workspace
  - assert shell data comes from the UI-only fixture loader by checking fixture video metadata on first paint
  - prove default host swap stays out of `frontend/src/features/video-review`

### Planned E2E Tests

- Backend: none.
- Frontend: no browser E2E added in this story; manual browser verification is enough because this task only swaps the default host and lays shell foundation.

### Planned Implementation

- Step 1: add `frontend/src/features/ui-shell/` with typed shell data, static fixtures, and one small loader boundary.
- Step 2: add shell host state with a local page enum and selected-video state, defaulting to the library page.
- Step 3: add minimal library and review placeholder screen components that read only shell data and local host state.
- Step 4: swap `frontend/src/app/App.tsx` to render the shell host and keep live review feature modules untouched.
- Step 5: run targeted tests first, then frontend quality checks, repo quality checks, and manual browser verification.

### Feature Matrix Updates

- Feature note updates needed before or during execution:
  - `[[Review Workspace Ergonomics]]` should record that the default frontend entry is now the fixture-backed shell host while mockup detail work remains in follow-up UI-shell tasks.

## Execution Phase

### Implementation Notes

- Added `frontend/src/features/ui-shell/` with typed fixture data, a shell-only loader, and local page state.
- Swapped `frontend/src/app/App.tsx` to render `UiShellApp`.
- Preserved the pre-shell live review UI in `frontend/src/app/live-review-app.tsx` instead of mutating `frontend/src/features/video-review`.
- Added `frontend/src/app/App.test.tsx` as the RED-to-GREEN proof that the default app now renders the fixture-backed library shell.
- Fixed unrelated import ordering in `backend/tests/factories/test_model_factories.py` so repo-root lint could pass honestly.

## Wrap-Up Phase

### Verification

- Commands run:
  - `npm --workspace frontend run test -- src/app/App.test.tsx`
  - `npm --workspace frontend run test`
  - `npm --workspace frontend run typecheck`
  - `npm --workspace frontend run lint`
  - `npm run typecheck`
  - `npm run lint`
  - `npm run test`
  - `npm run frontend:dev:e2e`
  - `node --input-type=module -e "<Playwright smoke for http://127.0.0.1:5174 and screenshot /tmp/us-001-ui-shell-foundation.png>"`
- Results:
  - Targeted `App` test failed first against the live review host, then passed after the shell host swap.
  - Frontend tests, typecheck, and lint passed.
  - Repo-root `typecheck`, `lint`, and `test` passed after the backend import-order cleanup.
  - Browser verification passed: default page loaded the fixture-backed library shell and screenshot evidence was captured at `/tmp/us-001-ui-shell-foundation.png`.

### Final Summary

Shipped the `m-2a` shell foundation by making the default frontend app render a fixture-backed library host from `frontend/src/features/ui-shell`, while preserving the old live review UI in `frontend/src/app/live-review-app.tsx`. Verification included frontend and repo-root quality gates plus browser proof against the running Vite app.

### Completion Gate

- [x] Acceptance Criteria checkboxes updated to match reality
- [x] Definition of Done checkboxes updated to match reality
- [x] Only now may `status` change to `done`
