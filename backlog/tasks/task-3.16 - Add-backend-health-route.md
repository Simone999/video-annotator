---
id: TASK-3.16
title: Add backend health route
status: Done
assignee: []
created_date: '2026-04-10 13:58'
updated_date: '2026-04-10 21:23'
labels:
  - milestone-0
  - backend
milestone: m-0
dependencies:
  - TASK-3.7
  - TASK-3.15
references:
  - backend/app/main.py
  - backend/app/api/
  - backend/app/schemas/
documentation:
  - docs/spec.md
  - docs/engineering/api-spec.md
parent_task_id: TASK-3
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Add a minimal backend smoke-test route for Milestone 0 so the FastAPI service can be launched and queried locally.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 The backend exposes a local health or hello-world route within the documented Milestone 0 API scope.
- [x] #2 The route returns a successful response suitable for smoke validation.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Add a minimal health response schema.
2. Add GET /api/health to the existing API router.
3. Keep the handler dependency-light and return the documented status payload only.
4. Verify with make format-check, make lint, make typecheck, and a TestClient smoke call.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Task is small; implementing directly without extra subagents.

Added GET /api/health on the existing API router with a typed HealthResponse payload of {"status": "ok"}.

Added httpx to backend dev dependencies so backend smoke checks can use HTTP tooling later.

Verified with make format-check, make lint, make typecheck, and UV_CACHE_DIR=/tmp/uv-cache uv run --group dev python -c "from app.main import app; route = next(route for route in app.routes if getattr(route, 'path', None) == '/api/health'); print(route.path, route.endpoint().model_dump())" in backend.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Added the documented Milestone 0 health endpoint at GET /api/health. The backend now exposes a minimal typed health response suitable for local smoke validation without touching later video or storage flows.
<!-- SECTION:FINAL_SUMMARY:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [x] #1 Run `make format-check`
- [x] #2 Run `make lint`
- [x] #3 Run `make typecheck`
- [x] #4 Run scoped tests or equivalent verification
<!-- DOD:END -->
