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

- frontend dependencies live in `frontend/`
- Python dependencies live in `backend/`
- `backend/pyproject.toml` is the Python project entrypoint
- backend commands are executed with `uv --project backend ...`

## Install `uv`

Check that `uv` is available:

```bash
uv --version
````

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
cd frontend
npm install
cd ..
```

## Local folders

Ensure these exist:

```bash
mkdir -p data/videos
mkdir -p masks
mkdir -p exports
```

Put milestone-01 review videos under `data/videos/`. Backend startup scans this directory automatically after DB bootstrap and upserts indexed metadata into SQLite; no manual DB seeding is required for local review targets.

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
uv --project backend run uvicorn app.main:app --reload
```

When backend starts, it bootstraps tables and indexes any supported local videos already present under `data/videos/`.

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

## Backend-only commands

Use these when you specifically want to work on the Python side without going through repo-level scripts.

### Run backend tests

```bash
uv --project backend run pytest
```

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

Run these from inside `frontend/`.

```bash
cd frontend
npm run dev
npm run lint
npm run typecheck
npm run test
```

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
* a local video placed under `data/videos/` is indexed after backend startup without manual DB seeding

## Milestone-01 real-video smoke check

1. Put one real local video under `data/videos/`.
   For repo sample:

   ```bash
   cp data/examples/bedroom.mp4 data/videos/bedroom.mp4
   ```

2. Start backend in one terminal:

   ```bash
   npm run backend:dev
   ```

3. Start frontend in another terminal:

   ```bash
   npm run frontend:dev
   ```

   Vite proxies relative `/api` requests to backend `http://127.0.0.1:8000` during local dev, so open the frontend URL and keep backend on port `8000`.

4. Open frontend in browser, usually `http://127.0.0.1:5173/`.

5. Validate review flow against the real video:
   - indexed video appears in list
   - selecting video loads metadata and playback pane
   - exact-frame input loads frame `N`
   - `Next frame` moves to `N + 1`
   - `Previous frame` moves back to `N`

6. Confirm repeated exact-frame loads stay stable:

   ```bash
   VIDEO_ID="$(curl -s http://127.0.0.1:8000/api/videos | jq -r '.[0].id')"
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
* exact frame endpoint returns an image
* annotation save/load works
* SAM2 session can be created

## Notes

* Python is managed only through `backend/`
* use `uv --project backend ...` for all backend commands
* use repo-level `npm run ...` commands for the normal daily workflow
* commit both `backend/pyproject.toml` and `backend/uv.lock` when dependencies change
* keep `backend/.venv/` local to the repo
