---
id: TASK-3.19
title: Add video indexing API and persistence flow
status: To Do
assignee: []
created_date: '2026-04-10 13:59'
updated_date: '2026-04-10 14:00'
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
- [ ] #1 The indexing API returns fps total frames resolution and duration for a local video within the documented Milestone 0 contract.
- [ ] #2 Indexed metadata is persisted to SQLite using the documented videos table.
- [ ] #3 Invalid or missing video inputs are handled within documented Milestone 0 scope.
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Run `make format-check`
- [ ] #2 Run `make lint`
- [ ] #3 Run `make typecheck`
- [ ] #4 Run scoped tests or equivalent verification
<!-- DOD:END -->
