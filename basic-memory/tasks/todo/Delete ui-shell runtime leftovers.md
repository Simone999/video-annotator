---
id: task-delete-ui-shell-runtime-leftovers
title: Delete ui-shell runtime leftovers
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

- [ ] No runtime import path under `frontend/src/` points at `frontend/src/features/ui-shell/`
- [ ] Fixture-only review runtime is deleted rather than preserved as a hidden route
- [ ] Remaining library and review runtime names are explicit about `video-library` and `video-review`
- [ ] Cleanup does not reintroduce shell-local page enums or query-string review switching
- [ ] Dead code created by the route move is removed surgically
- [ ] Task planning explicitly rethinks frontend integration and E2E coverage using `[[frontend-integration-tests]]` and `[[e2e-tests]]`
- [ ] Any route or page UI touched by this task uses Tailwind utilities instead of adding new non-Tailwind styling

### Test Intent

- Backend: none
- Frontend: run targeted search plus relevant frontend tests after cleanup
- Manual: none beyond runtime smoke if later tasks need it

### Definition of Done

- [ ] Relevant frontend tests pass
- [ ] Typecheck passes
- [ ] Task wrap-up records the deleted runtime surfaces honestly

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
