---
id: TASK-6
title: Implement importer translation service
status: To Do
assignee: []
created_date: '2026-04-28 17:37'
updated_date: '2026-04-28 17:42'
labels:
  - blocked
  - backend
  - import
  - m-6
milestone: m-2
dependencies:
  - TASK-5
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implement deterministic importer translation from current-pipeline records into ObjectTrack and FrameAnnotation primitives. Blocked until `[[Define current-pipeline import contract]]` lands real mapping truth.

Scope:
- In scope: translation service only, with deterministic object/frame mapping from canonical import contract
- Out of scope: API route, UI, or guessed field semantics

Affected features:
- [[Import Existing Boxes]]
- [[Annotation Foundation and Manual Box Workflow]]

Prerequisites:
- `[[Define current-pipeline import contract]]` must land canonical mapping truth before translation work starts.

Historical context:
- Archived from a blocked snapshot with archive status `blocked`.
<!-- SECTION:DESCRIPTION:END -->

## References

<!-- SECTION:REFERENCES:BEGIN -->
- [[Workflow]]
- [[Import Existing Boxes]]
- [[Import Contract]]
- [[Annotation Foundation and Manual Box Workflow]]
- `backend/app/services/object_tracks.py`
- `backend/app/services/manual_frame_annotations.py`
- `archive/tasks/blocked/Implement importer translation service.md`
<!-- SECTION:REFERENCES:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Importer service translates mapped source fields into stable object and frame annotation primitives
- [ ] #2 Translation is deterministic for repeated identical input
- [ ] #3 Task stays blocked until contract note exists and is linked in planning
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Planned Tests
- Backend: targeted importer translation coverage once unblocked for deterministic object and frame translation.
- Frontend: none.
- Manual: none.

### Implementation Steps
- Link canonical import contract before writing translation code.
- Add targeted backend coverage for deterministic object and frame translation.
- Implement only translation-service changes needed to map source records into object and frame primitives.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
### Execution Notes
No translation work started.

### Blockers
Blocked pending TASK-5.
<!-- SECTION:NOTES:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 The canonical contract link is present before implementation begins
- [ ] #2 Translation logic lives in the dedicated service without duplicating API or UI behavior
- [ ] #3 Relevant targeted verification is recorded honestly once the task unblocks
- [ ] #4 Related import and annotation notes are updated if shipped behavior or contracts change
<!-- DOD:END -->

## Final Summary

<!-- SECTION:SUMMARY:BEGIN -->
Not done yet.
<!-- SECTION:SUMMARY:END -->
