---
title: Support Playwright Docker mode
type: note
permalink: video-annotator/tasks/support-playwright-docker-mode
id: task-support-playwright-docker-mode
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
- playwright
---

# Support Playwright Docker mode

## Creation Phase

### Description

Teach Playwright harness to run against Docker network targets without breaking host-run E2E flow.

Read first:
- [[Workflow]]
- `basic-memory/tests/e2e-tests.md`
- `frontend/tests/e2e/routes.spec.ts`
- `frontend/tests/e2e/review-navigation.spec.ts`
- `tests/e2e/playwright.config.ts`
- `tests/e2e/global.setup.ts`

Stage-2 rule: in planning phase, write concrete test plan and implementation plan first. In execution, follow written plan. Before `done`, run own review plus 2 subagent reviews and fix actionable findings.

### Scope

- In scope: Docker run mode, container base URL, and no-op or wait-only global setup for Docker mode
- Out of scope: compose file or package scripts beyond what config needs

### Affected Features

- [[Video Ingest and Exact-Frame Review]]

### Acceptance Criteria

- [ ] Playwright config supports Docker mode with frontend container base URL
- [ ] Docker mode avoids host-only webServer bootstrap and duplicate migrate/seed work
- [ ] Existing host-run E2E still works after Docker support lands

### Test Intent

- Backend: none
- Frontend: Playwright config or harness tests plus one Docker-targeted spec smoke
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
