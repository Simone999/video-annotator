---
id: TASK-3.18
title: Implement video metadata extraction service
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
  - TASK-3.8
  - TASK-3.15
references:
  - backend/app/services/video_frames.py
  - examples/bedroom.mp4
documentation:
  - docs/spec.md
  - AGENTS.md
  - docs/engineering/data-model.md
parent_task_id: TASK-3
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implement the backend service that inspects a local video and derives the canonical metadata required by Milestone 0: fps total frames resolution and duration.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 The backend can inspect the committed sample video and derive fps total frames resolution and duration.
- [ ] #2 The implementation keeps backend-decoded metadata as the canonical source and does not derive canonical frame identity from browser time.
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Run `make format-check`
- [ ] #2 Run `make lint`
- [ ] #3 Run `make typecheck`
- [ ] #4 Run scoped tests or equivalent verification
<!-- DOD:END -->
