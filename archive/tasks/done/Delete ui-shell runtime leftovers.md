---
id: task-delete-ui-shell-runtime-leftovers
title: Delete ui-shell runtime leftovers
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
- cleanup
- routing
permalink: video-annotator/tasks/delete-ui-shell-runtime-leftovers
---

# Delete ui-shell runtime leftovers

## Creation Phase

### Description

Remove the historical `ui-shell` runtime once library and live review route ownership have moved to explicit features. This task is the naming and dead-runtime cleanup pass, not a new behavior pass.

### Scope

- In scope: delete remaining `frontend/src/features/ui-shell/` runtime files, remove fixture-only review runtime, clean dead imports and stale naming, and keep only explicit feature folders that still own runtime behavior
- Out of scope: new route behavior, test-tree migration, or new backend work

### Affected Features

- [[Review Workspace Ergonomics]]

### Acceptance Criteria

- [x] No runtime import path under `frontend/src/` points at `frontend/src/features/ui-shell/`
- [x] Fixture-only review runtime is deleted rather than preserved as a hidden route
- [x] Remaining library and review runtime names are explicit about `video-library` and `video-review`
- [x] Cleanup does not reintroduce shell-local page enums or query-string review switching
- [x] Dead code created by the route move is removed surgically
- [x] Task planning explicitly rethinks frontend integration and E2E coverage using `[[frontend-integration-tests]]` and `[[e2e-tests]]`
- [x] Any route or page UI touched by this task uses Tailwind utilities instead of adding new non-Tailwind styling

### Test Intent

- Backend: none
- Frontend: run targeted search plus relevant frontend tests after cleanup
- Manual: none beyond runtime smoke if later tasks need it

### Definition of Done

- [x] Relevant frontend tests pass
- [x] Typecheck passes
- [x] Task wrap-up records the deleted runtime surfaces honestly

## Planning Phase

### Planned Integration Tests

- Frontend: add `frontend/tests/unit/frontend-structure/ui-shell-cleanup.test.ts` to fail while any `frontend/src` runtime file still references `ui-shell` or `UiShell`, or while `frontend/src/features/ui-shell/` still exists.
- Frontend: run `frontend/tests/component/app/app-routes.test.tsx` after cleanup so route-owned library and review flows still cover `/` plus `/review/:videoId` without the deleted shell seam.
- Frontend: run `frontend/tests/component/video-review/live-review-screen.test.tsx` after cleanup so feature-owned live review behavior still works after removing the fixture shell runtime.

### Planned E2E Tests

- None. `[[e2e-tests]]` says use browser E2E only for critical full-stack workflows. This task deletes dead runtime seams and stale naming, while existing committed route E2E already covers the user-visible route journey.

### Planned Implementation

- Delete `frontend/src/features/ui-shell/` because it now exists only for fixture-only runtime and tests.
- Delete `frontend/tests/component/ui-shell/shell-host.test.tsx` because it proves deleted fixture-shell behavior instead of shipped route-owned behavior.
- Remove dead `ui-shell` CSS from `frontend/src/app/app.css` after the deleted runtime no longer uses those selectors.
- Keep cleanup surgical: no new route behavior, no query-string routing, no new page owners, and no replacement fixture shell.

### Feature Matrix Updates

- Update `[[Review Workspace Ergonomics]]` after cleanup so verification truth no longer claims fixture-shell coverage still exists.

## Execution Phase

### Implementation Notes

- Deleted `frontend/src/features/ui-shell/` plus `frontend/tests/component/ui-shell/shell-host.test.tsx` so shipped runtime ownership now stays inside `video-library` and `video-review`.
- Added `frontend/tests/unit/frontend-structure/ui-shell-cleanup.test.ts` as node-environment guardrail against reintroducing `ui-shell` folders, imports, or naming under `frontend/src`.
- Removed dead `ui-shell` CSS block from `frontend/src/app/app.css`.
- Reworded empty-library copy from `reload shell` to `reload library`.

## Wrap-Up Phase

### Verification

- Commands run:
  - `npm --workspace frontend run test -- tests/unit/frontend-structure/ui-shell-cleanup.test.ts`
  - `npm --workspace frontend run test -- tests/component/app/app-routes.test.tsx tests/component/video-review/live-review-screen.test.tsx`
  - `npm run typecheck`
  - `npm run lint`
  - `npm run test`
  - `npm run test:e2e -- tests/e2e/specs/routes.spec.ts`
  - `FRONTEND_E2E_PORT=3100 npm run test:e2e -- tests/e2e/specs/routes.spec.ts`
  - one-off Playwright smoke on `http://127.0.0.1:3100`
- Results:
  - Structural cleanup test failed first because `frontend/src/features/ui-shell/` still existed, then passed after deleting the empty directory.
  - Targeted app-route and live-review frontend tests passed.
  - `npm run typecheck` passed.
  - `npm run lint` passed.
  - `npm run test` passed.
  - First local Playwright route run hit unrelated Next.js app on default port `3000`; root cause was Playwright reusing an already-running frontend on that port.
  - Second local Playwright route run on clean port `3100` hit video-annotator, but existing refresh assertion still failed with `Failed to fetch` and missing `Canonical frame 0` after direct reload; this task did not change that flow.
  - One-off Playwright smoke on clean port `3100` passed for `/` -> `Open Review bedroom.mp4` -> `Back to Library` and saved `/tmp/us005-route-cleanup-smoke.png`.

### Final Summary

- Removed historical `ui-shell` runtime and fixture review seam.
- Added structural guardrail test so `ui-shell` naming cannot quietly return under `frontend/src`.
- Updated feature truth and E2E guidance with the local Playwright port-reuse gotcha.

### Completion Gate

- [x] Acceptance Criteria checkboxes updated to match reality
- [x] Definition of Done checkboxes updated to match reality
- [x] Only now may `status` change to `done`
