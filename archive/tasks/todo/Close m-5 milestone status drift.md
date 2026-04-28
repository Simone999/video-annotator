---
title: Close m-5 milestone status drift
type: note
permalink: video-annotator/tasks/close-m-5-milestone-status-drift
id: task-close-m-5-milestone-status-drift
status: todo
completed:
steps:
- creation
- planning
- execution
- wrap_up
tags:
- task
- review
- export
- m-5
- docs
- roadmap
---

# Close m-5 milestone status drift

## Creation Phase

### Description

Reconcile `m-5` milestone tracking with shipped export record, artifact, API, and UI work. Keep historical milestone ordering intact, but stop leaving export roadmap truth split between shipped code and stale `planned` tracking.

Read first:
- [[Workflow]]
- [[Implementation audit and roadmap 2026-04-28]]
- [[m-5: Export Workflow and Exported State]]
- [[Export]]
- [[Wire export UI and exported state]]
- [[Add export API and client]]
- [[Build native JSON exporter]]
- [[Build mask and boxes-only export]]
- [[Persist export records]]

Stage-2 rule: in planning phase, write concrete test plan and implementation plan first. In execution, follow written plan. Before `done`, run own review plus 2 subagent reviews and fix actionable findings.

### Scope

- In scope: `m-5` milestone status, checklist, related-task routing, and honest note of any follow-on work that actually belongs under `m-7`
- Out of scope: new export formats or post-export workflow changes

### Affected Features

- [[Export]]
- [[Video Ingest and Exact-Frame Review]]

### Acceptance Criteria

- [ ] `m-5` milestone status and checklist match shipped export create, download, artifact, and exported-state truth
- [ ] Remaining release-hardening work stays routed under `m-7` instead of keeping export milestone falsely open
- [ ] Related milestone and task routing no longer describes export as planned when shipped code and durable notes say otherwise

### Test Intent

- Backend: none unless milestone audit uncovers export-behavior drift that needs proof
- Frontend: none unless milestone audit uncovers export-UI drift that needs proof
- Manual: none

### Definition of Done

- [ ] Planning phase records concrete tests and implementation plan before code
- [ ] Own review plus 2 subagent reviews are recorded and actionable findings are fixed
- [ ] Relevant tests and quality checks pass
- [ ] Feature notes, task note, and routing indexes are updated honestly when truth changes

## Planning Phase

### Planned Integration Tests

### Planned E2E Tests

### Planned Implementation

### Feature Matrix Updates

## Execution Phase

### Implementation Notes

## Wrap-Up Phase

### Verification

- Commands run:
- Results:

### Final Summary

### Completion Gate

- [ ] Acceptance Criteria checkboxes updated to match reality
- [ ] Definition of Done checkboxes updated to match reality
- [ ] Only now may `status` change to `done`
