---
id: task-testing-export
title: Testing export
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
- export
permalink: video-annotator/tasks/testing-export
---

## Creation Phase

### Description

Own the test plan for deterministic export. Start from `[[Export]]`, carefully re-think backend integration, frontend integration, and browser E2E with the testing notes, then keep blocked rows explicit until export code exists.

### Scope

- In scope: blocked export scenarios, prerequisite deterministic storage checks that already exist, and manual artifact-inspection steps for later execution
- Out of scope: shipping export code, pretending export UI exists, or writing fake deterministic tests against nonexistent routes

### Affected Features

- [[Export]]

### Testing Notes

- [[backend-api-integration-tests]]
- [[frontend-integration-tests]]
- [[e2e-tests]]

### Acceptance Criteria

- [ ] Task note explicitly re-thinks backend integration vs frontend integration vs browser E2E with help from the testing notes before choosing coverage
- [ ] Prerequisite deterministic mask-path behavior is covered where it already exists
- [ ] Backend and frontend e2e planning is explicit: backend scenarios cover create/download/determinism while frontend scenarios cover export trigger and download workflow
- [ ] Missing export API, generator, UI, and golden verification stay blocked with exact reasons until implemented
- [ ] When export lands, backend tests cover create, download, determinism, and artifact contents while frontend tests cover export trigger and download workflow
- [ ] Manual frontend checks describe how to inspect export artifacts and compare repeated runs, and results are recorded in `[[Export]]`
- [ ] `[[Export]]` is updated with evidence links and honest execution status values

### Test Intent

- Backend: define future export verification around create or download or determinism or artifact contents while covering only real prerequisite behaviors today
- Frontend: define later export-trigger and download workflows from real handoff scenarios without inventing a UI that is not shipped
- Manual: document how an operator will inspect generated JSON or PNG outputs and compare repeated runs once export exists

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
