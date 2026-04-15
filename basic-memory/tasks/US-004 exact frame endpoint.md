---
title: US-004 exact frame endpoint
type: task
permalink: video-annotator/tasks/us-004-exact-frame-endpoint
status: done
assigned_to: codex
current_step: 3
completed: 2026-04-14
steps:
- Write failing tests for exact-frame endpoint behavior
- Implement backend exact-frame service and route
- Run repo quality checks and record results
tags:
- task
---

# US-004 exact frame endpoint

## Observations
- [description] Implement milestone-01 exact-frame endpoint with backend-canonical frame index handling.
- [status] done
- [assigned_to] codex
- [current_step] 3
- [completed] 2026-04-14

## Steps
1. [x] Write failing tests for exact-frame endpoint behavior
2. [x] Implement backend exact-frame service and route
3. [x] Run repo quality checks and record results
## Context
Highest-priority failing story from `tools/ralph/prd.json` is `US-004`.
Need `GET /api/videos/{video_id}/frame/{frame_idx}` with 404 for unknown video, clear client error for invalid frame index, stable repeated bytes for same request, and docs updates in `docs/engineering/api.md` plus `docs/engineering/architecture.md`.
Current backend has thin video catalog routes in `backend/app/api/videos.py`, indexed metadata in `Video`, and service seams in `backend/app/services/`.
Tests can patch decoder seam; avoid real media fixtures.
