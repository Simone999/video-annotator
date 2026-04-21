---
id: task-delete-app-live-review-entrypoint
title: Delete app live review entrypoint
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
- review
permalink: video-annotator/tasks/delete-app-live-review-entrypoint
---

# Delete app live review entrypoint

## Creation Phase

### Description

Delete `frontend/src/app/live-review-app.tsx` after live review route ownership is fully feature-owned. This task is mandatory cleanup, not optional polish: it removes the old app-level review entrypoint, updates imports plus tests, and leaves `frontend/src/app/` with app-wide setup only.

### Scope

- In scope: delete `frontend/src/app/live-review-app.tsx`, remove or replace imports that depended on it, update route and live review tests to target feature-owned entrypoints, and make `frontend/src/app/` hold only app setup
- Out of scope: initial live review extraction, final `ui-shell` runtime deletion, or frontend test-tree migration

### Affected Features

- [[Review Workspace Ergonomics]]
- [[Video Ingest and Exact-Frame Review]]

### Acceptance Criteria

- [x] `frontend/src/app/live-review-app.tsx` is deleted
- [x] No runtime import or test import still points at `frontend/src/app/live-review-app.tsx`
- [x] `frontend/src/app/` contains app-wide setup only and no review page ownership
- [x] Live review route behavior still works after the deletion
- [x] Task planning explicitly rethinks frontend integration and E2E coverage using `[[frontend-integration-tests]]` and `[[e2e-tests]]`
- [x] Any route or page UI touched by this task uses Tailwind utilities instead of adding new non-Tailwind styling

### Test Intent

- Backend: none
- Frontend: update any route or review integration proof that referenced `frontend/src/app/live-review-app.tsx`
- Manual: load `/review/<videoId>` after deletion and confirm the route still works

### Definition of Done

- [x] Relevant frontend tests pass
- [x] Typecheck passes
- [x] Deletion truth is recorded honestly in wrap-up

## Planning Phase

### Planned Integration Tests

- `frontend/src/features/video-review/pages/review-page.test.tsx`: keep route-level proof at feature boundary by mocking feature-local review screen and asserting `/review/:videoId` passes route param without importing app code
- `frontend/src/features/video-review/components/live-review-screen.test.tsx`: move current live review integration coverage onto feature-owned screen and keep `MSW` request-boundary stubs for direct `initialVideoId` bootstrap plus canonical-frame behavior after file move
- `frontend/src/app/App.test.tsx`: keep app-host route proof, but mock `frontend/src/features/video-review` instead of `frontend/src/app/live-review-app.tsx` so `frontend/src/app/` stays setup-only
- `frontend/src/features/ui-shell/shell-host.test.tsx`: keep fixture-shell seam green because cleanup must not break temporary runtime reuse before next cleanup story

### Planned E2E Tests

- No new committed Playwright coverage in this cleanup slice; `[[e2e-tests]]` says browser E2E should stay for critical user journeys, and this story is structural cleanup already covered by existing route journey proof plus manual browser smoke
- Manual browser smoke: open `/review/<videoId>` on local stack, confirm live review still boots, then return to `/` through browser navigation or route link if needed

### Planned Implementation

- Move `LiveReviewApp` out of `frontend/src/app/live-review-app.tsx` into feature-owned review module under `frontend/src/features/video-review/components/`
- Re-export moved component from `frontend/src/features/video-review/index.ts` so route page and temporary fixture shell both depend on feature code instead of app code
- Update route-page, fixture-shell, and tests to import feature-owned review screen
- Delete `frontend/src/app/live-review-app.tsx` and its colocated test once moved coverage exists under the feature tree
- Update feature notes and supporting architecture docs to remove temporary-app-entrypoint wording if this cleanup changes documented structure

### Feature Matrix Updates

- Update `[[Review Workspace Ergonomics]]` current-state and verification text so feature-owned review screen path is durable truth
- Update `[[Video Ingest and Exact-Frame Review]]` only if review entrypoint path or test evidence is referenced there

## Execution Phase

### Implementation Notes

- Moved live review composition from `frontend/src/app/live-review-app.tsx` into feature-owned `frontend/src/features/video-review/components/live-review-screen.tsx`.
- Repointed `frontend/src/features/video-review/pages/review-page.tsx`, `frontend/src/features/ui-shell/shell-host.tsx`, and route-level tests to the feature-owned screen seam.
- Deleted `frontend/src/app/live-review-app.tsx` plus colocated test, and moved live review integration coverage to `frontend/src/features/video-review/components/live-review-screen.test.tsx`.
- Updated `AGENTS.md`, `docs/engineering/architecture.md`, and current feature notes so durable repo truth no longer points at deleted app entrypoint.

## Wrap-Up Phase

### Verification

- Commands run:
  - `npm --workspace frontend run test -- src/features/video-review/components/live-review-screen.test.tsx`
  - `npm --workspace frontend run test -- src/features/video-review/pages/review-page.test.tsx src/app/App.test.tsx src/features/ui-shell/shell-host.test.tsx`
  - `node --input-type=module` Playwright smoke against fresh `npm run backend:dev:e2e` and `npm run frontend:dev:e2e`
  - `npm run typecheck`
  - `npm run lint`
  - `npm run test`
- Results:
  - Feature-owned live review screen test passed after red failure on missing `live-review-screen.tsx`.
  - Route-page, app-host, and fixture-shell targeted frontend tests passed.
  - Browser smoke on fresh local stack opened `/review/video-2d62649f3590f8d0`, kept `Canonical frame 0` visible after refresh, and saved `/home/simone/.dev-browser/tmp/us004-review-route-feature-owned.png`.
  - `npm run typecheck` passed.
  - `npm run lint` passed.
  - `npm run test` passed with backend `14 passed` and frontend `9 passed (37 tests)`.

### Final Summary

Deleted app-owned live review entrypoint by moving the screen into `frontend/src/features/video-review/components/live-review-screen.tsx`, repointing runtime or test imports to the feature seam, and updating durable repo guidance plus feature evidence to match.

### Completion Gate

- [x] Acceptance Criteria checkboxes updated to match reality
- [x] Definition of Done checkboxes updated to match reality
- [x] Only now may `status` change to `done`
