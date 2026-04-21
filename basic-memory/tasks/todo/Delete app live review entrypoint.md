---
id: task-delete-app-live-review-entrypoint
title: Delete app live review entrypoint
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

- [ ] `frontend/src/app/live-review-app.tsx` is deleted
- [ ] No runtime import or test import still points at `frontend/src/app/live-review-app.tsx`
- [ ] `frontend/src/app/` contains app-wide setup only and no review page ownership
- [ ] Live review route behavior still works after the deletion
- [ ] Task planning explicitly rethinks frontend integration and E2E coverage using `[[frontend-integration-tests]]` and `[[e2e-tests]]`
- [ ] Any route or page UI touched by this task uses Tailwind utilities instead of adding new non-Tailwind styling

### Test Intent

- Backend: none
- Frontend: update any route or review integration proof that referenced `frontend/src/app/live-review-app.tsx`
- Manual: load `/review/<videoId>` after deletion and confirm the route still works

### Definition of Done

- [ ] Relevant frontend tests pass
- [ ] Typecheck passes
- [ ] Deletion truth is recorded honestly in wrap-up

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
