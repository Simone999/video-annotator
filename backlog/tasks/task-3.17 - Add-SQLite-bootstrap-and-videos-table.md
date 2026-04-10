---
id: TASK-3.17
title: Add SQLite bootstrap and videos table
status: Done
assignee: []
created_date: '2026-04-10 13:59'
updated_date: '2026-04-10 21:28'
labels:
  - milestone-0
  - backend
  - database
milestone: m-0
dependencies:
  - TASK-3.8
  - TASK-3.15
references:
  - backend/app/db/
  - backend/app/models/
  - backend/app/db/init_db.py
  - data/
documentation:
  - docs/spec.md
  - docs/engineering/data-model.md
  - docs/engineering/runbook.md
parent_task_id: TASK-3
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implement local SQLite initialization for Milestone 0 and create the initial videos table that will hold indexed video metadata.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 The application can create or open the local SQLite database in repository-owned storage.
- [x] #2 The initial videos table matches the documented Milestone 0 data model.
- [x] #3 Database initialization is safe to rerun locally without destructive side effects.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Add backend config for a repository-owned SQLite file under data/.
2. Add idempotent SQLite bootstrap code that creates the videos table with the documented schema.
3. Add minimal db/models package structure needed for this bootstrap.
4. Wire database initialization into backend startup without adding later video features.
5. Verify with make format-check, make lint, make typecheck, and a sqlite smoke check for the videos table.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Assumption for this task: use a concrete SQLite file inside data/ because the spec fixes the storage boundary but not the filename.

Added static backend config for a repository-owned SQLite file at data/video_annotator.db.

Added idempotent bootstrap code plus the documented videos table schema and wired bootstrap into FastAPI lifespan startup.

Verified with make format-check, make lint, make typecheck, and UV_CACHE_DIR=/tmp/uv-cache uv run --group dev python -c "import sqlite3; from app.core import DATABASE_PATH; from app.db import initialize_database; initialize_database(); initialize_database(); connection = sqlite3.connect(DATABASE_PATH); row = connection.execute(\"SELECT name FROM sqlite_master WHERE type='table' AND name='videos'\").fetchone(); connection.close(); print(DATABASE_PATH, row[0])" in backend.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Added Milestone 0 SQLite bootstrap for the backend. The backend now creates or opens a repository-owned database under data/, applies the initial videos table schema idempotently, and wires initialization into application startup without adding later milestone tables or behaviors.
<!-- SECTION:FINAL_SUMMARY:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [x] #1 Run `make format-check`
- [x] #2 Run `make lint`
- [x] #3 Run `make typecheck`
- [x] #4 Run scoped tests or equivalent verification
<!-- DOD:END -->
