---
title: Implement real SAM2 propagation adapter
type: note
permalink: video-annotator/tasks/implement-real-sam2-propagation-adapter
id: task-implement-real-sam2-propagation-adapter
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
- sam2
- m-3
- runtime
---

# Implement real SAM2 propagation adapter

## Creation Phase

### Description

Replace placeholder propagation entry with real runtime adapter behavior while keeping the current SAM2 service boundary small and explicit.

Read first:
- [[Workflow]]
- [[SAM2 Shell and Runtime]]
- [[API]]
- `docs/spec.md`
- `backend/app/services/sam2.py`
- `backend/app/api/videos.py`
- `backend/tests/integration/api/test_sam2_shell_runtime.py`

Stage-2 rule: in planning phase, write concrete test plan and implementation plan first. In execution, follow written plan. Before `done`, run own review plus 2 subagent reviews and fix actionable findings.

### Scope

- In scope: propagation runtime boundary, request or response mapping, runtime setup, and missing-runtime failure states
- Out of scope: job persistence, progress polling, cancel handling, or frontend UI work

### Affected Features

- [[SAM2 Shell and Runtime]]

### Acceptance Criteria

- [ ] Propagation entry stops raising placeholder `NotImplementedError` on configured real runtime
- [ ] Adapter stays isolated behind current SAM2 service boundary
- [ ] Runtime setup and missing-runtime failure states are explicit and testable

### Test Intent

- Backend: add focused coverage for propagation adapter boundary and missing-runtime failure path
- Frontend: none
- Manual: none in this slice unless local runtime setup is needed to confirm adapter handshake

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
