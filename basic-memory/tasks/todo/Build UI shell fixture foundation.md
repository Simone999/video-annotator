---
id: task-build-ui-shell-fixture-foundation
title: Build UI shell fixture foundation
status: todo
completed: null
steps:
- creation
- planning
- execution
- wrap_up
tags:
- task
- frontend
- ui
- fixtures
- mockup
permalink: video-annotator/tasks/build-ui-shell-fixture-foundation
---

## Creation Phase

### Description

Build the fixture-backed UI shell and swap the default frontend entry to it. Read `docs/ui/video-library.html`, `docs/ui/video-annotation.html`, `[[Review Workspace Ergonomics]]`, and `[[Frontend Interaction Spec]]` first. Keep this shell UI-only.

### Scope

- In scope: `ui-shell` feature namespace, UI-only types, fixture loader, default `App` swap, and shell-local screen state
- Out of scope: backend calls, new review business logic, `video-review/api.ts` changes, router library, or live contract wiring

### Affected Features

- [[Review Workspace Ergonomics]]

### Acceptance Criteria

- [ ] Default app renders the fixture-backed shell instead of the live review app
- [ ] Shell data loads through static frontend fixtures and one tiny UI-only loader
- [ ] Local page enum state decides which shell screen shows
- [ ] Existing live review feature code stays untouched except one tiny host adapter if truly needed
- [ ] Task note later records frontend verification honestly

### Test Intent

- Backend: none; backend is out of scope
- Frontend: prove the shell host loads fixture data and shows the right default screen without touching live `/api`
- Manual: open the frontend and confirm the library shell is the default entry

### Definition of Done

- [ ] Relevant frontend tests pass
- [ ] Feature note updated
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
