---
id: task-testing-mask-editing-and-cleanup
title: Testing mask editing and cleanup
status: todo
completed: null
steps:
- creation
- planning
- execution
- wrap_up
tags:
- task
- testing
- backend
- frontend
- masks
permalink: video-annotator/tasks/testing-mask-editing-and-cleanup
---

## Creation Phase

### Description

Own the test plan for manual mask correction and cleanup workflows. Start from `[[Mask Editing and Cleanup]]`, carefully re-think backend integration, frontend integration, and browser E2E with the testing notes, then keep blocked rows explicit until the feature exists.

### Scope

- In scope: blocked backend or frontend or manual scenarios for refine and cleanup, plus any current prerequisite mask reopen behavior worth freezing
- Out of scope: inventing refine APIs, brush UI, cleanup semantics, or pretending absent workflows already have runnable coverage

### Affected Features

- [[Mask Editing and Cleanup]]

### Testing Notes

- [[backend-api-integration-tests]]
- [[frontend-integration-tests]]
- [[e2e-tests]]

### Acceptance Criteria

- [ ] Task note explicitly re-thinks backend integration vs frontend integration vs browser E2E with help from the testing notes before choosing coverage
- [ ] Existing prerequisite mask-reopen behavior is covered where it already exists
- [ ] Backend and frontend e2e planning is explicit: backend scenarios cover refine and cleanup semantics while frontend scenarios cover brush and cleanup interactions
- [ ] Missing refine, brush, and cleanup workflows are represented as blocked backend and frontend scenarios with exact reasons instead of fake test files
- [ ] When the feature begins to land, backend tests cover refine persistence and cleanup semantics while frontend tests cover brush and cleanup interactions
- [ ] Manual frontend checks describe refine, brush, and cleanup workflows clearly enough for later execution and record results in `[[Mask Editing and Cleanup]]`
- [ ] `[[Mask Editing and Cleanup]]` is updated with evidence links and honest execution status values

### Test Intent

- Backend: define future refine and cleanup verification around persistence and deletion semantics, while freezing only real prerequisite behavior today
- Frontend: define future brush and cleanup workflows from real correction tasks without creating placeholder green suites
- Manual: document later operator checks for refine or erase or delete-all behavior and record current blocked state honestly

### Definition of Done

- [ ] Relevant backend tests pass
- [ ] Relevant frontend tests pass
- [ ] Feature note updated
- [ ] Manual execution status recorded honestly
- [ ] Docs or memory updated if behavior or contracts changed

## Planning Phase

### Planned Integration Tests

- Backend:
- Frontend:

### Planned E2E Tests

- Backend:
- Frontend:

### Planned Implementation

- Step 1:
- Step 2:

### Feature Matrix Updates

- Feature note updates needed before or during execution:

## Execution Phase

### Implementation Notes

Write progress, decisions, blockers, and verification observations here while work is active.

## Wrap-Up Phase

### Verification

- Commands run:
- Results:

### Final Summary

PR-style summary of what changed and how it was verified.

### Completion Gate

- [ ] Acceptance Criteria checkboxes updated to match reality
- [ ] Definition of Done checkboxes updated to match reality
- [ ] Only now may `status` change to `done`
