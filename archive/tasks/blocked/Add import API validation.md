---
title: Add import API validation
type: note
permalink: video-annotator/tasks/add-import-api-validation
id: task-add-import-api-validation
status: blocked
completed:
steps:
- creation
- planning
- execution
- wrap_up
tags:
- task
- blocked
- backend
- import
- m-6
- api
---

# Add import API validation

## Creation Phase

### Description

Add import API surface and validation rules on top of importer service. Blocked until import contract and translation service land.

Read first:
- [[Workflow]]
- [[Import Existing Boxes]]
- [[Import Contract]]
- [[API]]
- `backend/app/api/videos.py`
- `backend/app/schemas/video.py`

Stage-2 rule: in planning phase, write concrete test plan and implementation plan first. In execution, follow written plan. Before `done`, run own review plus 2 subagent reviews and fix actionable findings.

### Scope

- In scope: API route, request validation, error handling, and typed response shape for import trigger
- Out of scope: frontend UI or guessed mapping behavior

### Affected Features

- [[Import Existing Boxes]]

### Acceptance Criteria

- [ ] Backend exposes import route with explicit validation and failure states
- [ ] Route uses importer translation service instead of duplicate mapping logic
- [ ] Task stays blocked until prior import tasks land

### Test Intent

- Backend: integration coverage for import route validation and persistence once unblocked
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
