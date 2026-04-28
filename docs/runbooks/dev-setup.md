# Development Setup

## Requirements

- Python 3.12
- `uv`
- Node.js 20+
- npm
- CUDA-capable GPU for SAM2 workflows
- `ffmpeg` optional but useful

## Project layout assumptions

This setup assumes:

- frontend source lives in `frontend/`
- Python dependencies live in `backend/`
- `backend/pyproject.toml` is the Python project entrypoint
- backend commands are executed with `uv --project backend ...`
- root `package-lock.json` is canonical for npm workspace installs

## Install `uv`

Check that `uv` is available:

```bash
uv --version
```

## Initial setup

Run these commands from the repo root.

### 1. Create the backend virtual environment

```bash
uv venv backend/.venv --python 3.12
```

### 2. Sync backend dependencies

For the default development environment:

```bash
uv --project backend sync --dev --extra sam2
```

### 3. Install frontend dependencies

```bash
npm install
```

### 4. Install git hooks

From the repo root:

```bash
make precommit-install
```

This installs both managed hook types explicitly:

- `pre-commit` runs repo format, lint-fix, lint, typecheck, then `npm run test:unit`
- `pre-push` runs `npm run test:integration`
- `npm run test:e2e` stays manual and out of git hooks

## Local folders

Ensure these exist:

```bash
mkdir -p data/videos
mkdir -p masks
mkdir -p exports
```

Put milestone-01 review videos under `data/videos/`. Backend startup does not create tables or auto-index local videos. Run schema migration and an explicit indexing or seed step before expecting `/api/videos` to return local review targets.

For a quick local smoke check, copy the repo sample video into that folder:

```bash
cp data/examples/bedroom.mp4 data/videos/bedroom.mp4
```

Use a real file under `data/videos/`, not a symlink outside that tree; indexing derives stable IDs from paths relative to the source directory.

## Environment variables

Set these in your shell or in a local `.env` file if supported by backend config.

```bash
export APP_ENV=development
export APP_DB_URL=sqlite:///./app.db
export APP_DATA_DIR=./data
export APP_MASKS_DIR=./masks
export APP_EXPORTS_DIR=./exports
export SAM2_CONFIG_PATH=/path/to/config.yaml
export SAM2_CHECKPOINT_PATH=/path/to/checkpoint.pt
```

## Running the app

```bash
npm run dev
```

### Start the backend

From the repo root:

```bash
npm run backend:dev
```

Or directly:

```bash
 node scripts/run-with-env.mjs development -- uv --directory backend run python -m scripts.prepare_db
node scripts/run-with-env.mjs development -- uv --directory backend run uvicorn app.main:app --reload --host {BACKEND_HOST} --port {BACKEND_PORT}
```

`npm run backend:dev` now loads repo env files, prepares the local SQLite DB first, repairs the known pre-Alembic local schema if needed, then runs `alembic upgrade head`, then starts FastAPI on the env-driven development backend port.
FastAPI startup itself still does not create tables or index local videos for you.

### Start the frontend

From the repo root:

```bash
npm run frontend:dev
```

Or from the frontend workspace:

```bash
cd frontend
npm run dev
```

## Daily commands

Use the repo-level `npm` scripts as the default command surface.

### Lint

```bash
npm run lint
```

### Auto-fix lint issues

```bash
npm run lint:fix
```

### Format

```bash
npm run format
```

### Check formatting

```bash
npm run format:check
```

### Typecheck

```bash
npm run typecheck
```

### Run tests

```bash
npm run test
```

This repo-level test command now fails if backend or frontend line or branch coverage drops below `90%`.

### Run unit tests

```bash
npm run test:unit
```

### Run integration tests

```bash
npm run test:integration
```

### Run E2E tests manually

```bash
npm run test:e2e
```

E2E stays opt-in and is not part of the local git hook flow.

### Run Docker E2E manually

Install repo Node dependencies on the host first:

```bash
npm ci
```

Clean full run for the committed browser smoke subset (`routes.spec.ts` plus `review-navigation.spec.ts`):

```bash
npm run test:e2e:docker
```

Step-by-step flow:

```bash
npm run test:e2e:docker:build
npm run test:e2e:docker:up
npm run test:e2e:docker:test
npm run test:e2e:docker:down
```

The full-run command tears down old docker E2E state before and after the run. The step-by-step flow leaves the stack up until you call `npm run test:e2e:docker:down`.
Both docker commands accept explicit spec args after `--` when you need browser coverage beyond the default smoke subset.

### Run Storybook

```bash
npm run storybook
```

### Build Storybook

```bash
npm run storybook:build
```

## Backend-only commands

Use these when you specifically want to work on the Python side without going through repo-level scripts.

### Run backend tests

```bash
uv --project backend run pytest
```

Backend `pytest` now uses xdist with `loadscope` by default through backend config. Use `uv --project backend run pytest -n 0` when you need single-process debugging.

### Run Ruff lint

```bash
uv --project backend run ruff check .
```

### Run Ruff with auto-fix

```bash
uv --project backend run ruff check --fix .
```

### Run Ruff format

```bash
uv --project backend run ruff format .
```

### Check Ruff formatting without changing files

```bash
uv --project backend run ruff format --check .
```

### Run Pyright

```bash
uv --project backend run pyright
```

### Run the backend server directly

```bash
uv --project backend run uvicorn app.main:app --reload
```

## Frontend workspace commands

Run these from inside `frontend/` when you specifically want workspace-local commands.

```bash
cd frontend
npm run dev
npm run lint
npm run typecheck
npm run storybook
npm run build-storybook
npm run test
```

Frontend `npm run test` now runs Vitest with coverage and fails below `90%` line or branch coverage.

## Dependency management

All Python dependency management is scoped to `backend/`.

### Add a backend dependency

```bash
uv --project backend add <dep>
```

### Add a backend dev dependency

```bash
uv --project backend add --dev <dep>
```

### Remove a backend dependency

```bash
uv --project backend remove <dep>
```

## SAM2 setup

Install and configure SAM2 according to the project integration plan.

Recommended:

* keep model weights outside git
* configure model paths via environment variables
* store checkpoints in a local models directory

Example:

```bash
export SAM2_CONFIG_PATH=/path/to/sam2_config.yaml
export SAM2_CHECKPOINT_PATH=/path/to/checkpoint.pt
```

## Smoke test checklist

* backend starts
* frontend starts
* `/api/videos` responds
* schema migration and explicit video indexing ran before the local review smoke check

## Milestone-01 real-video smoke check

1. Put one real local video under `data/videos/`.
   For repo sample:

   ```bash
   cp data/examples/bedroom.mp4 data/videos/bedroom.mp4
   ```

2. Run schema migration and explicit local indexing:

   ```bash
   npm run backend:db:prepare
   node scripts/run-with-env.mjs development -- uv --directory backend run python scripts/seed_e2e.py
   ```

   The repo still ships explicit local indexing. `backend:db:prepare` repairs known legacy local SQLite state and runs Alembic, but backend startup still does not discover videos by itself.

3. Start backend in one terminal:

   ```bash
   npm run backend:dev
   ```

4. Start frontend in another terminal:

   ```bash
   npm run frontend:dev
   ```

   Vite now reads repo env files from the repo root. Local development defaults use backend `http://127.0.0.1:8000` and frontend `http://127.0.0.1:5173`, while host Playwright E2E moves backend traffic to `127.0.0.1:8001`.

5. Open frontend in browser, usually `http://127.0.0.1:5173/`.

6. Validate review flow against the real video:
   - indexed video appears in list
   - selecting video opens the main review surface with playback and overlayed annotations
   - exact-frame input loads frame `N`
   - `Next frame` moves to `N + 1`
   - `Previous frame` moves back to `N`

7. Confirm repeated exact-frame loads stay stable:

   ```bash
   export VIDEO_ID="$(curl -s http://127.0.0.1:8000/api/videos | jq -r '.[0].id')"
   python3 - <<'PY'
   import hashlib
   import os
   import urllib.request

   video_id = os.environ["VIDEO_ID"]
   url = f"http://127.0.0.1:8000/api/videos/{video_id}/frame/42"

   for idx in range(2):
       with urllib.request.urlopen(url) as response:
           data = response.read()
       print(idx, len(data), hashlib.sha256(data).hexdigest())
   PY
   ```

   Both SHA-256 hashes should match.

## Env files

- root `.env` is the local development env and default source of truth
- `.env.e2e` owns host Playwright backend or frontend ports plus tmp DB and masks paths
- `.env.docker-e2e` owns Docker E2E runtime ports and API base URL

Process env still wins over file values when you need one-off overrides.

* exact frame endpoint returns an image
* annotation save/load works
* SAM2 session can be created

## Notes

* Python is managed only through `backend/`
* use `uv --project backend ...` for all backend commands
* use repo-level `npm run ...` commands for the normal daily workflow
* commit both `backend/pyproject.toml` and `backend/uv.lock` when dependencies change
* keep `backend/.venv/` local to the repo
