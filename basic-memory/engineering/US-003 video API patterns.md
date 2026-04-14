---
title: US-003 video API patterns
type: note
permalink: video-annotator/engineering/us-003-video-api-patterns
tags:
- backend
- api
- testing
- milestone-01
---

# US-003 video API patterns

## Summary
Milestone-01 video catalog API now serves `GET /api/videos` and `GET /api/videos/{video_id}` from FastAPI with Pydantic response parsing at the route boundary.

## Learnings
- Use `APP_DB_URL` as the backend API test seam. Tests can point it at a temp SQLite file, seed rows with SQLAlchemy, and call `create_app()` without special route overrides.
- Keep route handlers thin. Put SQLAlchemy selects in small service modules like `video_catalog.py`, then convert ORM rows with `VideoResponse.model_validate(...)` before returning.
- Keep milestone-01 payload names aligned across ORM, docs, and future frontend code: `id`, `source_path`, `display_name`, `frame_count`, `fps`, `width`, `height`, `duration_seconds`.

## Related
- [[tools/ralph/progress]]
- [[docs/engineering/api]]