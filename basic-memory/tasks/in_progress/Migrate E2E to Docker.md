---
id: task-migrate-e2e-to-docker
title: Migrate E2E to Docker
status: in_progress
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
- shared Playwright harness currently runs from `tests/e2e/`, while frontend-owned browser specs and fixtures live under `frontend/tests/e2e/`
- current local bootstrap uses `backend:db:reset:e2e`, `backend:db:migrate:e2e`, `backend:seed:e2e`, `frontend:dev:e2e`, and `test:e2e`
- `tests/e2e/global.setup.ts` currently resets the SQLite E2E DB, runs Alembic, and runs the baseline seed before host-run browser tests
- `tests/e2e/playwright.config.ts` currently starts local web servers for host-run E2E and points Chromium at `frontend/tests/e2e/`
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
- [[SAM2 Shell and Runtime]]

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
- E2E: keep current `frontend/tests/e2e/routes.spec.ts` and `frontend/tests/e2e/review-navigation.spec.ts` working in both host mode and Docker mode
- Manual: one clean Docker up or test or down smoke from repo root, plus honest teardown verification

### Definition of Done

- [ ] Docker E2E verification passes from a clean run
- [ ] Existing format, lint, typecheck, and relevant tests still pass
- [ ] Docker E2E workflow and deviations from current local E2E are documented honestly
- [ ] Owning feature notes or testing notes are updated if E2E command surface or proof locations change

## Planning Phase
### Planned Integration Tests

- Backend:
  - add one backend tooling test that freezes `backend/Dockerfile.e2e` default runtime contract: shared E2E storage env vars use `/var/lib/video-annotator-e2e`, runtime starts `uvicorn app.main:app --host 0.0.0.0 --port 8000`, and image includes repo fixture videos plus `ffmpeg` or `ffprobe` dependencies needed by seed and exact-frame routes
  - add one backend tooling test that freezes a dedicated one-shot init command script running `alembic upgrade head` before `python scripts/seed_e2e.py`
- Frontend:
  - none in this story; Docker frontend wiring belongs to later Ralph stories

### Planned E2E Tests

- Backend:
  - build `backend/Dockerfile.e2e`
  - run one clean init-container smoke with a mounted temp host dir or Docker volume and confirm migrated SQLite plus masks land under `/var/lib/video-annotator-e2e`
  - run one backend runtime container against that same storage and confirm `GET /api/videos` returns seeded videos on `0.0.0.0:8000`
- Frontend:
  - none in this story; Playwright Docker mode and compose wiring are deferred to later stories

### Planned Implementation

- Step 1: write failing backend tooling tests for Dockerfile and init-script contracts
- Step 2: add `backend/Dockerfile.e2e` plus one reusable init command script that later compose work can call directly
- Step 3: keep runtime default on `uvicorn app.main:app --host 0.0.0.0 --port 8000` without reload and bake shared-volume env defaults into the image
- Step 4: run Docker build plus init and runtime smoke against clean shared storage, then run targeted tests and repo quality gates
- Step 5: update task execution notes, Ralph progress, PRD story state, and any durable AGENTS or memory learnings discovered from backend containerization

### Feature Matrix Updates

- `[[Video Ingest and Exact-Frame Review]]`: update only if this slice changes durable E2E bootstrap truth worth surfacing before the rest of the Docker stack lands
- `[[SAM2 Shell and Runtime]]`: no behavior update expected in this slice; route-browser proof remains host-run until later Docker compose and Playwright stories land
### Planned Integration Tests

### Planned E2E Tests

### Planned Implementation

### Feature Matrix Updates

## Execution Phase
### Implementation Notes

- This iteration handled Ralph story `US-010` only; later Docker frontend, compose, Playwright Docker mode, and orchestration-command stories remain pending under this same task.
- Added backend Docker E2E runtime image `backend/Dockerfile.e2e`, one-shot init script `backend/scripts/docker_e2e_init.sh`, repo-root `.dockerignore`, and backend tooling contract test `backend/tests/unit/tooling/test_docker_e2e_backend.py`.
- First Docker init smoke exposed that plain `uv run` inside the image tried to re-sync dev dependencies even after `uv sync --no-dev` during build. The fix was to use `uv run --no-sync --no-dev` for both init and runtime commands so container execution stays deterministic and offline once the image is built.
- Current backend image copies repo fixture videos into `/app/data/videos`, keeps mutable SQLite and mask state under `/var/lib/video-annotator-e2e`, runs Alembic plus baseline seed through the init script, and serves FastAPI on `0.0.0.0:8000` by default.
### Implementation Notes

## Wrap-Up Phase
### Verification

- Commands run:
  - `uv run --project backend pytest backend/tests/unit/tooling/test_docker_e2e_backend.py`
  - `docker build -f backend/Dockerfile.e2e -t video-annotator-backend-e2e:local .`
  - `docker run --rm -v "$tmpdir:/var/lib/video-annotator-e2e" video-annotator-backend-e2e:local ./scripts/docker_e2e_init.sh`
  - `docker run -d --rm -p 18000:8000 -v "$tmpdir:/var/lib/video-annotator-e2e" video-annotator-backend-e2e:local`
  - `npm run typecheck`
  - `npm run lint`
  - `npm run test`
- Results:
  - backend tooling contract test passed
  - Docker image built successfully from `backend/Dockerfile.e2e`
  - init-container smoke created `/var/lib/video-annotator-e2e/video-annotator-playwright.sqlite3` plus `/var/lib/video-annotator-e2e/masks` and seeded `2` baseline videos
  - runtime-container smoke served seeded `GET /api/videos` on mapped host port `18000`
  - repo `typecheck`, `lint`, and `test` all passed after the backend Docker E2E slice landed

### Final Summary

Backend Docker E2E bootstrap now has a reusable image plus one-shot init command for later compose work. This slice does not finish the broader Docker migration task, but it completes the backend-only foundation needed by Ralph story `US-010`.

### Completion Gate

- [ ] Acceptance Criteria checkboxes updated to match reality
- [ ] Definition of Done checkboxes updated to match reality
- [ ] Only now may `status` change to `done`

### Verification

- Commands run:
- Results:

### Final Summary

### Completion Gate

- [ ] Acceptance Criteria checkboxes updated to match reality
- [ ] Definition of Done checkboxes updated to match reality
- [ ] Only now may `status` change to `done`
