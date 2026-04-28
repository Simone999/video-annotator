---
title: Add Docker E2E commands and docs
type: note
permalink: video-annotator/tasks/add-docker-e2e-commands-and-docs
id: task-add-docker-e2e-commands-and-docs
status: done
completed: 2026-04-28 17:06:00 CEST
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

- [x] Repo has clear Docker E2E command surface for build, up, test, down, and full run
- [x] Docs explain Docker E2E flow and cleanup without chat-only knowledge
- [x] Command wrapper preserves teardown on failure

### Test Intent

- Backend: none
- Frontend: none
- Manual: run one documented Docker E2E command flow after scripts land

### Definition of Done

- [x] Planning phase records concrete tests and implementation plan before code
- [x] Own review plus 2 subagent reviews are recorded and actionable findings are fixed
- [x] Relevant tests and quality checks pass
- [x] Feature notes, task note, and routing indexes are updated honestly when truth changes

## Planning Phase

### Planned Integration Tests

- Backend tooling:
  - extend `backend/tests/unit/tooling/test_docker_e2e_compose.py` for real runner command instead of placeholder text
  - extend `backend/tests/unit/tooling/test_repo_test_commands.py` for new root docker E2E scripts
- Frontend or E2E tooling:
  - add focused coverage only if needed for docker review-navigation fixture branch or seed-env contract

### Planned E2E Tests

- Docker route smoke:
  - full docker command surface runs `frontend/tests/e2e/routes.spec.ts`
- Docker seeded navigation smoke:
  - full docker command surface can also run `frontend/tests/e2e/review-navigation.spec.ts` by pre-seeding scenario outside the Playwright container
- Host regression:
  - rerun host `frontend/tests/e2e/routes.spec.ts frontend/tests/e2e/review-navigation.spec.ts` after fixture or tooling changes

### Planned Implementation

- Step 1: write red tooling tests first for new compose runner command and root npm docker E2E scripts
- Step 2: replace compose placeholder runner command with real npm E2E entry
- Step 3: add root docker E2E command surface for build, up, test, down, and full-run with teardown-on-failure
- Step 4: if needed, teach docker review-navigation flow to receive pre-seeded scenario data without calling host-only `uv` inside the Playwright image
- Step 5: update durable E2E testing note first, then supporting runbook docs
- Step 6: rerun tooling tests, host smoke, and docker command proof; record any external Docker blocker honestly

### Feature Matrix Updates

- none expected; this is test-tooling and archive-truth only

## Execution Phase

### Implementation Notes

- Wrote red contract tests first in `backend/tests/unit/tooling/test_docker_e2e_compose.py` and `backend/tests/unit/tooling/test_repo_test_commands.py`, then added real repo command surface in `package.json`.
- Replaced compose runner placeholder with real Playwright smoke command in `docker-compose.e2e.yml` and passed docker-mode scenario JSON through the runner environment.
- Added `scripts/docker-e2e.mjs` as the real orchestration wrapper.
  - `test` mode starts backend plus frontend, waits for readiness, seeds review-navigation through the backend container, then runs Playwright in docker mode.
  - `full` mode tears down old state first, builds `backend-init` plus `backend` plus `frontend`, runs the smoke subset, then tears down again.
- Quality review found a real failure-masking bug in `full` mode. Fixed it by preserving the primary build or run failure even when final cleanup also fails.
- Quality review found docker command truth drift. Fixed it by:
  - making docker runner use `test:e2e:strict` instead of the root `--pass-with-no-tests` script
  - making docker build surface include `backend-init`
  - adding host-dependency preflight with `npm ci` guidance
  - making docs say the default docker path is the committed browser smoke subset, not the whole browser suite
  - extending wrapper wait budget to 120s so it is not shorter than compose health timing
- Updated durable testing memory first in `basic-memory/tests/e2e-tests.md`, then supporting runbook copy in `docs/runbooks/dev-setup.md`.

## Wrap-Up Phase

### Verification

- Commands run:
- `uv run --project backend pytest backend/tests/unit/tooling/test_docker_e2e_compose.py -q`
- `uv run --project backend pytest backend/tests/unit/tooling/test_repo_test_commands.py -k test_dev_and_e2e_commands_keep_port_and_server_isolation -q`
- `uv run --project backend pytest backend/tests/unit/tooling/test_docker_e2e_compose.py backend/tests/unit/tooling/test_repo_test_commands.py -q`
- `npm --workspace frontend exec vitest run tests/unit/tooling/docker-e2e-wrapper.test.ts`
- `env -u BACKEND_HOST -u BACKEND_PORT -u FRONTEND_HOST -u FRONTEND_PORT -u VITE_API_BASE_URL -u APP_DB_URL -u APP_MASKS_DIR -u PLAYWRIGHT_RUN_MODE npm run test:e2e -- frontend/tests/e2e/routes.spec.ts frontend/tests/e2e/review-navigation.spec.ts`
- `docker compose -f docker-compose.e2e.yml config`
- `node scripts/docker-e2e.mjs test frontend/tests/e2e/routes.spec.ts frontend/tests/e2e/review-navigation.spec.ts`
- Results:
- red first: backend compose and repo-script contract tests failed on missing docker command surface, missing runner env, placeholder compose command, unescaped frontend healthcheck interpolation, missing strict docker runner path, and incomplete docker build surface
- green after fixes: backend tooling contract tests passed with `7 passed`
- green after fixes: targeted frontend wrapper unit test passed with `2 passed`
- host browser regression stayed green after docker-wrapper changes
- compose config rendered cleanly after escaping `$${port}` in frontend healthcheck
- real docker wrapper proof is still blocked in this environment before containers start; Docker daemon image inspect returned `500 Internal Server Error` against `/var/run/docker.sock`
- own review plus one spec-review subagent plus two quality-review subagents ran; actionable findings were fixed and honest closure stayed explicit in this note

### Final Summary

Repo now has real Docker E2E commands, a real wrapper, and durable docs for how to run them. The docker default is intentionally the committed browser smoke subset, not the whole browser suite, and the wrapper now preserves the primary failure if cleanup also breaks.

Real Docker execution is still externally blocked in this workspace by Docker daemon or socket failures, so this task closes on command-surface truth, unit or contract proof, host browser regression proof, and honest blocked-wrapper evidence.

### Completion Gate

- [x] Acceptance Criteria checkboxes updated to match reality
- [x] Definition of Done checkboxes updated to match reality
- [x] Only now may `status` change to `done`
