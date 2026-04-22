---
title: API endpoint search rank report 2026-04-22
type: note
permalink: video-annotator/notes/api-endpoint-search-rank-report-2026-04-22
tags:
- audit
- api
- search
- retrieval
- ranking
---

# API endpoint search rank report 2026-04-22

This audit checks whether exact endpoint queries find the owning API memory note after feature-note cleanup removed `## Current State` from durable feature notes.

## Method

- tool: `search_notes`
- query shape: exact endpoint string such as `GET /api/videos/{video_id}/manifest`
- window: `page_size=10`
- correct note means route owner under `basic-memory/spec/api/`

## Summary

- correct note at rank `1`: `10 / 21`
- correct note at rank `2`: `4 / 21`
- correct note lower than `2`: `3 / 21`
- correct note missing from top `10`: `4 / 21`

Owner summary:

- `Videos API`: `0 / 6` at rank `1`; `4 / 6` miss top `10`
- `Annotations API`: `1 / 4` at rank `1`; other `3` land at rank `2`
- `Objects API`: `3 / 3` at rank `1`
- `SAM2 API`: `3 / 4` at rank `1`; `refine-mask` lands at rank `9`
- `Jobs API`: `2 / 2` at rank `1`
- `Export API`: `1 / 2` at rank `1`; create-export lands at rank `2`

## Results

| Query | Owning note | Rank | Top result |
| --- | --- | --- | --- |
| `GET /api/videos` | `Videos API` | `6` | `Video Ingest and Exact-Frame Review` |
| `GET /api/videos/{video_id}` | `Videos API` | `6` | `Video Ingest and Exact-Frame Review` |
| `GET /api/videos/{video_id}/source` | `Videos API` | `>10` | `Video Ingest and Exact-Frame Review` |
| `GET /api/videos/{video_id}/manifest` | `Videos API` | `>10` | `Annotation Foundation and Manual Box Workflow` |
| `GET /api/videos/{video_id}/frame/{frame_idx}` | `Videos API` | `>10` | `Video Ingest and Exact-Frame Review` |
| `GET /api/videos/{video_id}/objects/{object_id}/summary` | `Videos API` | `>10` | `Annotations API` |
| `GET /api/videos/{video_id}/annotations` | `Annotations API` | `1` | `Annotations API` |
| `GET /api/videos/{video_id}/annotations/frame/{frame_idx}` | `Annotations API` | `2` | `Annotation Foundation and Manual Box Workflow` |
| `PUT /api/videos/{video_id}/annotations/frame/{frame_idx}` | `Annotations API` | `2` | `Annotation Foundation and Manual Box Workflow` |
| `DELETE /api/videos/{video_id}/annotations/frame/{frame_idx}/object/{object_id}` | `Annotations API` | `2` | `Annotation Foundation and Manual Box Workflow` |
| `POST /api/videos/{video_id}/objects` | `Objects API` | `1` | `Objects API` |
| `PATCH /api/videos/{video_id}/objects/{object_id}` | `Objects API` | `1` | `Objects API` |
| `DELETE /api/videos/{video_id}/objects/{object_id}` | `Objects API` | `1` | `Objects API` |
| `POST /api/videos/{video_id}/sam2/session` | `SAM2 API` | `1` | `SAM2 API` |
| `POST /api/videos/{video_id}/sam2/prompt-box` | `SAM2 API` | `1` | `SAM2 API` |
| `POST /api/videos/{video_id}/sam2/refine-mask` | `SAM2 API` | `9` | `Mask Editing and Cleanup` |
| `POST /api/videos/{video_id}/sam2/propagate` | `SAM2 API` | `1` | `SAM2 API` |
| `GET /api/jobs/{job_id}` | `Jobs API` | `1` | `Jobs API` |
| `POST /api/jobs/{job_id}/cancel` | `Jobs API` | `1` | `Jobs API` |
| `POST /api/videos/{video_id}/export` | `Export API` | `2` | `Export` |
| `GET /api/exports/{export_id}` | `Export API` | `1` | `Export API` |

## Findings

- video-owned routes are still the weakest retrieval area by far
- feature notes still outrank route-owner notes on manifest and annotation-frame queries
- `Mask Editing and Cleanup` now dominates `refine-mask` search even though route ownership lives in `SAM2 API`
- removing `## Current State` from feature notes did not fix endpoint ranking; the bad route families stayed bad

## Observations

- [audit] Exact endpoint queries still do not reliably find the owning API note. #api #search #ranking
- [gap] `Videos API` remains hardest note to retrieve by exact route query. #api #videos #search
- [gap] Feature notes still outrank route-owner notes for several endpoint families. #feature #api #search
- [history] This note is a transient audit snapshot after feature-note cleanup, not durable route truth. #archive #history

## Relations

- relates_to [[API]]
- relates_to [[Videos API]]
- relates_to [[Annotations API]]
- relates_to [[Objects API]]
- relates_to [[SAM2 API]]
- relates_to [[Jobs API]]
- relates_to [[Export API]]
