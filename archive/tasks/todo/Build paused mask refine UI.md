---
title: Build paused mask refine UI
type: note
permalink: video-annotator/tasks/build-paused-mask-refine-ui
id: task-build-paused-mask-refine-ui
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
- m-4
- mask-editing
---

# Build paused mask refine UI

## Creation Phase

### Description

Add paused-stage brush add/erase refine UI for existing masks on live review surface.
Keep current review-route 1920x1080 direction from `docs/ui/video-review-1920x1080.png`. Use `docs/ui/video-review.html` as guide only, not strict contract.

Read first:
- [[Workflow]]
- [[Mask Editing and Cleanup]]
- [[SAM2 Shell and Runtime]]
- `docs/spec.md`
- `docs/product/prd.md`
- `docs/ui/video-review-1920x1080.png`
- `docs/ui/video-review.html`
- `frontend/src/features/video-review/components/review-surface-panel.tsx`
- `frontend/src/features/video-review/exact-frame-canvas.tsx`
- `frontend/src/features/video-review/components/review-inspector-panel.tsx`

Stage-2 rule: in planning phase, write concrete test plan and implementation plan first. In execution, follow written plan. Before `done`, run own review plus 2 subagent reviews and fix actionable findings.

### Scope

- In scope: paused-stage refine affordance, brush add/erase interaction, save trigger, honest disabled states, and preserving current 1920x1080 review-route direction
- Out of scope: cleanup flows, object-track delete, or redesigning current review-route shell

### Affected Features

- [[Mask Editing and Cleanup]]

### Acceptance Criteria

- [ ] Live review exposes paused-only refine controls for existing masks
- [ ] Brush add and erase interactions feed refine save flow on canonical frame
- [ ] Touched review UI keeps current 1920x1080 route direction from `docs/ui/video-review-1920x1080.png`; `docs/ui/video-review.html` stays guide only
- [ ] Frontend tests and browser proof cover refine affordance and paused-only guard

### Test Intent

- Backend: none
- Frontend: integration coverage for refine UI states and save trigger
- Manual: browser-check refine affordance on live review surface at 1920x1080 against committed PNG truth

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
