---
title: Review m-3 runtime parity
type: note
permalink: video-annotator/tasks/review-m-3-runtime-parity
id: task-review-m-3-runtime-parity
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
- m-3
- sam2
---

# Review m-3 runtime parity

## Creation Phase

### Description

Review m-3 runtime code, docs, routing notes, and UI states after real SAM2 work. Fix actionable drift in same task.

Read first:
- [[Workflow]]
- [[Spec and PRD roadmap parity audit 2026-04-22]]
- [[SAM2 Shell and Runtime]]
- [[API]]
- [[Data Model]]
- `docs/spec.md`
- all linked m-3 task notes

Stage-2 rule: in planning phase, write concrete test plan and implementation plan first. In execution, follow written plan. Before `done`, run own review plus 2 subagent reviews and fix actionable findings.

### Scope

- In scope: code review, docs and memory drift, stale task links, and runtime/UI mismatches found after m-3 work
- Out of scope: new post-m-3 feature scope

### Affected Features

- [[SAM2 Shell and Runtime]]

### Acceptance Criteria

- [ ] Run own review plus 2 subagent reviews and fix actionable findings before close
- [ ] Feature notes, milestone notes, and task indexes match shipped m-3 runtime truth
- [ ] Runtime and UI verification evidence is recorded honestly, including any environment blocker

### Test Intent

- Backend: rerun targeted m-3 backend checks after review fixes
- Frontend: rerun targeted m-3 frontend checks after review fixes
- Manual: browser-check real runtime states if environment allows; otherwise record blocker honestly

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
