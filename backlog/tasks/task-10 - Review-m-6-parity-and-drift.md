---
id: TASK-10
title: Review m-6 parity and drift
status: To Do
assignee: []
created_date: '2026-04-28 17:37'
updated_date: '2026-04-28 17:42'
labels:
  - blocked
  - review
  - import
  - m-6
  - docs
milestone: m-2
dependencies:
  - TASK-5
  - TASK-6
  - TASK-7
  - TASK-8
  - TASK-9
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Review m-6 code, docs, memory routing, and UI after import work lands. Until then, this task stays blocked with milestone. Fix actionable drift in same task when unblocked.

Scope:
- In scope: final import review, docs or memory drift, stale links, and UI mismatches after import work
- Out of scope: new post-m-6 feature scope

Affected features:
- [[Import Existing Boxes]]
- [[Video Ingest and Exact-Frame Review]]

Prerequisites:
- Wait for TASK-5 through TASK-9 to land before closing the final parity review.

Historical context:
- Archived from a blocked snapshot with archive status `blocked`.
<!-- SECTION:DESCRIPTION:END -->

## References

<!-- SECTION:REFERENCES:BEGIN -->
- [[Workflow]]
- [[Import Existing Boxes]]
- [[Spec and PRD roadmap parity audit 2026-04-22]]
- all linked m-6 task notes
- `archive/tasks/blocked/Review m-6 parity and drift.md`
<!-- SECTION:REFERENCES:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Run own review plus 2 subagent reviews and fix actionable findings before close
- [ ] #2 Feature notes, milestone notes, and task indexes match shipped m-6 truth
- [ ] #3 Blocked state stays honest until contract, importer, API, review-state, and frontend-entry tasks really land
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Planned Tests
- Backend: rerun targeted m-6 backend checks after review fixes once unblocked.
- Frontend: rerun targeted m-6 frontend checks after review fixes once unblocked.
- Manual: browser-check import UX once unblocked.

### Implementation Steps
- Review shipped import code, docs, memory routing, and UI once upstream m-6 tasks land.
- Fix actionable drift in same task and leave any remaining follow-up explicit.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
### Execution Notes
No review findings yet.

### Blockers
Blocked pending TASK-5 through TASK-9.
<!-- SECTION:NOTES:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Review findings and any follow-up fixes are recorded in one place
- [ ] #2 Feature, milestone, and task routing touched by the review matches shipped m-6 truth
- [ ] #3 Any verification run after fixes is recorded honestly in Implementation Notes
- [ ] #4 Residual gaps remain explicit if import work is still blocked or incomplete
<!-- DOD:END -->

## Final Summary

<!-- SECTION:SUMMARY:BEGIN -->
Not done yet.
<!-- SECTION:SUMMARY:END -->
