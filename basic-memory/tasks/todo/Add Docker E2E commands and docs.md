---
title: Add Docker E2E commands and docs
type: note
permalink: video-annotator/tasks/add-docker-e2e-commands-and-docs
id: task-add-docker-e2e-commands-and-docs
status: todo
completed:
steps:
- creation
- planning
- execution
- wrap_up
tags:
- task
- frontend
- backend
- tests
- docker
- m-7
- docs
---

# Add Docker E2E commands and docs

## Creation Phase

### Description

Add repo command surface and docs for Docker E2E orchestration.

Read first:
- [[Workflow]]
- `basic-memory/tests/e2e-tests.md`
- `package.json`
- `docs/runbooks/dev-setup.md`
- existing Docker E2E task notes once created

Stage-2 rule: in planning phase, write concrete test plan and implementation plan first. In execution, follow written plan. Before `done`, run own review plus 2 subagent reviews and fix actionable findings.

### Scope

- In scope: package scripts, orchestration wrapper, and durable docs for Docker E2E entrypoints
- Out of scope: new product behavior outside test tooling

### Affected Features

- [[Video Ingest and Exact-Frame Review]]

### Acceptance Criteria

- [ ] Repo has clear Docker E2E command surface for build, up, test, down, and full run
- [ ] Docs explain Docker E2E flow and cleanup without chat-only knowledge
- [ ] Command wrapper preserves teardown on failure

### Test Intent

- Backend: none
- Frontend: none
- Manual: run one documented Docker E2E command flow after scripts land

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
