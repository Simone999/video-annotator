---
id: TASK-3.15
title: Scaffold FastAPI app and startup entrypoint
status: Done
assignee: []
created_date: '2026-04-10 13:58'
updated_date: '2026-04-10 21:20'
labels:
  - milestone-0
  - backend
milestone: m-0
dependencies:
  - TASK-3.7
  - TASK-3.8
references:
  - backend/pyproject.toml
  - backend/app/main.py
  - backend/app/api/
  - backend/app/core/
  - backend/app/schemas/
documentation:
  - docs/spec.md
  - AGENTS.md
parent_task_id: TASK-3
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create the Milestone 0 backend application scaffold with FastAPI app startup and package structure aligned to the planned architecture.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 The backend project contains a FastAPI app entrypoint and the package layout needed for API core and schema modules.
- [x] #2 The scaffold stays within Milestone 0 scope and does not introduce later product features.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Add minimal FastAPI runtime dependency and lockfile update.
2. Create backend app entrypoint with create_app() and app = create_app().
3. Add package placeholders for api, core, and schemas.
4. Include an empty /api router prefix without feature routes.
5. Update backend README to reflect the scaffold.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Added FastAPI as a runtime dependency and updated uv.lock.

Created backend/app/main.py plus placeholder api, core, and schemas packages, with an empty /api router prefix.

Verified with make format-check, make lint, make typecheck, and UV_CACHE_DIR=/tmp/uv-cache uv run python -c "from app.main import app; print(app.title)" in backend.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Added the Milestone 0 FastAPI scaffold for the backend. The backend now has an application entrypoint, package placeholders for API/core/schemas, an empty /api router prefix, updated dependency metadata, and README text aligned with the new scaffold.
<!-- SECTION:FINAL_SUMMARY:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [x] #1 Run `make format-check`
- [x] #2 Run `make lint`
- [x] #3 Run `make typecheck`
- [x] #4 Run scoped tests or equivalent verification
<!-- DOD:END -->
