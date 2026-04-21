---
id: task-add-review-navigation-controls
title: Add review navigation controls
status: todo
completed:
steps:
- creation
- planning
- execution
- wrap_up
tags:
- task
- frontend
- controls
- review
- frames
permalink: video-annotator/tasks/add-review-navigation-controls
---

## Creation Phase

### Description

Finish `[[m-2: Review Workspace Completion]]` controls on the live review path. Use manifest-provided frame lists and canonical frame state to add useful default landing, annotated-frame and keyframe jumps, keyboard shortcuts, and mask-opacity controls without letting browser time become annotation truth.

### Scope

- In scope: default landing-frame selection, annotated-frame jumps, keyframe jumps, keyboard controls for routine review movement, mask-opacity controls, and tests for those workflows
- Out of scope: export work, fixture-shell-only polish, or backend frame-truth rewrites that existing manifest data already covers

### Affected Features

- [[Review Workspace Ergonomics]]
- [[Video Ingest and Exact-Frame Review]]
- [[SAM2 Shell and Runtime]]

### Acceptance Criteria

- [ ] Opening live review lands on a useful canonical frame without manual frame entry
- [ ] Reviewer can jump between annotated frames or keyframes without typing raw frame numbers repeatedly
- [ ] Keyboard controls and mask-opacity controls are available on the live review path
- [ ] Automated tests cover the new review controls honestly

### Test Intent

- Backend: none unless a missing manifest or summary contract is proven during planning
- Frontend: prove landing-frame, frame-jump, keyboard, and opacity behavior on the live review path
- Manual: verify controls feel usable in browser and record exact blocked cases if any remain

### Definition of Done

- [ ] Relevant frontend tests pass
- [ ] Browser verification recorded honestly
- [ ] Memory updated if behavior changes
- [ ] Supporting docs updated if control behavior or contracts change

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
