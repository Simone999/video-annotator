---
id: task-wire-page-actions-and-local-ui-state
title: Wire page actions and local UI state
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
- navigation
- state
permalink: video-annotator/tasks/wire-page-actions-and-local-ui-state
---

## Creation Phase

### Description

Wire shell page actions with local UI state only. `Open Review` must open the chosen fixture video. `Back to Library` must return to the library through one explicit review-screen control added in shell chrome, because the mockup does not provide a clear back action by itself. Keep this state local and simple.

### Scope

- In scope: page enum state, chosen video state, selected object state, open-review action, one explicit back-to-library action in review chrome, and shell-local state persistence across page switches
- Out of scope: router library, URL routing, backend state sync, or live feature reducer work

### Affected Features

- [[Review Workspace Ergonomics]]

### Acceptance Criteria

- [ ] `Open Review` opens the review shell for the chosen fixture video
- [ ] Review shell exposes one clear `Back to Library` affordance in its chrome
- [ ] `Back to Library` returns to the library shell
- [ ] Selected video and selected object state stay coherent across shell page switches
- [ ] Navigation uses local state only and adds no router dependency
- [ ] Task note later records frontend verification honestly

### Test Intent

- Backend: none; backend is out of scope
- Frontend: prove page actions and selection state work through local shell state only
- Manual: switch between pages and confirm selected shell state stays coherent

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
