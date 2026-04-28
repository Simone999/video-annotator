---
title: Review m-7 hardening checkpoint
type: note
permalink: video-annotator/tasks/review-m-7-hardening-checkpoint
id: task-review-m-7-hardening-checkpoint
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
- docker
- m-7
- docs
---

# Review m-7 hardening checkpoint

## Creation Phase

### Description

Review first five m-7 tasks before release verification starts. Fix actionable drift in same task.

Read first:
- [[Workflow]]
- [[Spec and PRD roadmap parity audit 2026-04-22]]
- [[Stabilize frontend Vitest media environment and clean per-test teardown]]
- `basic-memory/tests/e2e-tests.md`
- all linked m-7 task notes through Docker commands

Stage-2 rule: in planning phase, write concrete test plan and implementation plan first. In execution, follow written plan. Before `done`, run own review plus 2 subagent reviews and fix actionable findings.

### Scope

- In scope: code review, docs or memory drift, stale links, and Docker workflow mismatches after first hardening slice
- In scope: confirm shared frontend test environment stays clean before release verification starts
- Out of scope: new scope beyond checkpoint fixes

### Affected Features

- [[Video Ingest and Exact-Frame Review]]

### Acceptance Criteria

- [ ] Run own review plus 2 subagent reviews and fix actionable findings before release verification task starts
- [ ] Task, feature, and milestone routing matches current Docker E2E truth after fixes
- [ ] Hardening docs and command surface stay free of stale references after review

### Test Intent

- Backend: rerun targeted Docker/backend checks touched by review fixes
- Frontend: rerun targeted frontend/Playwright checks touched by review fixes
- Manual: run one Docker E2E smoke after review fixes if workflow changed

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
