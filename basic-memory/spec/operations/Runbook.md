---
title: Runbook
type: note
permalink: video-annotator/spec/operations/runbook
tags:
- spec
- operations
- runbook
- local-dev
---

# Runbook

This is the canonical startup and recovery note for local operation of the video annotator. Use it when booting a fresh checkout, checking expected local processes, or recovering from startup failures without guessing.

Local setup is one backend process, one frontend dev server, one local SQLite database, local `data/videos/`, local mask/export folders, and optional SAM2 model assets on the same machine. Privacy assumption is strict local-first: data stays on the machine, no external upload is required, API should stay bound to localhost, and there is no telemetry. Put real review videos under `data/videos/`; backend startup indexes that directory automatically after DB bootstrap. Use a real file inside that tree, not a symlink pointing outside it.

Normal local startup flow: create backend env with `uv venv backend/.venv --python 3.12`, install backend deps with `uv --project backend sync --dev --extra sam2`, install frontend deps with `npm install` in `frontend/`, then ensure `data/videos`, `masks`, and `exports` exist. Set `APP_DB_URL`, `APP_DATA_DIR`, `APP_MASKS_DIR`, `APP_EXPORTS_DIR`, and, for SAM2 work, `SAM2_CONFIG_PATH` plus `SAM2_CHECKPOINT_PATH`. Start backend from repo root with `npm run backend:dev`, which correctly runs `uv --directory backend run uvicorn app.main:app --reload`. Start frontend with `npm run frontend:dev`, then open the Vite URL, usually `http://127.0.0.1:5173/`. Expected local dev processes are FastAPI on `127.0.0.1:8000` and Vite on `127.0.0.1:5173`; Vite proxies relative `/api` calls to the backend, so the frontend should keep relative API paths and the backend must stay on port `8000` during normal browser checks.

Startup recovery checklist: if `/api/videos` is empty, first confirm a real file exists under `data/videos/`, then restart backend and watch startup indexing. If startup crashes on missing tables, the backend did not finish `initialize_database()`; fix `APP_DB_URL`, ensure the SQLite path is writable, then restart backend so table bootstrap can run before requests. If the frontend shows Vite 404s for `/api/*`, the proxy path or backend process is wrong; keep frontend API URLs relative and verify FastAPI is listening on `127.0.0.1:8000`. If exact-frame loads fail, check video decode tooling and the source file itself. If SAM2 create-session, prompt, or propagation fails, treat missing model paths, GPU unavailable, out-of-memory, or corrupt local artifacts as first suspects and recover by fixing env vars, freeing GPU memory, or clearing the bad local artifact before retrying.

Worker guidance: today, local propagation work is launched by the backend as an in-process background thread that opens fresh DB sessions. There is not yet a separate worker command to run for day-to-day local development. In practice, “run worker locally” means start the backend with valid SAM2 configuration and leave that process alive while jobs run. The production-like target is still different: built frontend assets served by backend or a reverse proxy, backend as one process, and SAM2 worker isolated as a separate process for long-running GPU work.

This runbook should answer three operator questions without sending the reader to hidden docs: what is the startup workflow for local setup, what is the operations checklist when startup or indexing fails, and what are the privacy and deployment assumptions for this local-first app. Local deployment assumption is development on one machine with backend and frontend bound to localhost; production-like local runs may split backend and worker processes later, but today the default operator path is still start backend and frontend locally and let the backend own in-process job execution.

## Observations
- [assumption] Local operation is single-machine and local-first; data, masks, exports, and video sources remain on the same host #privacy #local-dev
- [command] Canonical backend dev start is `npm run backend:dev`, which shells into `uv --directory backend run uvicorn app.main:app --reload` from repo root #backend #startup
- [command] Canonical frontend dev start is `npm run frontend:dev`, with Vite proxying relative `/api` requests to `127.0.0.1:8000` #frontend #startup
- [recovery] Missing database tables usually mean backend startup did not complete DB bootstrap; verify `APP_DB_URL` and restart backend before debugging routes #database #startup
- [recovery] Empty video list after startup usually means `data/videos/` is empty, the file path is outside the indexed tree, or indexing failed during boot #indexing #videos
- [status] Current local worker behavior is in-process threaded propagation from the backend; separate SAM2 worker process is a production-like target, not the present dev command surface #sam2 #worker

## Relations
- relates_to [[Architecture]]
- relates_to [[SAM2 Integration]]
- relates_to [[Delivery Plan and Risks]]
- relates_to [[Operations Index]]
