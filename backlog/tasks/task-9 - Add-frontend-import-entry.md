---
id: TASK-9
title: Add frontend import entry
status: To Do
assignee: []
created_date: '2026-04-28 17:37'
updated_date: '2026-04-28 17:42'
labels:
  - blocked
  - frontend
  - import
  - m-6
  - ui
milestone: m-2
dependencies:
  - TASK-7
  - TASK-8
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Add user-visible import entry and reload UX on normal review flow. Blocked until `[[Add import API and validation]]` and `[[Wire import review-state transitions]]` exist.

Scope:
- In scope: visible import entry, success/failure copy, and reload path into normal library or review reads
- Out of scope: CLI-only import or guessed backend states

Affected features:
- [[Import Existing Boxes]]
- [[Video Ingest and Exact-Frame Review]]

Prerequisites:
- `[[Add import API and validation]]` and `[[Wire import review-state transitions]]` must land before frontend entry work starts.

Historical context:
- Archived from a blocked snapshot with archive status `blocked`.
<!-- SECTION:DESCRIPTION:END -->

## References

<!-- SECTION:REFERENCES:BEGIN -->
- [[Workflow]]
- [[Import Existing Boxes]]
- [[Video Ingest and Exact-Frame Review]]
- [[Product Requirements]]
- [[Frontend Interaction Spec]]
- `frontend/src/features/video-library/components/video-library-screen.tsx`
- `frontend/src/features/video-review/components/live-review-screen.tsx`
- `archive/tasks/blocked/Add frontend import entry.md`
<!-- SECTION:REFERENCES:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Frontend exposes import as normal user-visible review workflow
- [ ] #2 Success and failure states are explicit and route back into normal reads
- [ ] #3 Task stays blocked until import backend path exists
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Planned Tests
- Backend: none.
- Frontend: targeted import entry and reload coverage once unblocked for trigger, success or failure states, and reload behavior.
- Manual: browser-check import UX against a real pipeline sample once unblocked.

### Implementation Steps
- Link import API and review-state task output before touching frontend entry points.
- Add targeted frontend coverage for import trigger, success and failure states, and reload behavior.
- Implement only user-visible import entry and reload UX needed to route back into normal reads.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
### Execution Notes
No frontend import work started.

### Blockers
Blocked pending TASK-7 and TASK-8.
<!-- SECTION:NOTES:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 API and review-state prerequisites are linked before implementation begins
- [ ] #2 Frontend changes keep import inside the normal review flow without inventing separate state logic
- [ ] #3 Relevant targeted verification is recorded honestly once the task unblocks
- [ ] #4 Related import and frontend notes are updated if shipped behavior or contracts change
<!-- DOD:END -->

## Final Summary

<!-- SECTION:SUMMARY:BEGIN -->
Not done yet.
<!-- SECTION:SUMMARY:END -->
