---
title: Add whole-object mask cleanup
type: note
permalink: video-annotator/tasks/add-whole-object-mask-cleanup
id: task-add-whole-object-mask-cleanup
status: done
completed:
steps:
- creation
- planning
- execution
- wrap_up
tags:
- task
- backend
- frontend
- m-4
- cleanup
---

# Add whole-object mask cleanup

## Creation Phase

### Description

Add whole-object mask cleanup so one object can lose masks across frames without touching other objects.
Keep current review-route 1920x1080 direction from `docs/ui/video-review-1920x1080.png`. Use `docs/ui/video-review.html` as guide only, not strict contract.

Read first:
- [[Workflow]]
- [[Mask Editing and Cleanup]]
- [[API]]
- [[Data Model]]
- `docs/ui/video-review-1920x1080.png`
- `docs/ui/video-review.html`
- `backend/app/services/frame_annotations.py`
- `backend/app/api/videos.py`
- `frontend/src/features/video-review/components/review-inspector-panel.tsx`

Stage-2 rule: in planning phase, write concrete test plan and implementation plan first. In execution, follow written plan. Before `done`, run own review plus 2 subagent reviews and fix actionable findings.

### Scope

- In scope: whole-object cleanup backend route or service, frontend action, multi-frame reopen proof, and preserving current 1920x1080 review-route direction
- Out of scope: object-track delete, export behavior, or redesigning current review-route shell

### Affected Features

- [[Mask Editing and Cleanup]]

### Acceptance Criteria

- [x] Whole-object cleanup removes mask data only for selected object across frames
- [x] Live review exposes whole-object cleanup with clear scope copy
- [x] Touched review UI keeps current 1920x1080 route direction from `docs/ui/video-review-1920x1080.png`; `docs/ui/video-review.html` stays guide only
- [x] Tests prove unrelated object rows stay intact after cleanup

### Test Intent

- Backend: integration coverage for whole-object cleanup scope
- Frontend: integration coverage for whole-object cleanup action and reload
- Manual: browser-check whole-object cleanup scope on live review route at 1920x1080 against committed PNG truth

### Definition of Done

- [x] Planning phase records concrete tests and implementation plan before code
- [x] Own review plus 2 subagent reviews are recorded and actionable findings are fixed
- [x] Relevant tests and quality checks pass
- [x] Feature notes, task note, and routing indexes are updated honestly when truth changes

## Planning Phase

### Planned Integration Tests
- Backend integration in `backend/tests/integration/api/test_sam2_shell_runtime.py`:
  - seed two objects on one video
  - create selected object keyframe mask plus propagated mask-only row on later frame
  - create unrelated object masks on same frames
  - call whole-object cleanup route for selected object
  - assert selected object current-frame row keeps box truth with `mask: null`
  - assert selected object propagated mask-only row is gone on later frame
  - assert unrelated object mask rows still reopen unchanged
- Frontend integration in `frontend/tests/integration/video-review/live-review-screen.test.tsx`:
  - render selected object with current-frame mask and later-frame propagated mask
  - click whole-object cleanup button
  - assert current frame refresh removes selected object mask
  - jump to later frame and assert selected object mask stays gone
  - assert unrelated object mask still renders on affected frames

### Planned E2E Tests
- Browser check on seeded review route:
  - open live review at 1920x1080 route
  - trigger whole-object cleanup for selected object
  - verify current-frame selected mask disappears
  - verify later frame for same object stays clear
  - verify other object mask remains

### Planned Implementation
- Backend:
  - add object-scoped cleanup service in `backend/app/services/frame_annotations.py` by reusing existing per-row clear-or-delete semantics
  - export service from `backend/app/services/__init__.py`
  - add delete route in `backend/app/api/videos.py`
- Frontend:
  - add object-scoped cleanup request in `frontend/src/features/video-review/api.ts`
  - add workspace method in `frontend/src/features/video-review/hooks/use-sam2-workspace.ts` and `frontend/src/features/video-review/workspace.ts`
  - add controller guard or handler that reuses paused-only mutation rule and reloads current frame after success
  - add inspector copy and button beside frame-local cleanup without redesigning panel

### Feature Matrix Updates
- Update [[Mask Editing and Cleanup]] only if shipped contract wording changes beyond current placeholder `whole-object mask cleanup route`.

## Execution Phase

### Implementation Notes
- Added backend whole-object cleanup route and service by reusing existing row-level mask clear-or-delete semantics for each selected-object annotation row with persisted mask data.
- Added frontend object-scope cleanup request, workspace method, controller handler, and inspector scope copy plus button so live review can clear one object's masks across frames without redesigning current route.
- Whole-object cleanup now reloads current canonical frame after delete so review state shows honest difference between cleared keyframe rows and deleted propagated mask-only rows.

## Wrap-Up Phase

### Verification

- Commands run:
- `npm run lint`
- `npm run typecheck`
- `npm run test:backend:coverage`
- `cd frontend && npx vitest run tests/unit/video-review/api.test.ts tests/unit/video-review/use-live-review-controller-mask-cleanup.test.ts tests/integration/video-review/live-review-screen.test.tsx -t 'whole-object mask cleanup|whole-object cleanup|clears selected object masks across frames without touching other objects'`
- `dev-browser --browser us033 --headless` on `http://127.0.0.1:5173/review/video-2d62649f3590f8d0`
- Results:
- Lint passed.
- Typecheck passed.
- Backend coverage gate passed at statements `97.48%` and branches `91.44%`.
- Focused frontend API, controller, and live-review integration shards passed.
- Browser proof passed. Selected object `browser_cleanup_target` lost masks on frames `7` and `8`, unrelated object `browser_cleanup_keep` kept masks on both frames, screenshot saved at `/home/simone/.dev-browser/tmp/us033-whole-object-cleanup-browser.png`.

### Final Summary
- Shipped object-scoped mask cleanup end to end across backend persistence, live-review UI, durable docs, and Ralph tracker files.
- Whole-object cleanup preserves unrelated object rows and reuses existing frame-local row contract instead of inventing separate cleanup state.

### Completion Gate

- [x] Acceptance Criteria checkboxes updated to match reality
- [x] Definition of Done checkboxes updated to match reality
- [x] Only now may `status` change to `done`
