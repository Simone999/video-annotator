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

Add durable backend and frontend test coverage for manifest-backed object identity and saved manual box CRUD. Start from `[[Annotation Foundation and Manual Box Workflow]]`, choose scenarios from real operator behavior, and update the feature note with automation evidence and manual execution results.

### Scope

- In scope: manifest read coverage, object create or select coverage, saved manual box draw or reload or edit or delete coverage, and feature-note evidence updates
- Out of scope: SAM2 masks, export or import behavior, speculative object-management UX, or generic endpoint tests without operator value

### Affected Features

- [[Annotation Foundation and Manual Box Workflow]]

### Acceptance Criteria

- [ ] Backend integration and e2e scenarios cover manifest reads, object creation, manual annotation upsert and delete, and reload behavior with manual rows using `mask: null`
- [ ] Frontend integration and e2e scenarios cover object panel create or select, draw-save-reload, move, resize, and delete of saved manual boxes
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

- Backend: freeze manifest reads, object creation, manual annotation upsert, delete, and reload semantics with `mask: null`
- Frontend: freeze manifest-backed object selection plus saved manual box reload, move, resize, and delete behavior

### Planned E2E Tests

- Backend: cover round-trip object or manual-annotation persistence on a live local stack
- Frontend: cover create or select object, draw-save-reload, edit, and delete in a browser workflow

### Planned Implementation

- Read `[[Annotation Foundation and Manual Box Workflow]]`, `[[API]]`, `[[Data Model]]`, and `[[Test Plan]]`
- Reconfirm the `mask: null` manual-row contract before writing tests
- Add backend tests that freeze persistence and reload semantics first
- Add frontend tests that prove manifest-backed selection and saved manual edit state survive reload
- Update the feature note tables before and after implementation

### Feature Matrix Updates

- Before coding: refine planned rows in `[[Annotation Foundation and Manual Box Workflow]]` if task scenarios become more concrete
- After verification: add evidence links and honest manual status values in the feature note

## Execution Phase

### Implementation Notes

Write progress, decisions, blockers, and manual-test observations here while work is active.

## Wrap-Up Phase

### Verification

- Commands run:
- Results:

### Final Summary

Summarize new coverage, blocked gaps, and manual verification evidence.
