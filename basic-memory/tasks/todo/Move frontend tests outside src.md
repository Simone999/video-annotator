---
id: task-move-frontend-tests-outside-src
title: Move frontend tests outside src
status: todo
completed:
steps:
- creation
- planning
- execution
- wrap_up
tags:
- task
- frontend
- tests
- vitest
permalink: video-annotator/tasks/move-frontend-tests-outside-src
---

# Move frontend tests outside src

## Creation Phase

### Description

Move all frontend Vitest suites and shared test setup out of `frontend/src/` into `frontend/tests/` so runtime source code and test code stop sharing the same tree.

Current file map to migrate or replace:
- `frontend/src/app/App.test.tsx` -> `frontend/tests/integration/app/app-routes.test.tsx`
- `frontend/src/app/live-review-app.test.tsx` -> replace with feature-owned review integration proof under `frontend/tests/integration/video-review/`; exact filename should be confirmed during planning after the route extraction settles
- `frontend/src/features/ui-shell/library-page.test.tsx` -> `frontend/tests/unit/video-library/library-page.test.tsx`
- `frontend/src/features/ui-shell/shell-host.test.tsx` -> delete or replace with route-owned integration proof; decide during planning after `ui-shell` runtime removal is concrete
- `frontend/src/features/video-review/api.test.ts` -> `frontend/tests/unit/video-review/api.test.ts`
- `frontend/src/features/video-review/state.test.ts` -> `frontend/tests/unit/video-review/state.test.ts`
- `frontend/src/features/video-review/workspace.test.ts` -> investigate in planning whether this stays hook-focused unit coverage or belongs under `frontend/tests/integration/video-review/`
- `frontend/src/test/setup.test.tsx` -> `frontend/tests/unit/tooling/setup.test.tsx`
- `frontend/src/test/setup.ts` -> `frontend/tests/setup/vitest.setup.ts`
- `frontend/src/test/msw/server.ts` -> `frontend/tests/setup/msw/server.ts`

Planning phase must verify this migration map against the current repo before code starts. If a destination changes, the task note must record why instead of silently drifting from the map.

### Scope

- In scope: move `*.test.ts` and `*.test.tsx` files from `frontend/src/` into `frontend/tests/{unit,integration}/`, move shared setup and MSW files into `frontend/tests/setup/`, update `frontend/vite.config.ts` plus imports, investigate which current suites should be replaced instead of moved, and leave `frontend/src/` free of Vitest test files
- Out of scope: Playwright route proof, backend tests, or unrelated frontend logic changes

### Affected Features

- [[Review Workspace Ergonomics]]
- [[Video Ingest and Exact-Frame Review]]

### Acceptance Criteria

- [ ] No frontend Vitest `*.test.ts` or `*.test.tsx` files remain under `frontend/src/`
- [ ] Shared Vitest setup and MSW server live under `frontend/tests/setup/`
- [ ] `frontend/tests/unit/` and `frontend/tests/integration/` are the only homes for frontend Vitest suites
- [ ] Vitest still runs cleanly from the new tree with equivalent coverage intent
- [ ] Runtime code does not gain new test-only helpers under `src/` just to support the move
- [ ] Task planning explicitly rethinks frontend integration and E2E coverage using `[[frontend-integration-tests]]` and `[[e2e-tests]]` instead of blindly preserving current file boundaries
- [ ] Planning explicitly confirms the exact destination or deletion decision for each current frontend Vitest file in the migration map above
- [ ] Planning explicitly records any map changes discovered during investigation before implementation starts
- [ ] Any route or page UI touched by this task uses Tailwind utilities instead of adding new non-Tailwind styling

### Test Intent

- Backend: none
- Frontend: full frontend Vitest run from the new test tree
- Manual: none

### Definition of Done

- [ ] Frontend tests pass
- [ ] Typecheck passes
- [ ] Test-tree migration truth is recorded honestly in wrap-up

## Planning Phase

### Planned Integration Tests

### Planned E2E Tests

### Planned Implementation

### Feature Matrix Updates

## Execution Phase

### Implementation Notes

## Wrap-Up Phase

### Verification

- Commands run:
- Results:

### Final Summary

### Completion Gate

- [ ] Acceptance Criteria checkboxes updated to match reality
- [ ] Definition of Done checkboxes updated to match reality
- [ ] Only now may `status` change to `done`
