---
id: task-extract-live-review-feature-entry
title: Extract live review feature entry
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
- review
permalink: video-annotator/tasks/extract-live-review-feature-entry
---

# Extract live review feature entry

## Creation Phase

### Description

Move live review route ownership and route-level behavior under `frontend/src/features/video-review/` so `/review/:videoId` is a feature-owned page that reads `videoId` from the URL. This task is the extraction pass only; app-level entrypoint deletion is already decided and lands in the separate follow-up task.

### Scope

- In scope: create `frontend/src/features/video-review/pages/review-page.tsx`, read `videoId` with route params, move route-level review ownership out of `frontend/src/app/`, move enough live review composition into `frontend/src/features/video-review/` that the feature owns the review route, and keep canonical frame plus paused-only edit rules intact
- Out of scope: deleting `frontend/src/app/live-review-app.tsx`, deleting final `ui-shell` leftovers, moving test files outside `src/`, or changing backend review contracts

### Affected Features

- [[Review Workspace Ergonomics]]
- [[Video Ingest and Exact-Frame Review]]

### Acceptance Criteria

- [ ] `/review/:videoId` selects the live review video from the URL instead of app-local query-string logic
- [ ] Live review page ownership lives under `frontend/src/features/video-review/`
- [ ] Direct load and refresh on `/review/:videoId` work in the current Vite dev and Playwright flow
- [ ] Canonical frame loading, paused-only mutations, and existing live review behavior remain intact after extraction
- [ ] If extraction needs a temporary adapter, it carries no route ownership and task wrap-up records exactly what the dedicated deletion task still must remove
- [ ] Task planning explicitly rethinks frontend integration and E2E coverage using `[[frontend-integration-tests]]` and `[[e2e-tests]]`
- [ ] Any route or page UI touched by this task uses Tailwind utilities instead of adding new non-Tailwind styling

### Test Intent

- Backend: none
- Frontend: update route integration proof and live review integration proof around URL-param selection
- Manual: direct-load `/review/<videoId>`, refresh, and confirm review opens the expected video

### Definition of Done

- [ ] Relevant frontend tests pass
- [ ] Typecheck passes
- [ ] Browser route verification is recorded honestly if run

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
