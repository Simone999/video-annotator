---
title: Frame annotation CRUD API
type: note
permalink: video-annotator/backend/frame-annotation-crud-api
tags:
- backend
- api
- annotations
- testing
---

# Frame annotation CRUD API

Milestone-02 adds the backend contract for exact-frame annotation persistence. The important part is that every request stays anchored to the backend-owned `frame_idx` and to the durable row key `(video_id, frame_idx, object_id)`. The API now exposes a video-wide read, a frame-scoped read, a frame-scoped upsert, and an object-scoped delete.

The write semantics are intentionally narrow. `PUT /api/videos/{video_id}/annotations/frame/{frame_idx}` only creates or updates the object rows listed in the request body. It does not replace the whole frame and it must not be used as an implicit delete. Deletion is explicit through `DELETE /api/videos/{video_id}/annotations/frame/{frame_idx}/object/{object_id}` so later UI stories can edit one object without clobbering siblings on the same frame.

## Observations
- [decision] Frame-annotation API handlers validate `video_id` and canonical `frame_idx` before any CRUD operation. #backend #frames
- [decision] `box_xywh_norm` is parsed at the Pydantic boundary as exactly four normalized values in `[0.0, 1.0]`. #api #validation
- [decision] Frame upsert is additive for the listed `object_id` rows and does not imply deletion of other objects on the same frame. #annotations #persistence
- [technique] API integration tests can prove persistence across clean app instances by rebuilding `TestClient` against the same temp SQLite file after clearing cached engine/session factories. #testing #sqlite
- [pattern] Video-wide annotation reads should sort by `frame_idx` then `object_id`, while frame-scoped reads sort by `object_id` for deterministic reloads. #api #determinism

## Relations
- relates_to [[FrameAnnotation row constraints]]
- relates_to [[Backend API test database seam]]
- relates_to [[Exact frame API]]
- extends [[Video catalog API]]