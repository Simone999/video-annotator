---
id: TASK-3
title: Close m-5 milestone status drift
status: To Do
assignee: []
created_date: '2026-04-28 17:37'
updated_date: '2026-04-28 17:42'
labels:
  - review
  - export
  - m-5
  - docs
  - roadmap
milestone: m-1
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Reconcile `m-5` milestone tracking with shipped export record, artifact, API, and UI work. Keep historical milestone ordering intact, but stop leaving export roadmap truth split between shipped code and stale `planned` tracking.

Scope:
- In scope: `m-5` milestone status, checklist, related-task routing, and honest note of any follow-on work that actually belongs under `m-7`
- Out of scope: new export formats or post-export workflow changes

Affected features:
- [[Export]]
- [[Video Ingest and Exact-Frame Review]]

Historical context:
- Archived from a todo snapshot with archive status `todo`.
<!-- SECTION:DESCRIPTION:END -->

## References

<!-- SECTION:REFERENCES:BEGIN -->
- [[Workflow]]
- [[Implementation audit and roadmap 2026-04-28]]
- [[m-5: Export Workflow and Exported State]]
- [[Export]]
- [[Wire export UI and exported state]]
- [[Add export API and client]]
- [[Build native JSON exporter]]
- [[Build mask and boxes-only export]]
- [[Persist export records]]
- `archive/tasks/todo/Close m-5 milestone status drift.md`
<!-- SECTION:REFERENCES:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 `m-5` milestone status and checklist match shipped export create, download, artifact, and exported-state truth
- [ ] #2 Remaining release-hardening work stays routed under `m-7` instead of keeping export milestone falsely open
- [ ] #3 Related milestone and task routing no longer describes export as planned when shipped code and durable notes say otherwise
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Planned Tests
- Backend: none unless audit uncovers export-behavior drift that needs proof.
- Frontend: none unless audit uncovers export-UI drift that needs proof.
- Manual: reread updated milestone and linked task routing for consistency.

### Implementation Steps
- Review live `m-1` milestone text against shipped export record, artifact, API, and UI work.
- Update milestone and task routing so only true release-hardening follow-on work remains under `m-7`.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
### Execution Notes
No execution notes yet.
<!-- SECTION:NOTES:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 `m-5` milestone wording, checklist, and routing reflect shipped export work and explicit follow-on scope
- [ ] #2 Any work left under `m-7` is named directly instead of implied by stale milestone state
- [ ] #3 Any verification or review findings are recorded honestly in Implementation Notes
- [ ] #4 Related milestone, task, and feature-note links touched by the audit stay consistent
<!-- DOD:END -->

## Final Summary

<!-- SECTION:SUMMARY:BEGIN -->
Not done yet.
<!-- SECTION:SUMMARY:END -->
