---
title: Add Docker Compose E2E stack
type: note
permalink: video-annotator/tasks/add-docker-compose-e2e-stack
id: task-add-docker-compose-e2e-stack
status: done
completed:
steps:
- creation
- planning
- execution
- wrap_up
tags:
- task
- backend
- frontend
- tests
- docker
- m-7
- e2e
---

# Add Docker Compose E2E stack

## Creation Phase

### Description

Add compose stack for backend init, backend, frontend, and Playwright with shared SQLite volume.

Read first:
- [[Workflow]]
- `basic-memory/tests/e2e-tests.md`
- `package.json`
- backend and frontend Docker E2E task notes once created

Stage-2 rule: in planning phase, write concrete test plan and implementation plan first. In execution, follow written plan. Before `done`, run own review plus 2 subagent reviews and fix actionable findings.

### Scope

- In scope: compose file, service dependencies, health or readiness shape, and shared volume routing
- Out of scope: Playwright config or package scripts

### Affected Features

- [[Video Ingest and Exact-Frame Review]]

### Acceptance Criteria

- [x] Compose stack defines backend-init, backend, frontend, and Playwright services
- [x] Shared SQLite volume replaces separate DB service for Docker E2E
- [x] `docker compose ... config` style validation passes for stack file

### Test Intent

- Backend: compose config validation and backend service smoke inside compose
- Frontend: frontend service smoke inside compose
- Manual: none in this slice

### Definition of Done

- [x] Planning phase records concrete tests and implementation plan before code
- [x] Own review plus 2 subagent reviews are recorded and actionable findings are fixed
- [x] Relevant tests and quality checks pass
- [x] Feature notes, task note, and routing indexes are updated honestly when truth changes

## Planning Phase

### Planned Integration Tests

- Backend tooling:
  - add `backend/tests/unit/tooling/test_docker_e2e_compose.py`
  - read raw `docker-compose.e2e.yml` so committed contract coverage always runs, even without local Docker CLI access
  - assert YAML keeps `backend-init`, `backend`, `frontend`, and runner-profile `playwright`, shared `/var/lib/video-annotator-e2e` mounts on init plus backend, exact dependency conditions, placeholder runner command for future `US-013`, and no `db` service

### Planned E2E Tests

- Compose smoke:
  - run `docker compose -f docker-compose.e2e.yml up -d backend frontend`
  - wait until `frontend` health reports `healthy`
  - from `frontend` container, fetch `http://backend:8000/api/videos` and confirm seeded videos exist
  - run `docker compose -f docker-compose.e2e.yml down -v --remove-orphans`
  - confirm shared Docker E2E volume is removed after teardown

### Planned Implementation

- Step 1: write failing compose contract test first
- Step 2: add `docker-compose.e2e.yml` with shared SQLite volume, one-shot `backend-init`, `backend`, `frontend`, and profile-gated `playwright`
- Step 3: keep stack internal-only and healthcheck-driven so Docker smoke does not fight host ports or depend on future Playwright Docker-mode work
- Step 4: run targeted contract test, compose config proof, compose smoke, teardown proof, then repo quality commands

### Feature Matrix Updates

- none expected in this slice; this is test-tooling infrastructure only

## Execution Phase

### Implementation Notes

- Wrote failing backend tooling contract test `backend/tests/unit/tooling/test_docker_e2e_compose.py`; first red run failed because `docker-compose.e2e.yml` did not exist.
- Added `docker-compose.e2e.yml` with shared named volume `video-annotator-e2e-state`, one-shot `backend-init`, healthchecked `backend`, healthchecked `frontend`, and runner-profile `playwright`.
- Kept `playwright` behind `runner` profile with an explicit placeholder command so plain compose smoke can validate init plus runtime services now, while future Docker Playwright work in `US-013` can replace that placeholder with real runner wiring.
- Kept compose stack internal-only with healthchecks instead of host port publishing so Docker E2E smoke avoids collisions with local dev servers.
- Own review plus 2 focused subagent reviews found 2 actionable issues: the compose contract test should not depend on local Docker CLI presence, and the `playwright` service should not pretend Docker Playwright execution already works before `US-013`. Both findings were fixed in this slice.

## Wrap-Up Phase

### Verification

- Commands run:
  - `uv run --project backend pytest backend/tests/unit/tooling/test_docker_e2e_compose.py -q`
  - `uv run --project backend pytest backend/tests/unit/tooling/test_docker_e2e_backend.py backend/tests/unit/tooling/test_docker_e2e_compose.py -q`
  - `npm --workspace frontend run test -- tests/unit/tooling/docker-e2e-frontend.test.ts`
  - `docker compose -f docker-compose.e2e.yml config`
  - `docker compose --profile runner -f docker-compose.e2e.yml config`
  - `docker compose --profile runner -f docker-compose.e2e.yml up --abort-on-container-exit --exit-code-from playwright playwright`
  - `docker compose -f docker-compose.e2e.yml up -d backend frontend`
  - `python - <<'PY' ... wait for frontend health ... PY`
  - `docker compose -f docker-compose.e2e.yml exec -T frontend node -e "fetch('http://backend:8000/api/videos') ..."`
  - `docker compose -f docker-compose.e2e.yml down -v --remove-orphans`
  - `docker volume ls --format '{{.Name}}' | rg '^video-annotator_' || true`
  - `uv run --project backend ruff check backend/tests/unit/tooling/test_docker_e2e_compose.py`
  - `npm run typecheck`
  - `npm run lint`
  - `npm run test`
- Results:
  - compose contract test passed after compose file landed and now always runs without depending on local Docker CLI presence
  - backend plus frontend Docker tooling tests passed
  - plain compose config and runner-profile compose config both resolved successfully
  - optional runner-profile smoke waited for healthy deps, printed placeholder `US-013` message, and exited `0`
  - compose smoke ran `backend-init` first, then healthy `backend`, then healthy `frontend`
  - seeded `GET /api/videos` returned `2` videos from `frontend` container through Docker service name `backend`
  - `docker compose ... down -v --remove-orphans` removed containers, network, and shared E2E volume cleanly
  - targeted Ruff check passed for new backend tooling test
  - `npm run typecheck` passed
  - `npm run lint` passed
  - `npm run test` passed

### Final Summary

Docker Compose E2E stack now exists and smokes correctly for `backend-init`, `backend`, and `frontend`, with future `playwright` runner wiring held behind the `runner` profile until `US-013`.

### Completion Gate

- [x] Acceptance Criteria checkboxes updated to match reality
- [x] Definition of Done checkboxes updated to match reality
- [x] Only now may `status` change to `done`
