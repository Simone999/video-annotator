---
title: Manual frame annotation route pattern
type: note
permalink: video-annotator/engineering/manual-frame-annotation-route-pattern
tags:
- engineering
- backend
- api
- patterns
---

# Manual frame annotation route pattern

Milestone `US-004` added `PUT /api/videos/{video_id}/annotations/frame/{frame_idx}` plus `DELETE /api/videos/{video_id}/annotations/frame/{frame_idx}/object/{object_id}` for one-frame manual box persistence. Useful pattern: keep FastAPI layer thin and move all write rules into a tiny service module. The service must verify three ownership facts before any write: selected `Video` exists, canonical `frame_idx` is within that video's `frame_count`, and selected `ObjectTrack` exists for that same `video_id`.

Manual box persistence should upsert by `(video_id, frame_idx, object_id)` rather than minting duplicate rows for the same object on the same frame. In this repo, manual box writes are backend-owned truth, so the service also forces `source = "manual"` and clears `mask_path` plus `mask_rle`. That keeps manual box state explicit until later SAM2 or mask-edit flows generate persisted masks again.

Delete should stay equally narrow: remove only one object's row on one canonical frame, and return a not-found error when that exact row does not exist. API tests should assert both HTTP payload/status and fresh-SQLite persistence after create, update, reload, and delete.

Likely search queries:
- manual frame annotation route pattern
- upsert frame annotation by video frame object
- clear mask fields on manual box save

## Observations
- [pattern] Manual frame annotation routes should keep transport code thin and move video ownership, frame-range validation, and object ownership checks into one small backend service. #backend #api
- [pattern] Persist manual box writes by `(video_id, frame_idx, object_id)` so one object-frame pair updates in place instead of accumulating duplicates. #annotations #storage
- [guardrail] Manual box writes should force `source = "manual"` and clear any stored mask metadata; persisted masks belong to later SAM2 or mask-edit flows, not plain box saves. #annotations #masks
- [technique] API lifecycle coverage for manual annotation CRUD should assert request response, reopen SQLite in a fresh session to verify reload state, then delete and confirm the row is gone. #testing #sqlite

## Relations
- relates_to [[m-1: Annotation Foundation]]
- relates_to [[API]]
- relates_to [[Data Model]]
- relates_to [[Video-scoped create route pattern]]