---
id: TASK-8
title: Wire import review-state transitions
status: To Do
assignee: []
created_date: '2026-04-28 17:37'
updated_date: '2026-04-28 17:42'
labels:
  - blocked
  - backend
  - import
  - m-6
  - states
milestone: m-2
dependencies:
  - TASK-7
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Wire import-write behavior into existing review-state derivation so imported work moves videos to `started` and resets reviewed or exported work honestly on reimport. Derivation groundwork already exists. Remaining work is import-write behavior plus reimport reset semantics after `[[Add import API and validation]]` lands.

Scope:
- In scope: import-write behavior that triggers existing review-state derivation, reimport reset over reviewed or exported work, and honest persisted state after import
- Out of scope: frontend UI or rebuilding already-shipped derivation groundwork

Affected features:
- [[Import Existing Boxes]]
- [[Video Ingest and Exact-Frame Review]]

Prerequisites:
- `[[Add import API and validation]]` must land before import-write state transition work starts.

Historical context:
- Archived from a blocked snapshot with archive status `blocked`.
<!-- SECTION:DESCRIPTION:END -->

## References

<!-- SECTION:REFERENCES:BEGIN -->
- [[Workflow]]
- [[Import Existing Boxes]]
- [[Video Ingest and Exact-Frame Review]]
- [[API]]
- [[Data Model]]
- `backend/app/services/review_summaries.py`
- `archive/tasks/blocked/Wire import review-state transitions.md`
<!-- SECTION:REFERENCES:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Import writes move video state to `started` with honest summary facts using already-landed derivation groundwork
- [ ] #2 Reimport over reviewed or exported work resets state per PRD rules
- [ ] #3 Task stays blocked until import route and mapping truth exist
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Planned Tests
- Backend: targeted review-state transition coverage once unblocked for import-driven transitions and reimport reset semantics.
- Frontend: none.
- Manual: none.

### Implementation Steps
- Link canonical import contract and API task output before changing review-state writes.
- Add targeted backend coverage for import-driven review-state transitions and reimport reset semantics.
- Implement only import-write behavior needed to trigger existing derivation machinery honestly.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
### Execution Notes
No review-state transition work started.

### Blockers
Blocked pending TASK-7.
<!-- SECTION:NOTES:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Canonical contract and API prerequisites are linked before implementation begins
- [ ] #2 Import writes reuse the existing derivation groundwork instead of rebuilding it
- [ ] #3 Relevant targeted verification is recorded honestly once the task unblocks
- [ ] #4 Related import and review-state notes are updated if shipped behavior or contracts change
<!-- DOD:END -->

## Final Summary

<!-- SECTION:SUMMARY:BEGIN -->
Not done yet.
<!-- SECTION:SUMMARY:END -->
