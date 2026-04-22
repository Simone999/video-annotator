---
title: Implement real SAM2 prompt adapter
type: note
permalink: video-annotator/tasks/implement-real-sam2-prompt-adapter
id: task-implement-real-sam2-prompt-adapter
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

# Implement real SAM2 prompt adapter

## Creation Phase

### Description

Replace placeholder prompt-box path with real adapter behavior behind existing SAM2 service boundary.

Read first:
- [[Workflow]]
- [[SAM2 Shell and Runtime]]
- [[SAM2 Integration]]
- `docs/spec.md`
- `backend/app/services/sam2.py`
- `backend/app/schemas/sam2.py`
- `backend/tests/integration/api/test_sam2_shell_runtime.py`

Stage-2 rule: in planning phase, write concrete test plan and implementation plan first. In execution, follow written plan. Before `done`, run own review plus 2 subagent reviews and fix actionable findings.

### Scope

- In scope: runtime adapter implementation for same-frame prompt-box only, with clear dependency and config handling behind service seam
- Out of scope: propagation runtime, refine flow, or frontend wiring

### Affected Features

- [[SAM2 Shell and Runtime]]

### Acceptance Criteria

- [ ] Prompt-box path stops raising placeholder `NotImplementedError` on configured real runtime
- [ ] Adapter stays isolated behind current SAM2 service boundary
- [ ] Runtime setup and missing-runtime failure states are explicit and testable

### Test Intent

- Backend: add focused adapter and route tests for real prompt path and failure states
- Frontend: none
- Manual: run only if local real runtime is available; otherwise record blocker honestly

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
