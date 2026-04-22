---
title: Bootstrapping backend scripts for direct execution
type: engineering
permalink: video-annotator/engineering/bootstrapping-backend-scripts-for-direct-execution
canonical: true
domain: engineering
aliases:
- no module named app in backend script
- prepare_db module not found
- npm run dev prepare_db import failure
tags:
- backend
- scripts
- sys.path
- uv
- npm run dev
- ModuleNotFoundError
---

# Bootstrapping backend scripts for direct execution

Use this note when a backend helper under `backend/scripts/` works in imports or tests but fails when run as `python scripts/...`, or when deciding how repo-owned helper scripts should be launched.

## Problem

Direct script execution sets `sys.path[0]` to `backend/scripts`, not `backend/`.

That means script-local imports like `from app...` fail with `ModuleNotFoundError: No module named 'app'`.

This broke `npm run dev` when local startup used:

- `uv --directory backend run python scripts/prepare_db.py`

## Fix

Preferred fix: run helpers as modules from the backend root:

- `python -m scripts.prepare_db`
- `python -m scripts.seed_e2e`

This keeps `backend/` on `sys.path` naturally, so `app.*` imports work without script-local path surgery.

Fallback only when a script truly must support direct file execution:

- compute `BACKEND_ROOT = Path(__file__).resolve().parents[1]`
- insert it into `sys.path` if missing
- import `app.*` only after that bootstrap
- prefer lazy import helper if Ruff would flag `E402`

## What to remember

- prefer `python -m scripts.<name>` for repo-owned helper entrypoints
- tests that call internal functions do not prove module CLI startup works
- keep one subprocess regression that executes the real command shape used by package scripts or Docker init

## Observations

- [root-cause] Direct `python scripts/...` execution can fail even when app modules import fine elsewhere because script entrypoints change `sys.path`. #backend #scripts #sys-path
- [fix] Prefer `python -m scripts.<name>` from `backend/` so helper modules import `app.*` without `sys.path` hacks. #npm-run-dev #uv #python
- [testing] Keep one regression that executes the real command shape, not only the imported function. #testing #tooling

## Relations

- indexed_by [[Engineering Memory Index]]
- relates_to [[Repairing legacy local SQLite before dev]]
