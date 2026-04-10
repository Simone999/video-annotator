---
id: TASK-3.19
title: Add video indexing API and persistence flow
status: Done
assignee: []
created_date: '2026-04-10 13:59'
updated_date: '2026-04-10 21:36'
labels:
  - milestone-0
  - backend
  - video
milestone: m-0
dependencies:
  - TASK-3.7
  - TASK-3.8
  - TASK-3.17
  - TASK-3.18
references:
  - backend/app/api/videos.py
  - backend/app/schemas/video.py
  - backend/app/models/video.py
  - examples/bedroom.mp4
documentation:
  - docs/spec.md
  - docs/engineering/api-spec.md
  - docs/engineering/data-model.md
parent_task_id: TASK-3
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Connect the Milestone 0 video metadata extraction service to the documented API and persist the indexed metadata to the videos table, including error handling for invalid or missing inputs.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 The indexing API returns fps total frames resolution and duration for a local video within the documented Milestone 0 contract.
- [x] #2 Indexed metadata is persisted to SQLite using the documented videos table.
- [x] #3 Invalid or missing video inputs are handled within documented Milestone 0 scope.
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Added SQLite video persistence helpers plus Milestone 0 API routes for POST /api/videos/index, GET /api/videos, and GET /api/videos/{video_id}.

Indexing the sample video returns and persists vid_001, list/get routes read the same record back, and duplicate indexing returns the existing record.

Verified with make format-check, make lint, make typecheck, and a backend smoke script that exercised valid indexing, list/get reads, registered paths, and 400/404 error cases.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Connected the backend metadata extraction service to the documented Milestone 0 API and SQLite persistence flow. The backend now indexes a local video, persists canonical metadata in the videos table, returns existing records for duplicate paths, serves the indexed catalog and single-video metadata routes, and handles invalid or missing inputs within the documented error scope.
<!-- SECTION:FINAL_SUMMARY:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [x] #1 Run `make format-check`
- [x] #2 Run `make lint`
- [x] #3 Run `make typecheck`
- [x] #4 Run scoped tests or equivalent verification
<!-- DOD:END -->
