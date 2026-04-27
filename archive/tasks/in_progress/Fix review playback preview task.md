---
title: Fix review playback preview task
type: note
permalink: video-annotator/tasks/fix-review-playback-preview-task
id: task-fix-review-playback-preview-task
status: in_progress
created: 2026-04-24
steps:
- creation
- planning
- execution
- wrap_up
tags:
- task
- frontend
- review
- playback
- preview
---

# Fix review playback preview task

## Creation Phase

### Description

Fix review playback preview behavior inside frontend live review controller.

### Scope

- In scope: resume play from shown paused frame, fast preview frame updates during playback, playhead and bottom thumbnails driven by shown frame while playing, pause exact-frame fetch for paused frame, and hook-owned playback wording cleanup.
- Out of scope: stop button, backend contracts, non-owned review UI files, and broader review transport redesign.

### Affected Features

- [[Frontend Interaction Spec]]
- [[Frame Indexing Contract]]

### Acceptance Criteria

- [ ] play resumes from currently shown paused frame instead of stale current-frame state
- [ ] playback preview updates via `requestVideoFrameCallback` when available, else `requestAnimationFrame`
- [ ] shown frame drives `previewFrameIndex` during playback so transport playhead and thumbnails move with playback
- [ ] pause still fetches backend exact frame for paused frame index
- [ ] hook-owned playback wording drops `canonical frame`

### Test Intent

- Frontend: unit coverage for resume point, fast playback preview updates, pause commit, and wording.
- Manual: none planned in this task session.

### Definition of Done

- [ ] Relevant frontend tests pass
- [ ] Task note wrap-up records exact commands and results honestly
- [ ] Durable memory updated if bug learnings are worth keeping

## Planning Phase

### Planned Integration Tests

- Frontend: none

### Planned E2E Tests

- Frontend: none

### Planned Implementation

- Step 1: add failing hook tests for resume-from-preview, playback preview scheduler, and wording cleanup.
- Step 2: add minimal scheduler and resume-state fixes in `use-live-review-controller.ts`.
- Step 3: run targeted frontend tests and record results.

## Execution Phase

### Implementation Notes

- Pending.

## Wrap-Up Phase

### Verification

- Commands run:
- Results:

### Final Summary

- Pending.

### Completion Gate

- [ ] Acceptance Criteria checkboxes updated to match reality
- [ ] Definition of Done checkboxes updated to match reality
- [ ] Only now may `status` change to `done`
