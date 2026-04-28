---
title: Support Playwright Docker mode
type: note
permalink: video-annotator/tasks/support-playwright-docker-mode
id: task-support-playwright-docker-mode
status: done
completed: 2026-04-28 16:23:00 CEST
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

- [x] Playwright config supports Docker mode with frontend container base URL
- [x] Docker mode avoids host-only webServer bootstrap and duplicate migrate/seed work
- [x] Existing host-run E2E still works after Docker support lands

### Test Intent

- Backend: none
- Frontend: Playwright config or harness tests plus one Docker-targeted spec smoke
- Manual: none in this slice

### Definition of Done

- [x] Planning phase records concrete tests and implementation plan before code
- [x] Own review plus 2 subagent reviews are recorded and actionable findings are fixed
- [x] Relevant tests and quality checks pass
- [x] Feature notes, task note, and routing indexes are updated honestly when truth changes

## Planning Phase

### Planned Integration Tests

- Backend tooling:
  - extend `backend/tests/unit/tooling/test_repo_test_commands.py` so repo command and Playwright config contract covers `PLAYWRIGHT_RUN_MODE`, docker-mode base URL, and docker-mode host-bootstrap skip
- Frontend tooling:
  - add one focused node or tooling test under `frontend/tests/unit/tooling/` only if backend tooling coverage cannot express `global.setup.ts` docker wait-only behavior cleanly

### Planned E2E Tests

- Host smoke:
  - `npm run test:e2e -- frontend/tests/e2e/routes.spec.ts`
- Docker smoke:
  - run same route spec through compose runner with `PLAYWRIGHT_RUN_MODE=docker`
- Stretch only if needed after green:
  - `frontend/tests/e2e/review-navigation.spec.ts` in docker mode once seed flow is stable

### Planned Implementation

- Step 1: move task to active state and write red test first for docker-mode Playwright contract
- Step 2: teach `tests/e2e/playwright.config.ts` to branch on `PLAYWRIGHT_RUN_MODE`, load `.env.docker-e2e` for docker mode, and drop host `webServer` bootstrap in docker mode
- Step 3: teach `tests/e2e/global.setup.ts` to skip reset or migrate or seed in docker mode and wait only for seeded backend truth
- Step 4: rerun red test to green, then run host route smoke and docker route smoke
- Step 5: run own review plus 2 subagent reviews, fix findings, then close task honestly

### Feature Matrix Updates

- none expected; this is test-harness behavior only

## Execution Phase

### Implementation Notes

- Wrote red tooling coverage first in `backend/tests/unit/tooling/test_repo_test_commands.py`, then taught `tests/e2e/playwright.config.ts` and `tests/e2e/global.setup.ts` to branch on `PLAYWRIGHT_RUN_MODE=docker`.
- Docker mode now reads `.env.docker-e2e`, targets `http://frontend:3000` and `http://backend:8000`, and skips host `webServer` bootstrap.
- Docker mode setup now waits for seeded backend truth instead of rerunning reset or migrate or seed inside Playwright.
- Host smoke failures turned out to be stale browser assertions, not harness breakage. Updated `frontend/tests/e2e/routes.spec.ts` and `frontend/tests/e2e/review-navigation.spec.ts` from old `Canonical frame` copy to current `Frame N` truth.
- One quality review finding stays as explicit caveat, not blocker: docker seeded review-navigation flow is still unproven because `frontend/tests/e2e/fixtures/review-navigation.ts` still hardcodes host `.env.e2e` seeding. Later hardening task should own that, not this slice.
- One external blocker also stays explicit: real docker browser smoke cannot run in this environment because local Docker API or socket access returns `500` image-inspect failures.

## Wrap-Up Phase

### Verification

- Commands run:
  - `uv run --project backend pytest backend/tests/unit/tooling/test_repo_test_commands.py -k test_dev_and_e2e_commands_keep_port_and_server_isolation`
  - `uv run --project backend pytest backend/tests/unit/tooling/test_repo_test_commands.py`
  - `env -u BACKEND_HOST -u BACKEND_PORT -u FRONTEND_HOST -u FRONTEND_PORT -u VITE_API_BASE_URL -u APP_DB_URL -u APP_MASKS_DIR -u PLAYWRIGHT_RUN_MODE npm run test:e2e -- frontend/tests/e2e/routes.spec.ts frontend/tests/e2e/review-navigation.spec.ts`
  - `env PLAYWRIGHT_RUN_MODE=docker npm run test:e2e -- --list frontend/tests/e2e/routes.spec.ts frontend/tests/e2e/review-navigation.spec.ts`
  - `docker compose -f docker-compose.e2e.yml --profile runner run --rm playwright npm run test:e2e -- frontend/tests/e2e/routes.spec.ts`
- Results:
  - red first: targeted backend tooling test failed on missing docker-mode Playwright contract
  - green after fix: targeted backend tooling test passed
  - full backend tooling contract file passed with `6 passed`
  - host routes and review-navigation browser smokes both passed under clean E2E env after stale `Canonical frame` assertions were updated
  - docker-mode Playwright config loaded and listed setup plus both browser specs without host bootstrap
  - real docker browser smoke stayed blocked by local Docker API error: image inspect returned `500 Internal Server Error` against `/var/run/docker.sock`
  - own review plus implementer subagent plus spec reviewer plus quality reviewer all ran; one stale-assertion issue and one caveat-overclaim issue were fixed or recorded honestly before close

### Final Summary

Playwright harness now supports baseline docker run mode without host bootstrap, and host browser E2E still works after the change. This task stops at harness support plus host proof. Real docker browser execution is still externally blocked in this environment, and seeded docker review-navigation flow stays for later hardening because its fixture still assumes host seeding.

### Completion Gate

- [x] Acceptance Criteria checkboxes updated to match reality
- [x] Definition of Done checkboxes updated to match reality
- [x] Only now may `status` change to `done`
