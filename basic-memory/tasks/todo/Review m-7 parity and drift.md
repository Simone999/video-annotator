---
title: Review m-7 parity and drift
type: note
permalink: video-annotator/tasks/review-m-7-parity-and-drift
id: task-review-m-7-parity-and-drift
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
- tests
- release
- m-7
- docs
---

# Review m-7 parity and drift

## Creation Phase

### Description

Review full m-7 code, docs, memory routing, and UI after hardening plus release verification land. Fix actionable drift in same task.

Read first:
- [[Workflow]]
- [[Spec and PRD roadmap parity audit 2026-04-22]]
- `basic-memory/tests/e2e-tests.md`
- all linked m-7 task notes

Stage-2 rule: in planning phase, write concrete test plan and implementation plan first. In execution, follow written plan. Before `done`, run own review plus 2 subagent reviews and fix actionable findings.

### Scope

- In scope: final hardening review, docs or memory drift, stale links, and residual UI mismatches found after release verification
- Out of scope: new post-m-7 feature scope

### Affected Features

- [[Video Ingest and Exact-Frame Review]]
- [[SAM2 Shell and Runtime]]
- [[Mask Editing and Cleanup]]
- [[Export]]

### Acceptance Criteria

- [ ] Run own review plus 2 subagent reviews and fix actionable findings before close
- [ ] Feature notes, milestone notes, task indexes, and Ralph backlog match final hardening truth
- [ ] Verification evidence records final release-readiness status honestly, including any blocked import tail

### Test Intent

- Backend: rerun targeted final backend verification after review fixes
- Frontend: rerun targeted final frontend or browser verification after review fixes
- Manual: run final browser or Docker E2E smoke if review changes release path

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
