---
id: task-add-ui-integration-tests-for-shell
title: Add UI integration tests for shell
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
- ui
- integration
permalink: video-annotator/tasks/add-ui-integration-tests-for-shell
---

## Creation Phase

### Description

Add durable test coverage for the mockup shell. Carefully re-think frontend integration vs browser E2E before writing tests. Start from `[[Review Workspace Ergonomics]]`, `[[frontend-integration-tests]]`, and `[[e2e-tests]]`. Default proof layer is frontend integration with mocked HTTP fixture loads.

### Scope

- In scope: library shell chrome render coverage, review shell chrome render coverage, open-review navigation, back-to-library navigation, selected-object inspector switching, and explicit browser-E2E justification if any browser test is added
- Out of scope: backend API coverage, live review logic tests, or fake green E2E added only because the shell is visual

### Affected Features

- [[Review Workspace Ergonomics]]

### Testing Notes

- [[frontend-integration-tests]]
- [[e2e-tests]]

### Acceptance Criteria

- [ ] Task note explicitly re-thinks frontend integration vs browser E2E with help from the testing notes before choosing coverage
- [ ] Frontend integration proves library shell chrome render, review shell chrome render, open-review navigation, back-to-library navigation, and selected-object inspector switching
- [ ] Frontend integration proves the explicit review-screen back affordance exists and works
- [ ] Browser E2E is absent by default or justified explicitly if one shell workflow truly needs browser proof
- [ ] Tests use mocked HTTP or fixture loads only and do not depend on live backend routes
- [ ] `[[Review Workspace Ergonomics]]` is updated with evidence links and honest execution status values

### Test Intent

- Backend: none; backend is out of scope
- Frontend: prove real shell screens and page actions work while backend stays fake at request boundary
- Manual: compare shell interactions with the mockup and record anything automation misses

### Definition of Done

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
