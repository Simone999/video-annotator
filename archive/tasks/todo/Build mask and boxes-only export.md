---
title: Build mask and boxes-only export
type: note
permalink: video-annotator/tasks/build-mask-and-boxes-only-export
id: task-build-mask-and-boxes-only-export
status: todo
completed:
steps:
- creation
- planning
- execution
- wrap_up
tags:
- task
- backend
- export
- m-5
- artifacts
---

# Build mask and boxes-only export

## Creation Phase

### Description

Build PNG mask artifact emission and boxes-only mode on top of native export generator.

Read first:
- [[Workflow]]
- [[Export]]
- [[Export Format]]
- [[API]]
- [[Data Model]]
- `docs/spec.md`
- `backend/app/services/frame_annotations.py`

Stage-2 rule: in planning phase, write concrete test plan and implementation plan first. In execution, follow written plan. Before `done`, run own review plus 2 subagent reviews and fix actionable findings.

### Scope

- In scope: PNG mask tree emission, boxes-only mode, and deterministic artifact layout
- Out of scope: API routes or frontend UI

### Affected Features

- [[Export]]

### Acceptance Criteria

- [ ] Exporter can emit PNG mask tree with deterministic paths
- [ ] Boxes-only mode omits mask files without lying about annotation rows
- [ ] Tests prove deterministic artifact layout for both modes

### Test Intent

- Backend: add service tests for PNG mask output and boxes-only mode
- Frontend: none
- Manual: none

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
