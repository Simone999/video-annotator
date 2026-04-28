---
id: TASK-7
title: Add import API and validation
status: To Do
assignee: []
created_date: '2026-04-28 17:37'
updated_date: '2026-04-28 17:42'
labels:
  - blocked
  - backend
  - import
  - m-6
  - api
milestone: m-2
dependencies:
  - TASK-5
  - TASK-6
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Add import API route and validation rules on top of importer service. This task owns backend entrypoint creation plus request or failure validation. Blocked until `[[Define current-pipeline import contract]]` and `[[Implement importer translation service]]` land.

Scope:
- In scope: API route creation, request validation, error handling, and typed response shape for import trigger
- Out of scope: frontend UI or guessed mapping behavior

Affected features:
- [[Import Existing Boxes]]

Prerequisites:
- `[[Define current-pipeline import contract]]` and `[[Implement importer translation service]]` must land before API work starts.

Historical context:
- Archived from a blocked snapshot with archive status `blocked`.
<!-- SECTION:DESCRIPTION:END -->

## References

<!-- SECTION:REFERENCES:BEGIN -->
- [[Workflow]]
- [[Import Existing Boxes]]
- [[Import Contract]]
- [[API]]
- `backend/app/api/videos.py`
- `backend/app/schemas/video.py`
- `archive/tasks/blocked/Add import API and validation.md`
<!-- SECTION:REFERENCES:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Backend exposes import route with explicit validation and failure states
- [ ] #2 Route uses importer translation service instead of duplicate mapping logic
- [ ] #3 Task stays blocked until prior import contract and translation tasks land
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Planned Tests
- Backend: targeted import route coverage once unblocked for validation, persistence, and failure states.
- Frontend: none.
- Manual: none.

### Implementation Steps
- Link canonical import contract and translation task output before writing route.
- Add targeted backend coverage for import validation, persistence, and failure states.
- Implement only API entrypoint and validation behavior needed to call importer service.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
### Execution Notes
No API work started.

### Blockers
Blocked pending TASK-5 and TASK-6.
<!-- SECTION:NOTES:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Canonical contract and translation prerequisites are linked before implementation begins
- [ ] #2 API code uses the translation service instead of duplicating mapping logic
- [ ] #3 Relevant targeted verification is recorded honestly once the task unblocks
- [ ] #4 Related import and API notes are updated if shipped behavior or contracts change
<!-- DOD:END -->

## Final Summary

<!-- SECTION:SUMMARY:BEGIN -->
Not done yet.
<!-- SECTION:SUMMARY:END -->
