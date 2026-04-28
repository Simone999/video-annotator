---
id: TASK-1
title: Add supersession routing for historical roadmap audits
status: To Do
assignee: []
created_date: '2026-04-28 17:37'
updated_date: '2026-04-28 17:42'
labels:
  - review
  - docs
  - roadmap
  - archive
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Preserve old roadmap audits as dated history, but add explicit routing so readers reach current audit truth without confusing old snapshots for live status. Do not erase history; make age and supersession obvious.

Scope:
- In scope: supersession copy, routing links, and archive-note positioning for dated roadmap audits
- Out of scope: rewriting old dated findings so they pretend to be current

Affected features:
- [[Video Ingest and Exact-Frame Review]]
- [[SAM2 Shell and Runtime]]
- [[Mask Editing and Cleanup]]
- [[Export]]
- [[Import Existing Boxes]]

Historical context:
- Archived from a todo snapshot rather than a live Backlog task.
<!-- SECTION:DESCRIPTION:END -->

## References

<!-- SECTION:REFERENCES:BEGIN -->
- [[Workflow]]
- [[Implementation audit and roadmap 2026-04-28]]
- [[Spec and PRD roadmap parity audit 2026-04-22]]
- [[Repo Current State and Feature Matrix]]
- [[Notes Index]]
- `archive/tasks/todo/Add supersession routing for historical roadmap audits.md`
<!-- SECTION:REFERENCES:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Historical roadmap audits read clearly as dated snapshots, not current repo status
- [ ] #2 Readers can reach latest audit truth from older audit notes without hunting through chat or git history
- [ ] #3 Archive routing preserves historical context while reducing status confusion
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Planned Tests
- Backend: none.
- Frontend: none.
- Manual: reread updated archive routing path and current-audit links.

### Implementation Steps
- Review current routing between dated archive audits and latest audit truth before editing copy.
- Update supersession links and archive-note positioning without rewriting historical findings.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
### Execution Notes
No execution notes yet.
<!-- SECTION:NOTES:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Archived audit notes point to current audit truth without pretending to be current themselves
- [ ] #2 Current routing and index notes touched by this task are updated together
- [ ] #3 Any manual verification or review findings are recorded honestly in Implementation Notes
- [ ] #4 Final wrap-up makes the supersession path explicit for future audit readers
<!-- DOD:END -->

## Final Summary

<!-- SECTION:SUMMARY:BEGIN -->
Not done yet.
<!-- SECTION:SUMMARY:END -->
