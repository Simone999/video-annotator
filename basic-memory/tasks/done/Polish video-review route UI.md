---
title: Polish video-review route UI
type: note
permalink: video-annotator/tasks/polish-video-review-route-ui
id: task-polish-video-review-route-ui
status: done
completed: null
steps:
- creation
- planning
- execution
- wrap_up
tags:
- task
- frontend
- ui
- review
- routing
- mockup
---

# Polish video-review route UI

## Creation Phase

### Description

After live review route ownership moves under `frontend/src/features/video-review/pages/review-page.tsx`, polish the real `/review/:videoId` route so loaded state matches `docs/ui/video-annotation-mockup.png` direction and failure state is designed instead of broken. This task stays UI-only: it uses already-shipped live review behavior and honest backend failures, never fixture fallback or fake loaded review data.

### Scope

- In scope: route-owned review page chrome and hierarchy, loaded single-stage review presentation using existing live controls, designed bootstrap failure state with real error copy, `Back to Library` path, frontend integration proof by visible issue cluster, and real-stack browser route scenarios recorded honestly
- Out of scope: backend manifest or summary fixes, fake loaded review fallback, new review business logic, or delivery of currently blocked selected-range or selected-object-summary features

### Dependencies And Blockers

- Run after [[Set up app route map]], [[Extract live review feature entry]], [[Delete app live review entrypoint]], [[Delete ui-shell runtime leftovers]], and [[Move frontend tests outside src]]. If review route ownership is not done yet, stop and finish that seam first.
- This task is UI-only. If live bootstrap still fails against repo default DB, keep failure honest and do not patch backend manifest validation here.

### Source Material And Starting Points

- Visual target: `docs/ui/video-annotation-mockup.png`
- Visual audit: [[Comparing live pages against UI mockups 2026-04-21]]
- Current runtime seams before route move: `frontend/src/app/live-review-app.tsx`, `frontend/src/features/video-review/workspace.ts`, `frontend/src/features/video-review/api.ts`, `frontend/src/features/video-review/exact-frame-canvas.tsx`, `frontend/src/app/App.tsx`, and `frontend/src/features/ui-shell/shell-host.tsx`
- Current manifest bootstrap route is `GET /api/videos/{video_id}/manifest` in `backend/app/api/videos.py`
- Current frontend proof before test move lives mainly in `frontend/src/app/live-review-app.test.tsx` and `frontend/src/app/App.test.tsx`
- Audit artifacts: `/tmp/video-review-actual.png`, `/tmp/video-review-loaded-actual.png`, and `docs/ui/video-annotation-mockup.png`

### Known Issue Inventory

- current review handoff still enters `LiveReviewApp` instead of a route-owned feature page
- URL-selected review still shows chooser-style intermediate UI before loaded workspace
- repo default DB can produce `/api/videos/{video_id}/manifest` `500 Internal Server Error` because manifest object-track validation still expects string `id` and string `color`, while current DB data can contain integer `id` and `null` `color`; task must replace broken presentation with designed unavailable state, not fake loaded data
- loaded-state polish should reuse existing single-stage review controls and hierarchy, not resurrect fixture review shell
- direct load, refresh, and `Back to Library` must stay coherent at URL level

### Affected Features

- [[Review Workspace Ergonomics]]
- [[Video Ingest and Exact-Frame Review]]

### Acceptance Criteria

- [x] `/review/:videoId` route page under `frontend/src/features/video-review/pages/` matches `docs/ui/video-annotation-mockup.png` direction for loaded single-stage review UI while using only already-shipped live review behavior
- [x] Route-owned review load no longer shows chooser-style intermediate UI when the URL already identifies the video
- [x] Bootstrap failures render a designed unavailable or error state with real failure text and a clear `Back to Library` action
- [x] No fixture fallback or fake loaded review data is introduced when live bootstrap fails
- [x] Direct load and refresh on `/review/:videoId` stay route-owned and end in either the real review workspace or the designed failure state
- [x] Task planning explicitly writes failing integration tests for each visible issue cluster and real-stack browser scenarios for direct load, refresh, and library-to-review navigation, then records blocked or failing browser truth honestly in the feature test record if backend gaps remain
- [x] Any route or page UI touched by this task uses Tailwind utilities instead of adding new non-Tailwind styling

### Test Intent

- Backend: none
- Frontend: route-owned review integration tests for loaded shell, designed failure state, direct-load selection, refresh behavior, and back navigation
- Manual: compare loaded or failed `/review/:videoId` against `docs/ui/video-annotation-mockup.png` direction only if browser automation leaves a visual gap that needs honest manual notes

### Minimum Test Clusters

- `route-ownership`: direct URL selection no longer needs chooser-style intermediate UI before route-owned review state begins
- `loaded-shell`: route-owned review page renders loaded hierarchy from already-shipped live review data without reviving fixture shell behavior
- `failure-shell`: bootstrap error renders designed unavailable state with real error text and working `Back to Library` action
- `refresh`: refresh on `/review/:videoId` stays route-owned and deterministic
- `browser-smoke`: real stack covers direct load, refresh, and library-to-review navigation; if manifest bootstrap still fails, record exact blocked truth instead of masking it

### Definition of Done

- [x] Relevant frontend tests pass
- [x] Typecheck passes
- [x] Review Workspace Ergonomics and Video Ingest and Exact-Frame Review test records are updated honestly where touched
- [x] Task wrap-up records any remaining blocked browser truth honestly instead of implying backend gaps were fixed

## Planning Phase
### Planned Integration Tests

- `route-shell`: extend `frontend/tests/integration/video-review/review-page.test.tsx` so real route-owned page chrome proves URL-selected review routes do not show chooser copy like `Choose review target` or `Select video before choosing persisted objects.` when `initialVideoId` is present. Keep back navigation proof at route seam.
- `loaded-shell`: extend `frontend/tests/integration/video-review/live-review-screen.test.tsx` with one loaded-state user story that boots from `initialVideoId`, waits for manifest-backed workspace, and asserts polished route chrome around existing live review behavior: route heading, concise metadata, review-stage frame status, and no chooser-only fallback copy.
- `failure-shell`: add one failing-first user story in `frontend/tests/integration/video-review/live-review-screen.test.tsx` where `GET /api/videos/:videoId/manifest` returns `500 Internal Server Error`, then assert designed unavailable state shows real backend error text, clear `Back to Library` action, and no fake loaded workspace.

### Planned E2E Tests

- Browser smoke only for this task. Reuse current local Vite plus backend flow, then verify three real-stack paths: library to review navigation, direct `/review/:videoId` load, and refresh on same route. Record whether each path lands in real workspace or designed failure state.
- Keep committed Playwright coverage scoped to existing route flow unless route selectors break. If direct refresh still flakes because backend or seed state drifts, record blocked truth in task wrap-up instead of widening scope into backend repair.

### Planned Implementation

- Keep route ownership in `frontend/src/features/video-review/pages/review-page.tsx`; if no route-specific status shell exists yet, add one small route-owned presentation seam in `frontend/src/features/video-review/components/` and keep it feature-local.
- Polish `frontend/src/features/video-review/components/live-review-screen.tsx` and touched review panels with Tailwind utility classes so route UI no longer depends on old `app.css` shell classes for new visual work.
- When `initialVideoId` exists, suppress chooser-first copy and render either loading, loaded workspace, or designed failure state. Failure state must keep real `workspace.errorMessage` text and expose `Back to Library`, never fixture fallback or fake review data.
- Reuse already-shipped live review controller and workspace behavior. Do not patch manifest backend validation, selected-range gaps, or selected-object summary gaps in this task.

### Feature Matrix Updates

- Update [[Review Workspace Ergonomics]] verification rows and manual-browser evidence for route-owned review polish plus designed failure shell.
- Update [[Video Ingest and Exact-Frame Review]] only if direct-route exact-frame or refresh evidence changes materially.
- Keep task wrap-up honest about any remaining backend-manifest or browser-refresh instability.

### Planned Integration Tests

### Planned E2E Tests

### Planned Implementation

### Feature Matrix Updates

## Execution Phase
### Implementation Notes

- Added failing-first route-owned review tests in `frontend/tests/integration/video-review/live-review-screen.test.tsx` for loading-shell and unavailable-shell behavior before changing runtime code.
- Added `frontend/src/features/video-review/components/review-route-status-panel.tsx` so direct `/review/:videoId` routes now render a designed loading or unavailable shell while URL-owned selection resolves or fails.
- Updated `frontend/src/features/video-review/components/live-review-screen.tsx` to branch route-owned loading and failure states from existing workspace signals, without adding fake review data or touching backend manifest behavior.
- Restyled touched review panels and transport controls with Tailwind utilities, and hid chooser-style indexed-video list UI once route ownership already knows the target video from URL.
- Kept live review controller, exact-frame behavior, paused-only mutation rules, and back navigation on existing feature seams.

### Implementation Notes

## Wrap-Up Phase
### Verification

- Commands run:
- `npm --workspace frontend run test -- tests/integration/video-review/live-review-screen.test.tsx`
- `npm --workspace frontend run test -- tests/integration`
- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `FRONTEND_E2E_PORT=3100 npx playwright test -c tests/e2e/playwright.config.ts tests/e2e/specs/routes.spec.ts --project chromium`
- `npm run backend:bootstrap:e2e`
- fresh backend `npm run backend:dev:e2e` on `127.0.0.1:8000`
- fresh frontend `FRONTEND_E2E_PORT=3100 npm run frontend:dev:e2e`
- one-off Playwright smoke against `http://127.0.0.1:3100`
- Results:
- Targeted review integration test failed first on missing route-owned loading and unavailable shells, then passed after runtime changes.
- `npm --workspace frontend run test -- tests/integration` passed.
- `npm run typecheck` passed.
- `npm run lint` passed.
- `npm run test` passed.
- Fresh local rerun of committed `tests/e2e/specs/routes.spec.ts` failed once because Playwright reused a stale backend already listening on `127.0.0.1:8000`; route landed in designed `Review unavailable` shell with real `Failed to fetch` text instead of loaded workspace.
- After resetting E2E storage, replacing the stale backend with fresh `backend:dev:e2e`, and reusing frontend on clean port `3100`, one-off browser smoke passed for `/review/video-2d62649f3590f8d0` load, refresh, and `Back to Library`, and saved `/tmp/us009-review-route-open.png` plus `/tmp/us009-review-route-refresh.png`.

### Final Summary

- Direct review routes now show a designed loading shell and a designed unavailable shell instead of chooser-first review UI.
- Route-owned loaded review chrome uses Tailwind styling and keeps live exact-frame review behavior without fake bootstrap fallback.
- Fresh browser smoke on clean seeded stack proved route load, refresh, and return-to-library flow with loaded review workspace.

### Completion Gate

- [x] Acceptance Criteria checkboxes updated to match reality
- [x] Definition of Done checkboxes updated to match reality
- [x] Only now may `status` change to `done`

### Verification

- Commands run:
- Results:

### Final Summary

### Completion Gate

- [ ] Acceptance Criteria checkboxes updated to match reality
- [ ] Definition of Done checkboxes updated to match reality
- [ ] Only now may `status` change to `done`