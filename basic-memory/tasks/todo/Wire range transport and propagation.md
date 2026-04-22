---
title: Wire range transport and propagation
type: note
permalink: video-annotator/tasks/wire-range-transport-and-propagation
id: task-wire-range-transport-and-propagation
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
- propagation
---

# Wire range transport and propagation

## Creation Phase

### Description

Wire timeline and selected-range interactions into canonical frame loading and existing propagation controls so live review uses range state instead of isolated numeric inputs.

Read first:
- [[Workflow]]
- [[Video Ingest and Exact-Frame Review]]
- [[SAM2 Shell and Runtime]]
- `docs/spec.md`
- `docs/product/prd.md`
- `frontend/src/features/video-review/hooks/use-live-review-controller.ts`
- `frontend/src/features/video-review/components/review-transport-controls.tsx`
- `frontend/src/features/video-review/components/review-inspector-panel.tsx`
- `frontend/tests/integration/video-review/live-review-screen.test.tsx`

Stage-2 rule: in planning phase, write concrete test plan and implementation plan first. In execution, follow written plan. Before `done`, run own review plus 2 subagent reviews and fix actionable findings.

### Scope

- In scope: timeline click or drag behavior, range-driven frame loads, and propagation control reuse of selected range
- Out of scope: selected-object summary fetch or export behavior

### Affected Features

- [[Video Ingest and Exact-Frame Review]]
- [[SAM2 Shell and Runtime]]

### Acceptance Criteria

- [ ] Timeline interactions load canonical backend frames, not browser playback time
- [ ] Propagation controls reuse selected range without inventing second range source
- [ ] Paused-only mutation guard still holds while transport gets richer

### Test Intent

- Backend: none
- Frontend: integration coverage for timeline-driven frame loads and propagation-range wiring
- Manual: browser-check selected range and propagation controls stay coherent during review

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
