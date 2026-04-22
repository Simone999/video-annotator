---
title: Containerize backend E2E bootstrap
type: note
permalink: video-annotator/tasks/containerize-backend-e2e-bootstrap
id: task-containerize-backend-e2e-bootstrap
status: todo
completed:
steps:
- creation
- planning
- execution
- wrap_up
tags:
- task
- backend
- tests
- docker
- m-7
- e2e
---

# Containerize backend E2E bootstrap

## Creation Phase

### Description

Containerize backend E2E bootstrap with migrated SQLite storage, seed flow, and runtime image contract.

Read first:
- [[Workflow]]
- [[Video Ingest and Exact-Frame Review]]
- `basic-memory/tests/e2e-tests.md`
- `package.json`
- `backend/scripts/seed_e2e.py`
- `backend/alembic/`
- `backend/pyproject.toml`

Stage-2 rule: in planning phase, write concrete test plan and implementation plan first. In execution, follow written plan. Before `done`, run own review plus 2 subagent reviews and fix actionable findings.

### Scope

- In scope: backend Dockerfile or bootstrap image, Alembic run, seed flow, shared E2E storage paths, and backend runtime contract
- Out of scope: frontend container or Playwright Docker mode

### Affected Features

- [[Video Ingest and Exact-Frame Review]]

### Acceptance Criteria

- [ ] Backend Docker E2E image can run migrations and seed against shared SQLite storage
- [ ] Backend runtime starts on `0.0.0.0:8000` without reload for Docker E2E use
- [ ] Tests or contract checks prove migrated storage path and seed flow stay explicit

### Test Intent

- Backend: targeted Docker build or runtime smoke plus backend contract checks
- Frontend: none
- Manual: none in this slice

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
