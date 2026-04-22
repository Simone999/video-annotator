---
title: Add whole-object mask cleanup
type: note
permalink: video-annotator/tasks/add-whole-object-mask-cleanup
id: task-add-whole-object-mask-cleanup
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
- frontend
- m-4
- cleanup
---

# Add whole-object mask cleanup

## Creation Phase

### Description

Add whole-object mask cleanup so one object can lose masks across frames without touching other objects.

Read first:
- [[Workflow]]
- [[Mask Editing and Cleanup]]
- [[API]]
- [[Data Model]]
- `backend/app/services/frame_annotations.py`
- `backend/app/api/videos.py`
- `frontend/src/features/video-review/components/review-inspector-panel.tsx`

Stage-2 rule: in planning phase, write concrete test plan and implementation plan first. In execution, follow written plan. Before `done`, run own review plus 2 subagent reviews and fix actionable findings.

### Scope

- In scope: whole-object cleanup backend route or service, frontend action, and multi-frame reopen proof
- Out of scope: object-track delete or export behavior

### Affected Features

- [[Mask Editing and Cleanup]]

### Acceptance Criteria

- [ ] Whole-object cleanup removes mask data only for selected object across frames
- [ ] Live review exposes whole-object cleanup with clear scope copy
- [ ] Tests prove unrelated object rows stay intact after cleanup

### Test Intent

- Backend: integration coverage for whole-object cleanup scope
- Frontend: integration coverage for whole-object cleanup action and reload
- Manual: browser-check whole-object cleanup scope on live review route

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
