---
id: task-testing-annotation-foundation-and-manual-box-workflow
title: Testing annotation foundation and manual box workflow
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
- manual-box
permalink: video-annotator/tasks/testing-annotation-foundation-and-manual-box-workflow
---

## Creation Phase

### Description

Add durable backend and frontend test coverage for manifest-backed object identity and saved manual box CRUD. Start from `[[Annotation Foundation and Manual Box Workflow]]`, carefully re-think backend integration, frontend integration, and browser E2E with the testing notes, and keep this task tied to the live manual-box feature path rather than the new default mockup shell.

### Scope

- In scope: manifest read coverage, object create or select coverage, saved manual box draw or reload or edit or delete coverage, and feature-note evidence updates
- Out of scope: SAM2 masks, export or import behavior, speculative object-management UX, or generic endpoint tests without operator value

### Affected Features

- [[Annotation Foundation and Manual Box Workflow]]

### Testing Notes

- [[backend-api-integration-tests]]
- [[frontend-integration-tests]]
- [[e2e-tests]]

### Acceptance Criteria

- [ ] Task note explicitly re-thinks backend integration vs frontend integration vs browser E2E with help from the testing notes before choosing coverage
- [ ] Backend integration and e2e scenarios cover manifest reads, object creation, manual annotation upsert and delete, and reload behavior with manual rows using `mask: null`
- [ ] Frontend integration and e2e scenarios cover the live manual-box feature path or dedicated harness for object panel create or select, draw-save-reload, move, resize, and delete of saved manual boxes
- [ ] Edge cases are selected from real corruption risks such as wrong-video object IDs, invalid frame writes, and stale reload state rather than generic endpoint guessing
- [ ] Manual frontend checks document exact setup and steps for create, draw, reload, edit, and delete flows
- [ ] `[[Annotation Foundation and Manual Box Workflow]]` is updated with evidence links and honest execution status values

### Test Intent

- Backend: prove manifest-backed identity, object creation, manual-row persistence, `mask: null` reload semantics, and delete behavior on real persistence paths
- Frontend: prove reviewers can create or select an object, draw a box, reload it, move it, resize it, and delete it while staying manifest-backed
- Manual: verify drag precision, refresh or reopen persistence, and stale-state risks that automation may miss

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
