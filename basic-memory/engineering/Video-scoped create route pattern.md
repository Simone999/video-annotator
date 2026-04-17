---
title: Video-scoped create route pattern
type: note
permalink: video-annotator/engineering/video-scoped-create-route-pattern
tags:
- engineering
- backend
- api
- patterns
---

# Video-scoped create route pattern

Milestone `US-003` added `POST /api/videos/{video_id}/objects` for explicit stable object creation. Useful pattern: keep the HTTP layer thin and push parent-row existence checks plus default field assignment into a tiny service module. In this repo, the route should not assemble ORM rows inline. Instead, the service checks whether the selected `Video` exists, returns `None` for missing parents, and centralizes backend-owned defaults before commit. The route then maps `None` to `404 {"detail": "Indexed video not found"}` and serializes the persisted row through the normal response schema.

This matters because later annotation-foundation routes are also video-scoped. Manual annotation upsert and delete should follow same seam: route handles HTTP contract, service owns DB writes and backend defaults, and tests can cover persistence through temp SQLite without dragging UI concerns into backend code.

Likely search queries:
- video scoped create route pattern
- object create 404 unknown video service
- backend service owns defaults not route

## Observations
- [pattern] Video-scoped create routes should verify parent `Video` existence inside a small backend service, not inline in the FastAPI route. #backend #api
- [pattern] Backend-owned defaults such as initial object `color` and `status` should live in the service module that persists the row, so route code stays transport-only. #backend #service-boundary
- [technique] API tests for create routes can assert both HTTP response and persisted SQLite row by re-opening the temp DB file after the request. #testing #sqlite

## Relations
- relates_to [[m-1: Annotation Foundation]]
- relates_to [[API]]
- relates_to [[Data Model]]
- relates_to [[Engineering Memory Index]]