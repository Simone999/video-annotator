---
title: Polish video-review route UI
type: note
permalink: video-annotator/tasks/polish-video-review-route-ui
id: task-polish-video-review-route-ui
status: todo
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

- [ ] `/review/:videoId` route page under `frontend/src/features/video-review/pages/` matches `docs/ui/video-annotation-mockup.png` direction for loaded single-stage review UI while using only already-shipped live review behavior
- [ ] Route-owned review load no longer shows chooser-style intermediate UI when the URL already identifies the video
- [ ] Bootstrap failures render a designed unavailable or error state with real failure text and a clear `Back to Library` action
- [ ] No fixture fallback or fake loaded review data is introduced when live bootstrap fails
- [ ] Direct load and refresh on `/review/:videoId` stay route-owned and end in either the real review workspace or the designed failure state
- [ ] Task planning explicitly writes failing integration tests for each visible issue cluster and real-stack browser scenarios for direct load, refresh, and library-to-review navigation, then records blocked or failing browser truth honestly in the feature test record if backend gaps remain
- [ ] Any route or page UI touched by this task uses Tailwind utilities instead of adding new non-Tailwind styling

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

- [ ] Relevant frontend tests pass
- [ ] Typecheck passes
- [ ] Review Workspace Ergonomics and Video Ingest and Exact-Frame Review test records are updated honestly where touched
- [ ] Task wrap-up records any remaining blocked browser truth honestly instead of implying backend gaps were fixed

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