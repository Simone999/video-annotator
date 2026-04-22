---
title: Implement refine-mask backend
type: note
permalink: video-annotator/tasks/implement-refine-mask-backend
id: task-implement-refine-mask-backend
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
- m-4
- refine
---

# Implement refine-mask backend

## Creation Phase

### Description

Implement same-frame refine backend path for existing masks using corrected-mask contract from previous task.

Blocked until [[Define corrected-mask contract]] lands real persistence and summary-reset semantics.

Read first:
- [[Workflow]]
- [[Mask Editing and Cleanup]]
- [[SAM2 Shell and Runtime]]
- [[API]]
- [[Data Model]]
- `backend/app/services/sam2.py`
- `backend/app/api/videos.py`
- `backend/tests/integration/api/test_sam2_shell_runtime.py`

Stage-2 rule: in planning phase, write concrete test plan and implementation plan first. In execution, follow written plan. Before `done`, run own review plus 2 subagent reviews and fix actionable findings.

### Scope

- In scope: refine service path, route, persistence, and reopen behavior for corrected same-frame masks
- Out of scope: brush UI or cleanup flows

### Affected Features

- [[Mask Editing and Cleanup]]
- [[SAM2 Shell and Runtime]]

### Acceptance Criteria

- [ ] Backend exposes refine path for one existing persisted mask on one canonical frame
- [ ] Refined masks persist with corrected-state semantics and reopen through normal reads
- [ ] Backend tests prove refine persistence and reopen behavior

### Test Intent

- Backend: add integration coverage for refine route, persistence, and reopen semantics
- Frontend: none
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
