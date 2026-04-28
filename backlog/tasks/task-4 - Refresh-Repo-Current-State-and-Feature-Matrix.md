---
id: TASK-4
title: Refresh Repo Current State and Feature Matrix
status: To Do
assignee: []
created_date: '2026-04-28 17:37'
updated_date: '2026-04-28 17:42'
labels:
  - review
  - docs
  - roadmap
  - status
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Refresh archive status router note so it matches current shipped feature truth and current open gaps. This task exists because the current matrix still says mask editing is partial and export is missing, which now conflicts with code, tests, and durable feature notes.

Scope:
- In scope: refresh status matrix, routing summary, and current-gap wording in archive overview note
- Out of scope: rewriting historical dated audits as if they were current snapshots

Affected features:
- [[Video Ingest and Exact-Frame Review]]
- [[SAM2 Shell and Runtime]]
- [[Mask Editing and Cleanup]]
- [[Export]]
- [[Import Existing Boxes]]

Historical context:
- Archived from a todo snapshot with archive status `todo`.
<!-- SECTION:DESCRIPTION:END -->

## References

<!-- SECTION:REFERENCES:BEGIN -->
- [[Workflow]]
- [[Implementation audit and roadmap 2026-04-28]]
- [[Repo Current State and Feature Matrix]]
- [[Video Ingest and Exact-Frame Review]]
- [[Annotation Foundation and Manual Box Workflow]]
- [[SAM2 Shell and Runtime]]
- [[Mask Editing and Cleanup]]
- [[Export]]
- [[Import Existing Boxes]]
- `archive/tasks/todo/Refresh Repo Current State and Feature Matrix.md`
<!-- SECTION:REFERENCES:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Status matrix reflects shipped review, SAM2, refine, cleanup, and export truth
- [ ] #2 Current open gaps reduce to release hardening plus blocked import, unless fresh repo evidence proves otherwise
- [ ] #3 Router note clearly points readers to durable feature notes for canonical truth instead of competing with them
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Planned Tests
- Backend: none.
- Frontend: none.
- Manual: reread refreshed matrix and its canonical routing links.

### Implementation Steps
- Compare current matrix and router summary against shipped feature notes and latest audit.
- Update archive overview note so it routes readers to durable feature truth instead of competing with it.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
### Execution Notes
No execution notes yet.
<!-- SECTION:NOTES:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 The current-state matrix and summary match shipped feature truth or call out any verified gap explicitly
- [ ] #2 Router wording points readers to durable feature notes for canonical truth
- [ ] #3 Any verification or review findings are recorded honestly in Implementation Notes
- [ ] #4 Related routing notes touched by the refresh stay consistent
<!-- DOD:END -->

## Final Summary

<!-- SECTION:SUMMARY:BEGIN -->
Not done yet.
<!-- SECTION:SUMMARY:END -->
