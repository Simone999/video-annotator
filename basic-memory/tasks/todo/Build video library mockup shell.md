---
id: task-build-video-library-mockup-shell
title: Build video library mockup shell
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
- library
- mockup
permalink: video-annotator/tasks/build-video-library-mockup-shell
---

## Creation Phase

### Description

Build the library screen to match `docs/ui/video-library.html` with fixture data only. Keep it presentational. Do not pull backend or live review logic into the page.

### Scope

- In scope: top header chrome, search field, left nav rail, summary metrics strip, library card rendering, required card fields, state badges, detail lines, propagation progress display, and `Open Review` action UI
- Out of scope: backend fetches, import UI, live progress logic, or router work

### Affected Features

- [[Review Workspace Ergonomics]]

### Acceptance Criteria

- [ ] Library shell matches the mockup layout and visual hierarchy
- [ ] Top header chrome, left nav rail, and summary metrics strip render in the library shell
- [ ] Every card shows preview, display name, state badge, frame count, fps, resolution, last reviewed label, and one detail line
- [ ] Propagation progress shows only for `in_progress` fixture rows
- [ ] `Open Review` action is present and wired only to local shell navigation
- [ ] Task note later records frontend verification honestly

### Test Intent

- Backend: none; backend is out of scope
- Frontend: prove library screen renders shell chrome plus required card fields from fixture data and exposes the open-review action
- Manual: compare the rendered library shell with the mockup

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
