---
title: Integrate prompt runtime persistence
type: note
permalink: video-annotator/tasks/integrate-prompt-runtime-persistence
id: task-integrate-prompt-runtime-persistence
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
- api
---

# Integrate prompt runtime persistence

## Creation Phase

### Description

Persist real prompt runtime results through current routes, mask storage, confidence plumbing, and error handling.

Read first:
- [[Workflow]]
- [[SAM2 Shell and Runtime]]
- [[API]]
- [[Data Model]]
- `docs/spec.md`
- `backend/app/api/videos.py`
- `backend/app/services/sam2.py`
- `backend/app/services/frame_annotations.py`
- `backend/tests/integration/api/test_sam2_shell_runtime.py`

Stage-2 rule: in planning phase, write concrete test plan and implementation plan first. In execution, follow written plan. Before `done`, run own review plus 2 subagent reviews and fix actionable findings.

### Scope

- In scope: route integration, mask persistence, confidence persistence, and backend error mapping for prompt results
- Out of scope: propagation runtime or frontend UI work

### Affected Features

- [[SAM2 Shell and Runtime]]

### Acceptance Criteria

- [ ] Real prompt results persist through existing frame-annotation storage path
- [ ] Prompt route returns real runtime result shape with honest confidence values
- [ ] Runtime failures surface through stable API errors instead of placeholder crashes

### Test Intent

- Backend: integration coverage for persisted prompt results and failure mapping
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
