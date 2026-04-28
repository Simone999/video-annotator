---
id: TASK-5
title: Define current-pipeline import contract
status: To Do
assignee: []
created_date: '2026-04-28 17:37'
updated_date: '2026-04-28 17:42'
labels:
  - blocked
  - import
  - m-6
  - contract
milestone: m-2
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Resolve current-pipeline import contract from real source material before any importer code lands. This task owns both field mapping truth and reimport overwrite or reset semantics against existing review data. Search repo and memory first. If contract still missing, ask user and record answer in durable memory instead of guessing.

Scope:
- In scope: field mapping truth, source examples, import payload shape, overwrite or reset rules for reimport, explicit unresolved fields, and durable memory or spec update for importer work
- Out of scope: importer code, API routes, or UI before contract truth exists

Affected features:
- [[Import Existing Boxes]]

Prerequisites:
- Search repo and memory first for current-pipeline samples, mapping notes, and contract material.
- Ask the user only if source material still leaves contract truth unresolved.

Historical context:
- Archived from a blocked snapshot with archive status `blocked`.
<!-- SECTION:DESCRIPTION:END -->

## References

<!-- SECTION:REFERENCES:BEGIN -->
- [[Workflow]]
- [[Import Existing Boxes]]
- [[Import Contract]]
- [[Product Requirements]]
- [[Frontend Interaction Spec]]
- `archive/tasks/blocked/Define current-pipeline import contract.md`
<!-- SECTION:REFERENCES:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Real current-pipeline field mapping and reimport overwrite or reset semantics are written down in durable memory or spec, or exact external blocker is recorded without guesses
- [ ] #2 Task records what source material was searched before any user question
- [ ] #3 Later import tasks can point to one canonical contract note instead of chat context
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Planned Tests
- Integration/E2E: define future importer flow tests only after mapping truth exists.
- Backend: define future importer tests only after mapping truth exists.
- Frontend: none.
- Manual: cross-check contract note against source examples and linked references.

### Implementation Steps
- Gather current-pipeline examples and existing notes before any user question or code work.
- Write or update one canonical contract note with field mapping, payload shape, and reimport overwrite or reset semantics.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
### Execution Notes
No execution notes yet.

### Blockers
Blocked until real contract truth or an explicit external blocker is recorded.
<!-- SECTION:NOTES:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 One canonical contract note or spec exists and later import tasks can link to it directly
- [ ] #2 Searched sources and any unresolved external blocker are recorded explicitly
- [ ] #3 Any verification or follow-up questions are recorded honestly in Implementation Notes
- [ ] #4 Related import notes and tasks touched by the contract stay aligned
<!-- DOD:END -->

## Final Summary

<!-- SECTION:SUMMARY:BEGIN -->
Not done yet.
<!-- SECTION:SUMMARY:END -->
