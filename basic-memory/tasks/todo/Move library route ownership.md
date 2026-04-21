---
id: task-move-library-route-ownership
title: Move library route ownership
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
- library
permalink: video-annotator/tasks/move-library-route-ownership
---

# Move library route ownership

## Creation Phase

### Description

Move the runtime library page out of `frontend/src/features/ui-shell/` into an explicit `frontend/src/features/video-library/` feature so `/` is owned by the library feature, not by a historical shell folder.

### Scope

- In scope: create `frontend/src/features/video-library/`, move library page, loader, API client, preview helper, and library-specific types there, rename surviving `UiShell*` library names to explicit `VideoLibrary*` names, update runtime imports, and make library navigation use real route navigation to `/review/:videoId`
- Out of scope: moving live review route ownership, deleting all `ui-shell` leftovers, moving tests outside `src/`, or changing backend contracts

### Affected Features

- [[Review Workspace Ergonomics]]

### Acceptance Criteria

- [ ] `/` is owned by a route page under `frontend/src/features/video-library/pages/`
- [ ] Library runtime no longer depends on `UiShell*` names for files that moved into `video-library`
- [ ] `Open Review` uses real route navigation to `/review/:videoId`
- [ ] Library runtime behavior stays backend-backed and shell-first for the default path
- [ ] Later cleanup can remove the old `ui-shell` library files without breaking runtime imports
- [ ] Task planning explicitly rethinks frontend integration and E2E coverage using `[[frontend-integration-tests]]` and `[[e2e-tests]]`
- [ ] Any route or page UI touched by this task uses Tailwind utilities instead of adding new non-Tailwind styling

### Test Intent

- Backend: none
- Frontend: keep or update focused library integration proof after the move
- Manual: load `/`, inspect library cards, and open review navigation from one card

### Definition of Done

- [ ] Relevant frontend tests pass
- [ ] Typecheck passes
- [ ] Task wrap-up records the moved runtime boundaries honestly

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
