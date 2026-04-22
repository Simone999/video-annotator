---
title: Run release verification workflow
type: note
permalink: video-annotator/tasks/run-release-verification-workflow
id: task-run-release-verification-workflow
status: todo
completed:
steps:
- creation
- planning
- execution
- wrap_up
tags:
- task
- tests
- release
- m-7
- verification
---

# Run release verification workflow

## Creation Phase

### Description

Run release verification matrix across actionable v1 flows and record any still-blocked scope honestly.

Read first:
- [[Workflow]]
- [[Spec and PRD roadmap parity audit 2026-04-22]]
- [[Video Ingest and Exact-Frame Review]]
- [[SAM2 Shell and Runtime]]
- [[Mask Editing and Cleanup]]
- [[Export]]
- `basic-memory/tests/e2e-tests.md`

Stage-2 rule: in planning phase, write concrete test plan and implementation plan first. In execution, follow written plan. Before `done`, run own review plus 2 subagent reviews and fix actionable findings.

### Scope

- In scope: cross-feature verification for review, SAM2, cleanup, export, and Docker E2E workflow, plus honest note of still-blocked import scope
- Out of scope: new feature implementation beyond fixes required to make verification trustworthy

### Affected Features

- [[Video Ingest and Exact-Frame Review]]
- [[SAM2 Shell and Runtime]]
- [[Mask Editing and Cleanup]]
- [[Export]]

### Acceptance Criteria

- [ ] Release verification matrix covers all actionable v1 flows with fresh evidence
- [ ] Still-blocked import scope is called out honestly instead of treated as passed
- [ ] Any actionable verification drift found in scope is fixed or routed before close

### Test Intent

- Backend: run milestone-spanning backend checks required by verification matrix
- Frontend: run milestone-spanning frontend and browser checks required by verification matrix
- Manual: run final browser or Docker-smoke proof required by release matrix

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
