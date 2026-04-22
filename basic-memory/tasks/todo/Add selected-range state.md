---
title: Add selected-range state
type: note
permalink: video-annotator/tasks/add-selected-range-state
id: task-add-selected-range-state
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
- selected-range
---

# Add selected-range state

## Creation Phase

### Description

Add explicit selected-range state to live review so timeline, propagation, and inspector summary all read same reviewer-owned range.

Current live review still derives selected-object summary range from propagation direction plus end-frame inputs inside `frontend/src/features/video-review/hooks/use-live-review-controller.ts`. This task replaces that implicit source with one explicit reviewer-owned range state.

Read first:
- [[Workflow]]
- [[Video Ingest and Exact-Frame Review]]
- [[SAM2 Shell and Runtime]]
- `docs/spec.md`
- `docs/product/prd.md`
- `frontend/src/features/video-review/state.ts`
- `frontend/src/features/video-review/workspace.ts`
- `frontend/src/features/video-review/hooks/use-live-review-controller.ts`

Stage-2 rule: in planning phase, write concrete test plan and implementation plan first. In execution, follow written plan. Before `done`, run own review plus 2 subagent reviews and fix actionable findings.

### Scope

- In scope: selected-range shape, default rules, reset rules, and state wiring needed by later UI work
- Out of scope: timeline UI, summary API client, or export behavior

### Affected Features

- [[Video Ingest and Exact-Frame Review]]
- [[SAM2 Shell and Runtime]]

### Acceptance Criteria

- [ ] Live review has explicit selected-range state with stable start/end semantics on canonical frame indices
- [ ] Default and reset rules are written down in code and task planning, not left implicit
- [ ] Existing review bootstrap still works before timeline UI lands

### Test Intent

- Backend: none
- Frontend: add reducer or controller coverage for selected-range defaults and reset rules before UI work
- Manual: none in this slice

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
