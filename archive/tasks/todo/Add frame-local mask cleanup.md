---
title: Add frame-local mask cleanup
type: note
permalink: video-annotator/tasks/add-frame-local-mask-cleanup
id: task-add-frame-local-mask-cleanup
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

# Add frame-local mask cleanup

## Creation Phase

### Description

Add frame-local mask cleanup so one bad mask can disappear without deleting unrelated annotation rows.

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

- In scope: one-frame cleanup backend route or service, frontend action, and reopen proof
- Out of scope: whole-object cleanup or object-track delete

### Affected Features

- [[Mask Editing and Cleanup]]

### Acceptance Criteria

- [ ] One-frame cleanup removes only target frame mask data and preserves unrelated rows
- [ ] Live review exposes frame-local cleanup with clear scope copy
- [ ] Tests prove current frame changes without adjacent-frame corruption

### Test Intent

- Backend: integration coverage for one-frame cleanup scope
- Frontend: integration coverage for frame-local cleanup action and reload
- Manual: browser-check one-frame cleanup scope on live review route

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
