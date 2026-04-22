---
title: Review m-5 parity and drift
type: note
permalink: video-annotator/tasks/review-m-5-parity-and-drift
id: task-review-m-5-parity-and-drift
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
- export
- m-5
---

# Review m-5 parity and drift

## Creation Phase

### Description

Review m-5 code, docs, memory routing, and UI after export work lands. Fix actionable drift in same task.

Read first:
- [[Workflow]]
- [[Export]]
- [[Spec and PRD roadmap parity audit 2026-04-22]]
- `docs/spec.md`
- `docs/product/prd.md`
- `docs/ui/video-library.png`
- all linked m-5 task notes

Stage-2 rule: in planning phase, write concrete test plan and implementation plan first. In execution, follow written plan. Before `done`, run own review plus 2 subagent reviews and fix actionable findings.

### Scope

- In scope: code review, docs or memory drift, stale links, and UI mismatches after export scope lands
- Out of scope: new post-m-5 feature scope

### Affected Features

- [[Export]]
- [[Video Ingest and Exact-Frame Review]]

### Acceptance Criteria

- [ ] Run own review plus 2 subagent reviews and fix actionable findings before close
- [ ] Feature notes, milestone notes, and task indexes match shipped m-5 truth
- [ ] Verification evidence records export routes, artifact generation, and UI state honestly

### Test Intent

- Backend: rerun targeted m-5 backend checks after review fixes
- Frontend: rerun targeted m-5 frontend checks after review fixes
- Manual: browser-check export UI and library state after review fixes land

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
