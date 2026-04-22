---
title: Build timeline transport UI
type: note
permalink: video-annotator/tasks/build-timeline-transport-ui
id: task-build-timeline-transport-ui
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
- review
- m-2
- timeline
---

# Build timeline transport UI

## Creation Phase

### Description

Build reviewer-first timeline transport UI with manifest markers and visible selected-range controls on live review surface.

Depends on [[Add selected-range state]]. This task should render shared range state in transport chrome, not invent a second range source.

Read first:
- [[Workflow]]
- [[Video Ingest and Exact-Frame Review]]
- [[SAM2 Shell and Runtime]]
- `docs/spec.md`
- `docs/product/prd.md`
- `docs/ui/video-annotation-mockup.png`
- `frontend/src/features/video-review/components/review-transport-controls.tsx`
- `frontend/src/features/video-review/components/review-surface-panel.tsx`
- `frontend/tests/integration/video-review/live-review-screen.test.tsx`

Stage-2 rule: in planning phase, write concrete test plan and implementation plan first. In execution, follow written plan. Before `done`, run own review plus 2 subagent reviews and fix actionable findings.

### Scope

- In scope: timeline or range controls, annotated/keyframe markers from manifest data, and reviewer-first transport layout
- Out of scope: backend contract changes or summary fetch work

### Affected Features

- [[Video Ingest and Exact-Frame Review]]
- [[SAM2 Shell and Runtime]]

### Acceptance Criteria

- [ ] Live review shows timeline-first transport with visible current frame and selected range
- [ ] Annotated-frame and keyframe markers come from manifest data already loaded by review workspace
- [ ] Raw numeric frame entry is clearly secondary fallback, not primary transport UI

### Test Intent

- Backend: none
- Frontend: integration coverage for timeline markers and selected-range UI rendering
- Manual: browser-check timeline layout against live review mockup direction

### Definition of Done

- [ ] Planning phase records concrete tests and implementation plan before code
- [ ] Own review plus 2 subagent reviews are recorded and actionable findings are fixed
- [ ] Relevant tests and quality checks pass
- [ ] Feature notes, task note, and routing indexes are updated honestly when truth changes

## Planning Phase

### Planned Integration Tests

### Planned E2E Tests

### Planned Implementation

### Feature Matrix Updates

## Execution Phase

### Implementation Notes

## Wrap-Up Phase

### Verification

- Commands run:
- Results:

### Final Summary

### Completion Gate

- [ ] Acceptance Criteria checkboxes updated to match reality
- [ ] Definition of Done checkboxes updated to match reality
- [ ] Only now may `status` change to `done`
