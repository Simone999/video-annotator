---
id: task-migrate-e2e-to-docker
title: Migrate E2E to Docker
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
- frontend
- tests
- e2e
- docker
- ci
permalink: video-annotator/tasks/migrate-e2e-to-docker
---

# Migrate E2E to Docker

## Creation Phase

### Description

Migrate the current local-development E2E workflow for the React frontend + FastAPI backend to a Docker-based E2E workflow that is reproducible locally and usable later in CI.

Current repo anchors:
- E2E currently runs from `tests/e2e/` against local frontend and backend URLs via repo scripts in `package.json`
- current local bootstrap uses `backend:db:reset:e2e`, `backend:db:migrate:e2e`, `backend:seed:e2e`, `frontend:dev:e2e`, and `test:e2e`
- `tests/e2e/global.setup.ts` currently resets the SQLite E2E DB, runs Alembic, and runs the baseline seed before host-run browser tests
- `tests/e2e/playwright.config.ts` currently starts local web servers for host-run E2E
- backend already has explicit Alembic bootstrap under `backend/alembic/`
- backend already has explicit seed entrypoint `backend/scripts/seed_e2e.py`
- frontend already has `.env.e2e` plus `VITE_API_BASE_URL` wiring
- current E2E DB is SQLite at `/tmp/video-annotator-playwright.sqlite3`, not Postgres
- there are no Dockerfiles or Docker Compose files for E2E yet

Current state:
- frontend runs locally
- backend runs locally
- SQLite E2E database file is recreated locally
- Playwright runs against local URLs

Target state:

E2E tests must run against a Dockerized stack:
- `backend-init` one-shot container
- `backend` app container
- `frontend` app container
- `playwright` test-runner container
- no separate `db` container; keep the current SQLite E2E truth and move it into a shared Docker volume
- clean SQLite E2E database file plus masks dir managed inside the Docker E2E workflow, not via local host-only assumptions

The workflow should be:
1. create or clear clean E2E storage for the Docker run
2. run Alembic migrations in `backend-init`
3. run baseline E2E seed in `backend-init`
4. start `backend`
5. start `frontend`
6. run Playwright tests from `playwright`
7. stop and clean up containers plus any E2E volumes or temp state

Locked repo decisions for this task:
- add root `docker-compose.e2e.yml`
- add `backend/Dockerfile.e2e`
- add `frontend/Dockerfile.e2e`
- use one shared named Docker volume mounted at `/var/lib/video-annotator-e2e`
- use `APP_DB_URL=sqlite:////var/lib/video-annotator-e2e/video-annotator-playwright.sqlite3`
- use `APP_MASKS_DIR=/var/lib/video-annotator-e2e/masks`
- `backend-init` is the only place that runs `alembic upgrade head` and `python scripts/seed_e2e.py`
- `backend` starts `uvicorn app.main:app --host 0.0.0.0 --port 8000` without reload
- `frontend` starts Vite E2E mode on `0.0.0.0:3000`
- Docker E2E frontend uses `VITE_API_BASE_URL=http://backend:8000/api`
- Playwright runs from a dedicated `playwright` container, not from the host
- `tests/e2e/playwright.config.ts` must support `PLAYWRIGHT_RUN_MODE=docker`, use `baseURL=http://frontend:3000` in Docker mode, and disable local `webServer` bootstrap in Docker mode
- `tests/e2e/global.setup.ts` keeps the current host-run migrate and seed behavior outside Docker mode and becomes wait-only or no-op in Docker mode
- add package scripts `docker:e2e:build`, `docker:e2e:up`, `docker:e2e:test`, `docker:e2e:down`, and `docker:e2e`
- add `tools/e2e/docker-e2e.sh` as the orchestration entry used by those package scripts so teardown still runs on failure

Repo truth a fresh agent should inspect first:
- `package.json`
- `tests/e2e/playwright.config.ts`
- `tests/e2e/global.setup.ts`
- `backend/scripts/seed_e2e.py`
- `backend/alembic/`
- `frontend/.env.e2e`

### Scope

- In scope: create `docker-compose.e2e.yml`; add `backend/Dockerfile.e2e` and `frontend/Dockerfile.e2e`; make Alembic migration and `backend/scripts/seed_e2e.py` work from `backend-init`; make Docker E2E frontend use `VITE_API_BASE_URL=http://backend:8000/api`; update `tests/e2e/playwright.config.ts` and `tests/e2e/global.setup.ts` for explicit Docker mode; add `tools/e2e/docker-e2e.sh`; add package scripts `docker:e2e:build`, `docker:e2e:up`, `docker:e2e:test`, `docker:e2e:down`, and `docker:e2e`; document the Docker E2E flow; keep the current explicit migrate-then-seed shape instead of adding startup side effects
- Out of scope: product feature changes, switching E2E DB from SQLite to Postgres, adding a separate `db` container, seeding through FastAPI startup hooks, or replacing the normal non-Docker local dev workflow

### Affected Features

- [[Video Ingest and Exact-Frame Review]]
- [[Review Workspace Ergonomics]]

### Acceptance Criteria

- [ ] A developer can run one repo-level command to execute the full Docker E2E flow
- [ ] Docker E2E uses a dedicated setup separate from normal local dev setup
- [ ] The SQLite E2E database file and masks dir start clean for a fresh Docker E2E run
- [ ] Alembic migrations run successfully inside the Docker workflow
- [ ] Baseline E2E seed data is applied successfully through `backend/scripts/seed_e2e.py`
- [ ] `docker-compose.e2e.yml` defines `backend-init`, `backend`, `frontend`, and `playwright`
- [ ] Docker E2E keeps SQLite and shared volume storage; no separate `db` service is introduced
- [ ] `backend-init` is a one-shot migrate-then-seed step and `backend` depends on it instead of rerunning startup seeding
- [ ] FastAPI starts inside Docker on `0.0.0.0:8000` and is reachable by the frontend
- [ ] Frontend starts inside Docker on `0.0.0.0:3000` and is reachable by Playwright
- [ ] Docker E2E frontend uses `VITE_API_BASE_URL=http://backend:8000/api`
- [ ] `tests/e2e/playwright.config.ts` supports `PLAYWRIGHT_RUN_MODE=docker` with `baseURL=http://frontend:3000`
- [ ] `tests/e2e/global.setup.ts` keeps current host bootstrap outside Docker mode and avoids duplicate migrate or seed work in Docker mode
- [ ] Existing Playwright tests run successfully against the Dockerized stack
- [ ] Root package scripts expose `docker:e2e:build`, `docker:e2e:up`, `docker:e2e:test`, `docker:e2e:down`, and `docker:e2e`
- [ ] `tools/e2e/docker-e2e.sh` handles orchestration and reliable teardown on failure
- [ ] The Docker E2E stack can be torn down cleanly, including volumes or temp state when needed
- [ ] `docker compose -f docker-compose.e2e.yml config` succeeds
- [ ] The process is documented in the repo and recorded honestly in memory
- [ ] The existing non-Docker app runtime and explicit local E2E bootstrap do not break

### Test Intent

- Backend: prove containerized migrate plus seed flow works against clean Docker E2E storage and does not require startup hooks
- Frontend: prove Dockerized frontend resolves backend through `http://backend:8000/api` and existing Playwright coverage passes against the stack
- E2E: keep current `tests/e2e/specs/routes.spec.ts` and `tests/e2e/specs/review-navigation.spec.ts` working in both host mode and Docker mode
- Manual: one clean Docker up or test or down smoke from repo root, plus honest teardown verification

### Definition of Done

- [ ] Docker E2E verification passes from a clean run
- [ ] Existing format, lint, typecheck, and relevant tests still pass
- [ ] Docker E2E workflow and deviations from current local E2E are documented honestly
- [ ] Owning feature notes or testing notes are updated if E2E command surface or proof locations change

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
