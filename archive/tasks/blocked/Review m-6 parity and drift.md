---
title: Review m-6 parity and drift
type: note
permalink: video-annotator/tasks/review-m-6-parity-and-drift
id: task-review-m-6-parity-and-drift
status: blocked
completed:
steps:
- creation
- planning
- execution
- wrap_up
tags:
- task
- blocked
- review
- import
- m-6
- docs
---

# Review m-6 parity and drift

## Creation Phase

### Description

Review m-6 code, docs, memory routing, and UI after import work lands. Until then, this task stays blocked with milestone. Fix actionable drift in same task when unblocked.

Read first:
- [[Workflow]]
- [[Import Existing Boxes]]
- [[Spec and PRD roadmap parity audit 2026-04-22]]
- all linked m-6 task notes

Stage-2 rule: in planning phase, write concrete test plan and implementation plan first. In execution, follow written plan. Before `done`, run own review plus 2 subagent reviews and fix actionable findings.

### Scope

- In scope: final import review, docs or memory drift, stale links, and UI mismatches after import work
- Out of scope: new post-m-6 feature scope

### Affected Features

- [[Import Existing Boxes]]
- [[Video Ingest and Exact-Frame Review]]

### Acceptance Criteria

- [ ] Run own review plus 2 subagent reviews and fix actionable findings before close
- [ ] Feature notes, milestone notes, and task indexes match shipped m-6 truth
- [ ] Blocked state stays honest until contract and implementation tasks really land

### Test Intent

- Backend: rerun targeted m-6 backend checks after review fixes once unblocked
- Frontend: rerun targeted m-6 frontend checks after review fixes once unblocked
- Manual: browser-check import UX once unblocked

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
