---
title: Containerize frontend E2E app
type: note
permalink: video-annotator/tasks/containerize-frontend-e2e-app
id: task-containerize-frontend-e2e-app
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
- tests
- docker
- m-7
- e2e
---

# Containerize frontend E2E app

## Creation Phase

### Description

Containerize frontend E2E app with Docker-safe API base URL and stable Vite E2E runtime contract.

Read first:
- [[Workflow]]
- [[Video Ingest and Exact-Frame Review]]
- `basic-memory/tests/e2e-tests.md`
- `frontend/package.json`
- `frontend/vite.config.ts`
- `frontend/.env.e2e`

Stage-2 rule: in planning phase, write concrete test plan and implementation plan first. In execution, follow written plan. Before `done`, run own review plus 2 subagent reviews and fix actionable findings.

### Scope

- In scope: frontend Dockerfile or image contract, Docker-safe API base URL, and `0.0.0.0:3000` runtime
- Out of scope: compose stack or Playwright Docker mode

### Affected Features

- [[Video Ingest and Exact-Frame Review]]

### Acceptance Criteria

- [ ] Frontend Docker E2E image serves Vite E2E app on `0.0.0.0:3000`
- [ ] Docker E2E frontend uses backend container base URL without breaking host `.env.e2e` flow
- [ ] Tests or contract checks prove Docker image env handling

### Test Intent

- Backend: none unless Docker browser traffic needs backend CORS update
- Frontend: targeted Docker build or runtime smoke plus contract tests for env handling
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
