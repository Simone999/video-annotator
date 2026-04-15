---
title: US-011 real video validation live dev patterns
type: note
permalink: video-annotator/engineering/us-011-real-video-validation-live-dev-patterns
tags:
- milestone-01
- ralph
- frontend
- backend
- validation
---

# US-011 real video validation live dev patterns

Real milestone-01 validation against a live local video found two local-stack gaps that mocked UI checks had hidden. First, repo-root `npm run backend:dev` was launching uvicorn from repo root, which picked the wrong import path and failed before startup. Second, the frontend dev server was not proxying relative `/api` requests, so real browser traffic went to `http://127.0.0.1:5173/api/*` and returned Vite 404s instead of reaching FastAPI on `8000`.

After fixing those seams, the live smoke pass worked with a real copied video under `data/videos/`: the app listed the indexed video, selection loaded metadata and playback, exact frame `42` loaded, stepping moved to `43` and back to `42`, and repeated requests for frame `42` produced identical SHA-256 hashes. The runbook now documents those steps so milestone validation is reproducible.

## Observations
- [decision] Keep frontend API paths relative and rely on Vite dev proxy to route `/api` traffic to backend `127.0.0.1:8000` during local browser validation #frontend #vite
- [decision] Run repo-root backend dev with `uv --directory backend run uvicorn app.main:app --reload` so backend env and `app.main` imports resolve correctly #backend #uv
- [lesson] Mocked Playwright checks can miss real local-stack integration gaps; milestone validation still needs one unmocked browser pass #validation #playwright
- [gotcha] Use a real file inside `data/videos/` for smoke checks; symlinks that resolve outside the source tree break current relative-path ID derivation #indexing #filesystem
- [evidence] Live repeat loads for frame `42` returned identical SHA-256 `ac5e1b723c7c5a8df021ea874017e0e6d593c340fe58d8040e99a21542c85c2b` against running backend #exact-frame

## Relations
- relates_to [[US-010 startup indexing patterns]]
- relates_to [[Milestone-01 Ralph audit gaps]]
- extends [[US-007 playback pane and metadata panel patterns]]
- extends [[US-008 exact frame pane and jump input patterns]]
- extends [[US-009 previous and next exact frame navigation patterns]]