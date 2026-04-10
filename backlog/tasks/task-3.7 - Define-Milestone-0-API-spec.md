---
id: TASK-3.7
title: Define Milestone 0 API spec
status: Done
assignee:
  - codex
created_date: '2026-04-10 13:57'
updated_date: '2026-04-10 14:44'
labels:
  - milestone-0
  - docs
  - backend
milestone: m-0
dependencies:
  - TASK-3.4
  - TASK-3.5
  - TASK-3.6
references:
  - docs/engineering/api-spec.md
documentation:
  - docs/spec.md
  - docs/product/requirements.md
  - docs/engineering/runbook.md
parent_task_id: TASK-3
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Write the Milestone 0 API contract for the backend health route and video indexing flow, including request and response shapes, documented errors, and explicit placeholders for later streaming behavior.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 The API spec defines the Milestone 0 route set needed for backend health and video indexing.
- [x] #2 The document includes request and response examples plus documented error behavior within Milestone 0 scope.
- [x] #3 Deferred streaming or later-milestone API behavior is called out explicitly instead of implied.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Create `docs/engineering/api-spec.md` as the Milestone 0 API contract.
2. Document the approved Milestone 0 route set only: `GET /api/health`, `POST /api/videos/index`, `GET /api/videos`, and `GET /api/videos/{video_id}`.
3. For each route, include purpose, request and response examples, and Milestone 0 error behavior.
4. Call out deterministic backend indexing constraints and the rule that canonical frame identity belongs to backend decoding rather than browser time.
5. Add an explicit deferred section for later-milestone APIs: frame image, manifest, thumbnails, annotations, SAM2, export, jobs, and streaming progress.
6. Update `docs/engineering/README.md` so the API spec is discoverable.
7. Keep scope to this API spec task; do not fold unrelated stale-doc cleanup into this change.
8. Verify with `make format-check`, `make lint`, and `make typecheck`.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
User approved using `GET /api/health` and `POST /api/videos/index` for the Milestone 0 API spec.

Created `docs/engineering/api-spec.md` for the approved Milestone 0 route set and linked it from `docs/engineering/README.md`.

Verified on final state with `make format-check`, `make lint`, and `make typecheck`.

Equivalent scoped verification for this docs-only task was reviewer approval against `docs/spec.md` plus direct inspection of the new API spec.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Added `docs/engineering/api-spec.md` as the Milestone 0 backend API contract and linked it from `docs/engineering/README.md`. The new spec documents the approved Milestone 0 route set only: `GET /api/health`, `POST /api/videos/index`, `GET /api/videos`, and `GET /api/videos/{video_id}`. It includes request and response examples, Milestone 0 error behavior, deterministic backend indexing constraints, and an explicit deferred section for later-milestone APIs.

Verification:
- `make format-check`
- `make lint`
- `make typecheck`
- Reviewer approval against `docs/spec.md` for the final document state
<!-- SECTION:FINAL_SUMMARY:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [x] #1 Run `make format-check`
- [x] #2 Run `make lint`
- [x] #3 Run `make typecheck`
- [x] #4 Run scoped tests or equivalent verification
<!-- DOD:END -->
