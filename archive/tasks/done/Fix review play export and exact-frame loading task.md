---
title: Fix review play export and exact-frame loading task
type: note
permalink: video-annotator/tasks/fix-review-play-export-and-exact-frame-loading-task
id: task-fix-review-play-export-and-exact-frame-loading-task
status: done
created: 2026-04-27
steps:
- creation
- planning
- execution
- wrap_up
tags:
- task
- frontend
- backend
- review
- export
- playback
---

# Fix review play export and exact-frame loading task

## Creation Phase

### Description

Fix three still-broken review behaviors: play from paused exact frame, paused-frame flash during exact-frame loads, and misleading split export flow.

### Scope

- In scope: review stage media state cleanup, exact-frame load hold behavior, one-button export UI, no-body export route, tests, docs, and durable notes.
- Out of scope: new playback model, stop button, propagation redesign, export artifact content redesign, and unrelated review style polish.

### Affected Features

- [[Video Ingest and Exact-Frame Review]]
- [[Export]]

### Acceptance Criteria

- [x] play works when user presses play from paused exact-frame review state
- [x] paused frame navigation keeps old exact frame visible until target exact frame is ready
- [x] exact-frame stale responses cannot revive old target after a newer request wins
- [x] review UI exposes one `Export` button and honest full-package copy
- [x] export create route accepts no body and returns stable `export_id`

### Test Intent

- Backend: export route integration and unit route coverage for no-body create flow.
- Frontend: unit and integration coverage for play from paused exact frame, hold-old-frame behavior, and single export button flow.
- Manual: none planned first pass.

### Definition of Done

- [x] Relevant frontend and backend tests pass
- [x] Typecheck and lint pass or blockers are recorded honestly
- [x] Task wrap-up records exact commands and results
- [x] Durable docs and memory updated for changed behavior and contracts

## Planning Phase

### Planned Integration Tests

- Frontend: review export flow and review stage rendering.
- Backend: export route create and download flow.

### Planned E2E Tests

- None first pass.

### Planned Implementation

- Step 1: add red frontend tests for play from paused exact-frame state and hold-old-frame rendering during paused frame load.
- Step 2: add red export tests for one-button frontend flow and no-body backend route.
- Step 3: implement review stage state cleanup and exact-frame request sequencing.
- Step 4: implement export API and UI cleanup.
- Step 5: update docs and durable memory, then run focused verification.

## Execution Phase

### Implementation Notes

- Frontend stage now keeps playback `<video>` mounted even when paused exact frame is visible.
- Paused exact-frame rendering now keeps old exact frame on screen while next exact-frame request is loading.
- Exact-frame hook now ignores stale responses from older requests that resolve after a newer request.
- Public export flow is now one button and one route contract: full package only, no request body.
- Export docs and durable notes were updated to remove old public option-pair wording.

## Wrap-Up Phase

### Verification

- Commands run:
  - `npm exec --workspace frontend vitest run tests/unit/video-review/review-surface-panel.test.tsx tests/unit/video-review/use-exact-frame.test.tsx tests/unit/video-review/api.test.ts tests/unit/video-review/review-inspector-panel.test.tsx tests/unit/video-review/use-live-review-controller.test.ts tests/integration/video-review/export-ui-flow.test.tsx --coverage.enabled=false`
  - `uv run --project backend pytest backend/tests/integration/api/test_export_api.py backend/tests/unit/api/test_videos_routes.py -k 'export'`
  - `uv run --project backend pytest backend/tests/integration/api/test_export_api.py backend/tests/unit/api/test_videos_routes.py`
  - `npm run typecheck`
  - `npm exec --workspace frontend eslint src/features/video-review/api.ts src/features/video-review/components/review-inspector-panel.tsx src/features/video-review/components/review-surface-panel.tsx src/features/video-review/hooks/use-exact-frame.ts src/features/video-review/hooks/use-live-review-controller.ts tests/unit/video-review/api.test.ts tests/unit/video-review/review-inspector-panel.test.tsx tests/unit/video-review/review-surface-panel.test.tsx tests/unit/video-review/use-exact-frame.test.tsx tests/unit/video-review/use-live-review-controller.test.ts tests/integration/video-review/export-ui-flow.test.tsx`
  - `npm run lint`
- Results:
  - Focused frontend verification passed: `6` files, `32` tests.
  - Focused backend export subset passed: `3 passed, 9 deselected`.
  - Full touched backend route files passed: `12 passed`.
  - Typecheck passed for backend pyright and frontend `tsc`.
  - Focused frontend eslint passed.
  - Full repo lint still fails on unrelated pre-existing backend file `backend/tests/unit/services/test_review_summaries.py` from import ordering and long line drift.

### Final Summary

- Fixed review play failure by keeping playback media mounted behind paused exact-frame UI.
- Fixed paused frame flash by holding old exact frame until the next exact-frame response wins and by ignoring stale older responses.
- Collapsed public export flow to one honest full-package route and one review button, while keeping immediate download plus fallback link.

### Completion Gate

- [x] Acceptance Criteria checkboxes updated to match reality
- [x] Definition of Done checkboxes updated to match reality
- [x] Only now may `status` change to `done`
