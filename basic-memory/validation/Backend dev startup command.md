---
title: Backend dev startup command
type: note
permalink: video-annotator/validation/backend-dev-startup-command
tags:
- validation
- backend
- uv
---

# Backend dev startup command

This note answers which command should start the backend from the repo root
during local development. The correct command is
`uv --directory backend run uvicorn app.main:app --reload`.

The directory switch matters because backend imports and environment resolution
depend on the Python project rooted in `backend/`. Starting uvicorn from the
repo root without that context can fail before startup indexing or route
handling even begins.

## Observations
- [decision] From the repo root, run backend dev with `uv --directory backend run uvicorn app.main:app --reload`. #backend #uv
- [gotcha] Launching uvicorn from the repo root without the backend directory context can break imports and environment resolution before startup completes. #local-dev #debugging
- [behavior] Backend startup should bootstrap tables and index local videos before the UI requests `/api/videos`. #startup #validation

## Relations
- relates_to [[Startup indexing]]
- relates_to [[Local video source setup]]
- relates_to [[Live video smoke validation]]
