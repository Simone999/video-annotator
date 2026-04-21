---
id: task-testing-review-workspace-ergonomics
title: Testing review workspace ergonomics
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
- frontend
- workspace
- ergonomics
permalink: video-annotator/tasks/testing-review-workspace-ergonomics
---

## Creation Phase

### Description

Add durable coverage for the mockup-first review workspace shell without pretending live backend wiring already exists. Start from `[[Review Workspace Ergonomics]]`, then carefully re-think backend integration, frontend integration, and browser E2E before writing tests. Use `[[frontend-integration-tests]]`, `[[backend-api-integration-tests]]`, and `[[e2e-tests]]` first instead of copying old test shape.

### Scope

- In scope: library render, review render, page navigation, selected-object inspector switching, blocked rows for live backend or live-review gaps, and detailed manual checks for current shell ergonomics
- Out of scope: backend contract work, live review wiring, SAM2 runtime behavior, export work, or pretending blocked flows already have runnable coverage

### Affected Features

- [[Review Workspace Ergonomics]]

### Testing Notes

- [[frontend-integration-tests]]
- [[backend-api-integration-tests]]
- [[e2e-tests]]

### Acceptance Criteria

- [ ] Task note explicitly re-thinks backend integration vs frontend integration vs browser E2E with help from the testing notes before choosing coverage
- [ ] Frontend integration covers library render, review render, open-review navigation, back-to-library navigation, and selected-object inspector switching for the mockup shell
- [ ] Browser E2E stays optional and is used only if the task note explains why frontend integration is not enough for one shell workflow
- [ ] Live backend or live-review gaps stay blocked with exact reasons instead of fake green tests
- [ ] Manual frontend checks describe reviewer navigation flow clearly and show what still cannot be performed in the live stack
- [ ] `[[Review Workspace Ergonomics]]` is updated with evidence links and honest execution status values

### Test Intent

- Backend: none by default for the shell slice; if backend coverage becomes necessary, the task must explain why the shell question is really backend-owned
- Frontend: prove mockup-first shell behavior with fixture-backed UI and local page state while keeping backend fake at request boundary
- Manual: show how reviewer navigation feels in the shell today, where speed improves, and which live-review gaps remain blocked

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
