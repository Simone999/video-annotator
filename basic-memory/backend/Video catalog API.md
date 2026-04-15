---
title: Video catalog API
type: note
permalink: video-annotator/backend/video-catalog-api
tags:
- backend
- api
- videos
---

# Video catalog API

This note answers what the catalog endpoints return and how the backend keeps
their response shape stable. The catalog endpoints are the source of truth for
the indexed video list and for per-video metadata used by the review workspace.

The contract is intentionally small. `GET /api/videos` returns all indexed
videos. `GET /api/videos/{video_id}` returns one indexed video or `404` if the
id is unknown. The payload shape stays aligned across ORM models, API docs, and
frontend parsing so the review workspace can trust one consistent metadata
schema.

## Observations
- [api] `GET /api/videos` returns indexed videos with `id`, `source_path`, `display_name`, `fps`, `frame_count`, `width`, `height`, and `duration_seconds`. #backend #api
- [api] `GET /api/videos/{video_id}` returns the same metadata shape for one indexed video and `404` when the id is unknown. #backend #api
- [pattern] Keep route handlers thin, move selects into a small service module, and convert ORM rows with `VideoResponse.model_validate(...)` at the route boundary. #fastapi #pydantic
- [constraint] `source_path` is persisted backend metadata, not a browser-safe playback URL. #playback #metadata

## Relations
- relates_to [[Playback pane contract]]
- relates_to [[Backend API test database seam]]
- relates_to [[Startup indexing]]
