---
id: task-build-review-page-mockup-shell
title: Build review page mockup shell
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
- review
- mockup
permalink: video-annotator/tasks/build-review-page-mockup-shell
---

## Creation Phase

### Description

Build the review screen to match `docs/ui/video-annotation.html` with fixture data only. Keep it UI-only. The shell may show playback chrome and overlays, but it must not wire live review behavior.

### Scope

- In scope: top metadata bar, left global nav, frame-object list, main stage with overlay chrome, bottom transport and timeline, right inspector, fixture-backed selected object display, and mockup-first layout styling
- Out of scope: backend frame loads, live playback rules, SAM2 runtime, save behavior, or export behavior

### Affected Features

- [[Review Workspace Ergonomics]]

### Acceptance Criteria

- [ ] Review shell matches the mockup structure and visual hierarchy
- [ ] Top metadata bar and left global nav render in the review shell
- [ ] Frame-object list, stage, bottom transport, timeline, and right inspector all render from fixture data
- [ ] Stage chrome includes the visible play overlay and the review action controls from the mockup, even when they are UI-only
- [ ] Selected object data in the inspector comes from shell-local state, not live backend state
- [ ] All action buttons stay UI-only unless they navigate between shell pages
- [ ] Task note later records frontend verification honestly

### Test Intent

- Backend: none; backend is out of scope
- Frontend: prove the review screen renders the full mockup shell from fixture data and reflects shell-local selection state
- Manual: compare the rendered review shell with the mockup

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
