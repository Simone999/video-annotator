---
title: Close m-4 milestone status drift
type: note
permalink: video-annotator/tasks/close-m-4-milestone-status-drift
id: task-close-m-4-milestone-status-drift
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
- masks
- m-4
- docs
- roadmap
---

# Close m-4 milestone status drift

## Creation Phase

### Description

Reconcile `m-4` milestone tracking with shipped refine, cleanup, and whole-track delete work. Keep historical sequence intact, but stop leaving `m-4` in misleading `in_progress` state if later task history and feature truth already close the milestone.

Read first:
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

Stage-2 rule: in planning phase, write concrete test plan and implementation plan first. In execution, follow written plan. Before `done`, run own review plus 2 subagent reviews and fix actionable findings.

### Scope

- In scope: `m-4` milestone status, checklist, related-task routing, and honest note of any work intentionally rolled into `m-7`
- Out of scope: new mask-editing behavior or release-hardening work

### Affected Features

- [[Mask Editing and Cleanup]]
- [[SAM2 Shell and Runtime]]
- [[Annotation Foundation and Manual Box Workflow]]

### Acceptance Criteria

- [ ] `m-4` milestone status and checklist match shipped refine, cleanup, and object-delete truth
- [ ] Any remaining work that truly belongs to `m-7` is named explicitly instead of implied through stale unchecked boxes
- [ ] Related milestone and task routing no longer suggests m-4 implementation is still open when only archive cleanup remained

### Test Intent

- Backend: none unless milestone audit uncovers backend-behavior drift that needs proof
- Frontend: none unless milestone audit uncovers frontend-behavior drift that needs proof
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
