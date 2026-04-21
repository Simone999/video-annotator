---
id: task-set-up-app-route-map
title: Set up app route map
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
- routing
- app
permalink: video-annotator/tasks/set-up-app-route-map
---

# Set up app route map

## Creation Phase

### Description

Add real browser routing for the frontend so the app uses `/` and `/review/:videoId` instead of `?app=live-review`. Keep `frontend/src/app/` limited to app-wide wiring with `App.tsx`, `providers.tsx`, `router.tsx`, and a minimal app-config store.

### Scope

- In scope: add `react-router`, wire `BrowserRouter`, create `frontend/src/app/router.tsx`, add `frontend/src/app/providers.tsx`, add minimal `frontend/src/app/store.ts`, replace query-string switching with route definitions for `/`, `/review/:videoId`, and `*`
- Out of scope: moving library runtime into `video-library`, moving live review route ownership into `video-review`, deleting `ui-shell` leftovers, or moving test files outside `src/`

### Affected Features

- [[Review Workspace Ergonomics]]

### Acceptance Criteria

- [ ] App boot uses a real route table instead of `?app=live-review`
- [ ] `/` resolves through the router to the current library runtime entry
- [ ] `/review/:videoId` resolves through the router, even if later tasks still refine the route element
- [ ] `frontend/src/app/store.ts` is app-config-only and does not hold page or feature workflow state
- [ ] Unknown routes render a small not-found route with a clear path back to `/`
- [ ] Task planning explicitly rethinks frontend integration and E2E coverage using `[[frontend-integration-tests]]` and `[[e2e-tests]]`
- [ ] Any route or page UI touched by this task uses Tailwind utilities instead of adding new non-Tailwind styling
- [ ] Routing support in this task is limited to the current Vite dev and Playwright flow; backend static-file SPA fallback stays out of scope

### Test Intent

- Backend: none
- Frontend: add or update route integration proof for `/`, `/review/:videoId`, and `*`
- Manual: open `/` and one direct `/review/<videoId>` path under the dev frontend

### Definition of Done

- [ ] Relevant frontend tests pass
- [ ] Typecheck passes
- [ ] Routing truth is recorded honestly in task wrap-up

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
