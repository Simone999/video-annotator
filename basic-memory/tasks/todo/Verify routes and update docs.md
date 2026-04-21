---
id: task-verify-routes-and-update-docs
title: Verify routes and update docs
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
- docs
- e2e
- memory
permalink: video-annotator/tasks/verify-routes-and-update-docs
---

# Verify routes and update docs

## Creation Phase

### Description

Finish the refactor with browser proof, docs, and durable memory updates so the new route and test layout become explicit project truth instead of only code truth.

### Scope

- In scope: move Playwright route proof into `frontend/tests/e2e/`, point `playwright.config.ts` at that tree, add one route-focused browser test for `/` and `/review/:videoId`, update `docs/engineering/architecture.md` plus `frontend/README.md`, record the durable routing or test-layout decision in memory, and keep refresh proof limited to the current Vite dev plus Playwright flow
- Out of scope: new product behavior beyond what the earlier routing and test tasks already shipped
- Out of scope: backend static-file SPA fallback or any production-asset serving change

### Affected Features

- [[Review Workspace Ergonomics]]
- [[Video Ingest and Exact-Frame Review]]

### Acceptance Criteria

- [ ] Playwright uses `frontend/tests/e2e/` as the frontend browser-test tree
- [ ] Browser proof covers library load on `/`, navigation to `/review/:videoId`, refresh on the review route, and navigation back to `/`
- [ ] `docs/engineering/architecture.md` describes real route paths instead of `?app=live-review`
- [ ] `frontend/README.md` describes the real app structure and frontend test directories
- [ ] Durable memory includes the decision to keep page ownership in features and frontend tests outside `src/`
- [ ] Task planning explicitly rethinks frontend integration and E2E coverage using `[[frontend-integration-tests]]` and `[[e2e-tests]]`
- [ ] Any route or page UI touched by this task uses Tailwind utilities instead of adding new non-Tailwind styling
- [ ] Refresh proof in this task is limited to the current Vite dev and Playwright flow; backend static-file SPA fallback remains out of scope

### Test Intent

- Backend: none
- Frontend: Playwright route smoke plus any touched frontend test suites
- Manual: browser route proof if Playwright coverage still needs a manual gap note

### Definition of Done

- [ ] Relevant frontend tests pass
- [ ] Typecheck passes
- [ ] Browser verification truth is recorded honestly

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
