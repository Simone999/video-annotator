---
id: TASK-3.18
title: Implement video metadata extraction service
status: Done
assignee: []
created_date: '2026-04-10 13:59'
updated_date: '2026-04-10 21:32'
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
- [x] #1 The backend can inspect the committed sample video and derive fps total frames resolution and duration.
- [x] #2 The implementation keeps backend-decoded metadata as the canonical source and does not derive canonical frame identity from browser time.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Add a backend service that shells out to ffprobe for local video metadata.
2. Parse width, height, fps, frame_count, and duration_seconds from the primary video stream.
3. Represent extracted metadata in a typed backend model.
4. Verify against examples/bedroom.mp4 plus format/lint/typecheck.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Task uses ffprobe because it is available locally and keeps metadata extraction in the backend, not the browser.

Added an ffprobe-backed backend service in app/services/video_frames.py and a typed VideoMetadata schema.

Sample-video verification on examples/bedroom.mp4 produced fps=30.0, frame_count=200, width=960, height=540, duration_seconds=6.666667.

Verified with make format-check, make lint, make typecheck, and UV_CACHE_DIR=/tmp/uv-cache uv run --group dev python -c "from pathlib import Path; from app.services import extract_video_metadata; metadata = extract_video_metadata(Path('../examples/bedroom.mp4')); print(metadata.model_dump())" in backend.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Added the Milestone 0 backend video metadata extraction service. The backend can now inspect the committed sample video and derive fps, frame count, resolution, and duration from backend-side ffprobe inspection without relying on browser timing.
<!-- SECTION:FINAL_SUMMARY:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [x] #1 Run `make format-check`
- [x] #2 Run `make lint`
- [x] #3 Run `make typecheck`
- [x] #4 Run scoped tests or equivalent verification
<!-- DOD:END -->
