---
title: Runbook
type: spec
canonical: true
domain: operations
permalink: video-annotator/spec/operations/runbook
tags:
- spec
- operations
- runbook
- local-dev
---

# Runbook

This is the canonical startup and recovery note for local operation of the video annotator. Use it when booting a fresh checkout, checking expected local processes, or recovering from startup failures without guessing.

Local setup is one backend process, one frontend dev server, one local SQLite database, local `data/videos/`, local mask/export folders, and optional SAM2 model assets on the same machine. Privacy assumption is strict local-first: data stays on the machine, no external upload is required, API should stay bound to localhost, and there is no telemetry. Put real review videos under `data/videos/`; explicit bootstrap seeds indexed rows from that directory. Use a real file inside that tree, not a symlink pointing outside it.

Normal local startup flow: create backend env with `uv venv backend/.venv --python 3.12`, install backend deps with `uv --project backend sync --dev --extra sam2`, install frontend deps with `npm install` from repo root so workspace lock state stays canonical, then ensure `data/videos`, `masks`, and `exports` exist. Set `APP_DB_URL`, `APP_DATA_DIR`, `APP_MASKS_DIR`, `APP_EXPORTS_DIR`, and, for SAM2 work, `SAM2_CONFIG_PATH` plus `SAM2_CHECKPOINT_PATH`. Run `npm run backend:db:migrate` to create or upgrade schema, then run `uv --directory backend run python scripts/seed_e2e.py` if you want current `data/videos/` indexed into the local DB. Start backend from repo root with `npm run backend:dev`, which correctly runs `uv --directory backend run uvicorn app.main:app --reload`. Start frontend with `npm run frontend:dev`, then open the Vite URL, usually `http://127.0.0.1:5173/`. Expected local dev processes are FastAPI on `127.0.0.1:8000` and Vite on `127.0.0.1:5173`; normal dev keeps relative `/api` calls and Vite proxying, while E2E mode uses `frontend/.env.e2e` and talks to `http://127.0.0.1:8000/api` directly. For isolated UI work, Storybook now uses `npm run storybook` and `npm run storybook:build` from repo root.

Startup recovery checklist: if `/api/videos` is empty, first confirm a real file exists under `data/videos/`, then rerun explicit seed with `uv --directory backend run python scripts/seed_e2e.py`. If requests fail on missing tables, run `npm run backend:db:migrate`; app startup no longer creates tables for you. If the frontend shows Vite 404s for `/api/*`, the proxy path or backend process is wrong; keep normal dev API URLs relative and verify FastAPI is listening on `127.0.0.1:8000`. If E2E browser fetches fail from `http://127.0.0.1:3000`, verify `.env.e2e` points at `http://127.0.0.1:8000/api` and the backend is on that port. If exact-frame loads fail, check video decode tooling and the source file itself. If SAM2 create-session, prompt, or propagation fails, treat missing model paths, GPU unavailable, out-of-memory, or corrupt local artifacts as first suspects and recover by fixing env vars, freeing GPU memory, or clearing the bad local artifact before retrying.

Worker guidance: today, local propagation work is launched by the backend as an in-process background thread that opens fresh DB sessions. There is not yet a separate worker command to run for day-to-day local development. In practice, “run worker locally” means start the backend with valid SAM2 configuration and leave that process alive while jobs run. The production-like target is still different: built frontend assets served by backend or a reverse proxy, backend as one process, and SAM2 worker isolated as a separate process for long-running GPU work.

This runbook should answer three operator questions without sending the reader to hidden docs: what is the startup workflow for local setup, what is the operations checklist when startup or indexing fails, and what are the privacy and deployment assumptions for this local-first app. Local deployment assumption is development on one machine with backend and frontend bound to localhost; production-like local runs may split backend and worker processes later, but today the default operator path is still start backend and frontend locally and let the backend own in-process job execution.

## Observations
- [assumption] Local operation is single-machine and local-first; data, masks, exports, and video sources remain on the same host #privacy #local-dev
- [command] Canonical backend dev start is `npm run backend:dev`, which shells into `uv --directory backend run uvicorn app.main:app --reload` from repo root #backend #startup
- [command] Canonical frontend dev start is `npm run frontend:dev`, with Vite proxying relative `/api` requests to `127.0.0.1:8000` #frontend #startup
- [command] Canonical frontend dependency install is `npm install` from repo root so workspace lock state stays canonical, and Storybook commands are `npm run storybook` plus `npm run storybook:build` #frontend #startup #testing
- [command] Canonical local schema bootstrap is `npm run backend:db:migrate`, and canonical local indexing bootstrap is `uv --directory backend run python scripts/seed_e2e.py` #backend #startup #alembic
- [recovery] Missing database tables mean explicit migration did not run yet; app startup no longer bootstraps schema #database #startup
- [recovery] Empty video list usually means `data/videos/` is empty, the file path is outside the indexed tree, or explicit seeding was skipped or failed #indexing #videos
- [status] Current local worker behavior is in-process threaded propagation from the backend; separate SAM2 worker process is a production-like target, not the present dev command surface #sam2 #worker

## Relations
- relates_to [[Architecture]]
- relates_to [[SAM2 Integration]]
- relates_to [[Delivery Plan and Risks]]
- relates_to [[Operations Index]]
