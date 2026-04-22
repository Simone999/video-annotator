---
title: Add export API and client
type: note
permalink: video-annotator/tasks/add-export-api-and-client
id: task-add-export-api-and-client
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
- export
- m-5
- api
---

# Add export API and client

## Creation Phase

### Description

Add export create/download API routes and typed frontend client support.

Read first:
- [[Workflow]]
- [[Export]]
- [[API]]
- [[Export Format]]
- `docs/spec.md`
- `backend/app/api/videos.py`
- `frontend/src/features/video-review/api.ts`
- `frontend/src/features/video-library/api.ts`

Stage-2 rule: in planning phase, write concrete test plan and implementation plan first. In execution, follow written plan. Before `done`, run own review plus 2 subagent reviews and fix actionable findings.

### Scope

- In scope: export create route, download route, typed client support, and error handling
- Out of scope: live export UI or library state rendering

### Affected Features

- [[Export]]

### Acceptance Criteria

- [ ] Backend exposes export create and download routes for deterministic artifacts
- [ ] Frontend has typed client support for export create/download flow
- [ ] Tests prove route behavior and client parsing

### Test Intent

- Backend: integration coverage for export routes
- Frontend: unit coverage for typed export client parsing
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
