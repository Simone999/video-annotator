---
id: task-move-frontend-tests-outside-src
title: Move frontend tests outside src
status: done
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

- [x] No frontend Vitest `*.test.ts` or `*.test.tsx` files remain under `frontend/src/`
- [x] Shared Vitest setup and MSW server live under `frontend/tests/setup/`
- [x] `frontend/tests/unit/` and `frontend/tests/integration/` are the only homes for frontend Vitest suites
- [x] Vitest still runs cleanly from the new tree with equivalent coverage intent
- [x] Runtime code does not gain new test-only helpers under `src/` just to support the move
- [x] Task planning explicitly rethinks frontend integration and E2E coverage using `[[frontend-integration-tests]]` and `[[e2e-tests]]` instead of blindly preserving current file boundaries
- [x] Planning explicitly confirms the exact destination or deletion decision for each current frontend Vitest file in the migration map above
- [x] Planning explicitly records any map changes discovered during investigation before implementation starts
- [x] Any route or page UI touched by this task uses Tailwind utilities instead of adding new non-Tailwind styling

### Test Intent

- Backend: none
- Frontend: full frontend Vitest run from the new test tree
- Manual: none

### Definition of Done

- [x] Frontend tests pass
- [x] Typecheck passes
- [x] Test-tree migration truth is recorded honestly in wrap-up

## Planning Phase

### Planned Integration Tests

- Frontend: add `frontend/tests/unit/frontend-structure/frontend-test-tree.test.ts` as node-environment guardrail. It should fail while any Vitest file lives under `frontend/tests/component/`, while any Vitest file still lives under `frontend/src/`, or while a frontend Vitest file lives outside `frontend/tests/unit/` and `frontend/tests/integration/`.
- Frontend: run `npm --workspace frontend run test -- tests/unit/frontend-structure/frontend-test-tree.test.ts` for the red-green proof on the structural guardrail.
- Frontend: run `npm --workspace frontend run test -- tests/integration/app/app-routes.test.tsx tests/integration/video-library/video-library-screen.test.tsx tests/integration/video-review/review-page.test.tsx tests/integration/video-review/live-review-screen.test.tsx` after the rename so route- and screen-level integration suites still resolve shared setup, mocked seams, and request-boundary stubs from the new tree.

### Planned E2E Tests

- None. `[[e2e-tests]]` says browser E2E belongs to critical user-visible workflows. This task changes frontend Vitest tree ownership only; existing Playwright route proof remains sufficient and no new browser behavior is introduced.

### Planned Implementation

- Verified current repo state before coding: `frontend/src/` already has no Vitest files, `frontend/tests/setup/` already owns shared setup plus MSW, and `frontend/vite.config.ts` already points at `./tests/setup/vitest.setup.ts`.
- Record migration-map drift instead of guessing: `frontend/src/features/ui-shell/library-page.test.tsx` ended up as `frontend/tests/integration/video-library/video-library-screen.test.tsx` because the owning feature now freezes card and screen behavior through `VideoLibraryScreen`, not a deleted `ui-shell` page file.
- Record migration-map drift instead of guessing: `frontend/src/features/video-review/workspace.test.ts` stays unit-focused at `frontend/tests/unit/video-review/workspace.test.ts`, because it still targets workspace state logic rather than a route- or screen-level integration story.
- Record migration-map drift instead of guessing: `frontend/src/app/live-review-app.test.tsx` was replaced earlier by `frontend/tests/integration/video-review/live-review-screen.test.tsx` after app-owned live review entrypoint deletion, and `frontend/src/features/ui-shell/shell-host.test.tsx` was deleted with no replacement because that fixture-only runtime no longer exists.
- Rename remaining `frontend/tests/component/` route and screen suites into `frontend/tests/integration/` so the tree matches the required `frontend/tests/{unit,integration}` split.
- Update note, feature, and progress references that still point at `frontend/tests/component/` so durable project truth matches the renamed test tree.

### Feature Matrix Updates

- Update `[[Review Workspace Ergonomics]]` and `[[Video Ingest and Exact-Frame Review]]` to point at `frontend/tests/integration/...` paths.
- Update any other durable notes that still cite `frontend/tests/component/...` so memory search returns current test locations instead of stale paths.

## Execution Phase

### Implementation Notes

- Added `frontend/tests/unit/frontend-structure/frontend-test-tree.test.ts` as a node-environment guardrail for the frontend Vitest tree.
- Renamed route- and screen-level frontend Vitest suites from `frontend/tests/component/` into `frontend/tests/integration/`.
- Kept `frontend/tests/setup/` and unit suites in place because repo state had already completed that part of the migration before this task session.
- Updated current feature notes plus repo guidance so durable truth now points at `frontend/tests/integration/...` instead of stale `frontend/tests/component/...` paths.

## Wrap-Up Phase

### Verification

- Commands run:
  - `npm --workspace frontend run test -- tests/unit/frontend-structure/frontend-test-tree.test.ts`
  - `npm --workspace frontend run test -- tests/unit/frontend-structure/frontend-test-tree.test.ts tests/integration/app/app-routes.test.tsx tests/integration/video-library/video-library-screen.test.tsx tests/integration/video-review/review-page.test.tsx tests/integration/video-review/live-review-screen.test.tsx`
  - `npm run typecheck`
  - `npm run lint`
  - `npm run test`
- Results:
  - First structural guardrail run failed because deprecated `frontend/tests/component/` still existed, which confirmed the test was catching the intended repo-shape regression before the rename.
  - After the rename, the structural guardrail plus moved integration suites passed.
  - `npm run typecheck` passed.
  - `npm run lint` passed.
  - `npm run test` passed with backend `18` tests and frontend `12` test files green.

### Final Summary

- Finished the remaining frontend Vitest tree migration by replacing `frontend/tests/component/` with `frontend/tests/integration/`.
- Added a structural test so future work fails fast if Vitest suites return under `frontend/src/` or any non-`unit` or non-`integration` frontend test folder.
- Updated current memory and repo guidance to reflect the final frontend test layout.

### Completion Gate

- [x] Acceptance Criteria checkboxes updated to match reality
- [x] Definition of Done checkboxes updated to match reality
- [x] Only now may `status` change to `done`
