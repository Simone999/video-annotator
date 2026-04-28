---
id: TASK-2
title: Close m-4 milestone status drift
status: To Do
assignee: []
created_date: '2026-04-28 17:37'
updated_date: '2026-04-28 17:42'
labels:
  - review
  - masks
  - m-4
  - docs
  - roadmap
milestone: m-0
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Reconcile `m-4` milestone tracking with shipped refine, cleanup, and whole-track delete work. Keep historical sequence intact, but stop leaving `m-4` in misleading `in_progress` state if later task history and feature truth already close the milestone.

Scope:
- In scope: `m-4` milestone status, checklist, related-task routing, and honest note of any work intentionally rolled into `m-7`
- Out of scope: new mask-editing behavior or release-hardening work

Affected features:
- [[Mask Editing and Cleanup]]
- [[SAM2 Shell and Runtime]]
- [[Annotation Foundation and Manual Box Workflow]]

Historical context:
- Archived from a todo snapshot with archive status `todo`.
<!-- SECTION:DESCRIPTION:END -->

## References

<!-- SECTION:REFERENCES:BEGIN -->
- [[Workflow]]
- [[Implementation audit and roadmap 2026-04-28]]
- [[m-4: Mask Editing and Cleanup]]
- [[Mask Editing and Cleanup]]
- [[SAM2 Shell and Runtime]]
- [[Add object-track delete and summary reset]]
- [[Review m-4 cleanup checkpoint]]
- `archive/tasks/done/Implement refine-mask backend.md`
- `archive/tasks/done/Add frame-local mask cleanup.md`
- `archive/tasks/done/Add whole-object mask cleanup.md`
- `archive/tasks/todo/Close m-4 milestone status drift.md`
<!-- SECTION:REFERENCES:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 `m-4` milestone status and checklist match shipped refine, cleanup, and object-delete truth
- [ ] #2 Any remaining work that truly belongs to `m-7` is named explicitly instead of implied through stale unchecked boxes
- [ ] #3 Related milestone and task routing no longer suggests m-4 implementation is still open when only archive cleanup remained
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Planned Tests
- Backend: none unless audit uncovers backend-behavior drift that needs proof.
- Frontend: none unless audit uncovers frontend-behavior drift that needs proof.
- Manual: reread updated milestone and linked task routing for consistency.

### Implementation Steps
- Review live `m-0` milestone text against shipped refine, cleanup, and whole-track delete work.
- Update milestone and task routing so leftover release-hardening work moves to `m-7` only when evidence supports it.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
### Execution Notes
No execution notes yet.
<!-- SECTION:NOTES:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 `m-4` milestone wording, checklist, and routing reflect shipped work and explicit follow-on scope
- [ ] #2 Any work moved to `m-7` is named directly instead of implied by stale milestone state
- [ ] #3 Any verification or review findings are recorded honestly in Implementation Notes
- [ ] #4 Related milestone, task, and feature-note links touched by the audit stay consistent
<!-- DOD:END -->

## Final Summary

<!-- SECTION:SUMMARY:BEGIN -->
Not done yet.
<!-- SECTION:SUMMARY:END -->
