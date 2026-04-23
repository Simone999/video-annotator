---
title: Review m-4 parity and drift
type: note
permalink: video-annotator/tasks/review-m-4-parity-and-drift
id: task-review-m-4-parity-and-drift
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
- backend
- frontend
- m-4
- ui
---

# Review m-4 parity and drift

## Creation Phase

### Description

Review full m-4 code, docs, memory routing, and UI after mask editing scope lands. Fix actionable drift in same task.

Read first:
- [[Workflow]]
- [[Mask Editing and Cleanup]]
- [[Spec and PRD roadmap parity audit 2026-04-22]]
- `docs/spec.md`
- `docs/product/prd.md`
- `docs/ui/video-review-1920x1080.png`
- `docs/ui/video-review.html`
- all linked m-4 task notes

Stage-2 rule: in planning phase, write concrete test plan and implementation plan first. In execution, follow written plan. Before `done`, run own review plus 2 subagent reviews and fix actionable findings.

### Scope

- In scope: final code review, docs or memory drift, stale links, and remaining 1920x1080 review-route mismatches after m-4 work
- Out of scope: new post-m-4 feature scope or redesigning current review-route shell

### Affected Features

- [[Mask Editing and Cleanup]]
- [[SAM2 Shell and Runtime]]
- [[Annotation Foundation and Manual Box Workflow]]

### Acceptance Criteria

- [ ] Run own review plus 2 subagent reviews and fix actionable findings before close
- [ ] Feature notes, milestone notes, and task indexes match shipped m-4 truth
- [ ] Final m-4 review confirms shipped review route still matches `docs/ui/video-review-1920x1080.png`; `docs/ui/video-review.html` stays guide only
- [ ] Verification evidence records final m-4 backend, frontend, and browser status honestly

### Test Intent

- Backend: rerun targeted m-4 backend checks after review fixes
- Frontend: rerun targeted m-4 frontend checks after review fixes
- Manual: browser-check final mask editing and cleanup flows at 1920x1080 after review fixes land

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
