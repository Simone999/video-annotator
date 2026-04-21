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

Add durable coverage for review-workspace ergonomics without pretending missing workflows already exist. Start from `[[Review Workspace Ergonomics]]`, capture current shipped behavior, and document blocked scenarios for the missing ergonomics layer.

### Scope

- In scope: tests and blocked rows for today’s workspace baseline, marker-truth backend coverage, and detailed manual checks for current navigation ergonomics
- Out of scope: implementing missing ergonomics features such as annotated-frame jumps, keyframe jumps, timeline markers, shortcuts, opacity control, or richer object-panel state

### Affected Features

- [[Review Workspace Ergonomics]]

### Acceptance Criteria

- [ ] Backend coverage confirms manifest marker data needed for annotated-frame and keyframe navigation stays correct
- [ ] Frontend tests cover currently shipped baseline behavior for opening the workspace, jump or step controls, and object-panel basics
- [ ] Backend and frontend e2e planning is explicit: backend scenarios focus on marker truth and frontend scenarios focus on operator navigation workflows
- [ ] Missing workflows such as annotated-frame jumps, keyframe jumps, timeline markers, shortcuts, opacity, and richer object-panel state are captured as blocked scenarios with clear reasons
- [ ] Manual frontend checks describe reviewer-speed workflows and explicitly show what cannot yet be performed
- [ ] `[[Review Workspace Ergonomics]]` is updated with evidence links and honest execution status values

### Test Intent

- Backend: prove any currently exposed marker truth needed for future annotated-frame or keyframe navigation stays correct
- Frontend: cover currently shipped workspace open or jump or step behavior and object-panel basics without inventing missing controls
- Manual: show how a reviewer would navigate large frame sets today, where speed breaks down, and which missing controls remain blocked

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
