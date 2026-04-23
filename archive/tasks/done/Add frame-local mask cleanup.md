---
title: Add frame-local mask cleanup
type: note
permalink: video-annotator/tasks/add-frame-local-mask-cleanup
id: task-add-frame-local-mask-cleanup
status: done
completed: 2026-04-23
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

# Add frame-local mask cleanup

## Creation Phase

### Description

Add frame-local mask cleanup so one bad mask can disappear without deleting unrelated annotation rows.
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

- In scope: one-frame cleanup backend route or service, frontend action, reopen proof, and preserving current 1920x1080 review-route direction
- Out of scope: whole-object cleanup, object-track delete, or redesigning current review-route shell

### Affected Features

- [[Mask Editing and Cleanup]]

### Acceptance Criteria

- [x] One-frame cleanup removes only target frame mask data and preserves unrelated rows
- [x] Live review exposes frame-local cleanup with clear scope copy
- [x] Touched review UI keeps current 1920x1080 route direction from `docs/ui/video-review-1920x1080.png`; `docs/ui/video-review.html` stays guide only
- [x] Tests prove current frame changes without adjacent-frame corruption

### Test Intent

- Backend: integration coverage for one-frame cleanup scope
- Frontend: integration coverage for frame-local cleanup action and reload
- Manual: browser-check one-frame cleanup scope on live review route at 1920x1080 against committed PNG truth

### Definition of Done

- [x] Planning phase records concrete tests and implementation plan before code
- [x] Own review plus 2 subagent reviews are recorded and actionable findings are fixed
- [x] Relevant tests and quality checks pass
- [x] Feature notes, task note, and routing indexes are updated honestly when truth changes

## Planning Phase

### Planned Integration Tests

- Backend: add API integration coverage in `backend/tests/integration/api/test_sam2_shell_runtime.py` that seeds same object with masks on frame `7` and `8`, deletes mask only on frame `7`, then proves:
  - frame `7` row still exists with same box and `mask = null`
  - frame `8` row still keeps original mask path
  - deleted frame mask endpoint returns `404`
- Backend: add route-mapping unit coverage in `backend/tests/unit/api/test_videos_routes.py` for one-frame cleanup success plus `404` mapping when no saved mask exists
- Frontend: add API client coverage in `frontend/tests/unit/video-review/api.test.ts` for one-frame cleanup `DELETE` request path
- Frontend: extend `frontend/tests/integration/video-review/live-review-screen.test.tsx` to click new frame-local cleanup action, assert scope copy, assert current-frame mask disappears, and assert reload keeps adjacent frame mask intact
- Frontend: keep existing manual-box delete coverage separate so mask-only cleanup does not get confused with full annotation-row delete

### Planned E2E Tests

- Manual: open seeded `/review/:videoId` route at 1920x1080, use current-frame mask cleanup on one saved mask, confirm current frame loses only mask overlay while neighboring frame mask remains, and compare touched layout against committed `docs/ui/video-review-1920x1080.png`

### Planned Implementation

- Backend: add one-frame mask cleanup service in `backend/app/services/frame_annotations.py` that clears only `mask_path`, `mask_rle`, and `mask_confidence` on existing masked row while preserving object, frame, source, keyframe, and box truth
- Backend: expose cleanup route from `backend/app/api/videos.py` under frame/object annotation path, reusing existing `FrameAnnotationNotFoundError` mapping
- Frontend: add typed API helper for frame-local mask cleanup, then wire workspace action in `frontend/src/features/video-review/hooks/use-sam2-workspace.ts` and reducer support in `frontend/src/features/video-review/state.ts`
- Frontend: add one new inspector action in `frontend/src/features/video-review/components/review-inspector-panel.tsx` with clear one-frame scope copy, reusing paused-only mutation guard and current-frame reload path
- Frontend: keep review-route structure and 1920x1080 direction intact; no shell redesign

### Feature Matrix Updates

- Update `basic-memory/features/Mask Editing and Cleanup.md` when frame-local cleanup ships
- Update supporting API and engineering docs under `docs/` for new mask-cleanup route or contract language if backend surface changes

## Execution Phase

### Implementation Notes

- 2026-04-23: Task activated from Ralph backlog. TDD order: backend route contract first, frontend client plus interaction second, then verification and note sync.
- Backend route added under frame or object annotation path and clears only current-frame mask fields when box truth exists.
- Cleanup semantics changed after backend review finding: propagated mask-only rows must be deleted instead of zeroed, or selected-summary counters keep ghost propagated frames.
- Frontend inspector adds `Clear frame mask` with explicit one-frame scope copy and local error handling.
- Frontend cleanup action now disables while refine save is in flight, fixing the race found in subagent review.
- Own review plus 2 subagent reviews completed. Actionable findings fixed:
  - backend review found stale summary counts for propagated mask-only rows
  - frontend review found cleanup or refine race during in-flight save

## Wrap-Up Phase

### Verification

- Commands run:
- `uv run --project backend pytest backend/tests/unit/api/test_videos_routes.py -q`
- `uv run --project backend pytest backend/tests/integration/api/test_sam2_shell_runtime.py -q`
- `cd frontend && npx vitest run tests/unit/video-review/api.test.ts tests/unit/video-review/state.test.ts tests/unit/video-review/workspace.test.ts tests/unit/video-review/use-live-review-controller.test.ts tests/integration/video-review/live-review-screen.test.tsx`
- `npm run lint`
- `npm run typecheck`
- `npm run test:backend:coverage`
- six raw frontend coverage shards from `frontend/`, merged with `istanbul-lib-coverage` on same revision
- `dev-browser --browser us032-frame-cleanup-final --headless` against seeded `/review/video-2d62649f3590f8d0`
- Results:
- targeted backend and frontend tests passed
- `npm run lint` passed
- `npm run typecheck` passed
- backend coverage gate passed with `97.56%` statements and `92.08%` branches
- merged frontend coverage shards passed with `94.41%` lines and `90.03%` branches
- browser verification passed: frame `7` lost only current-frame mask, frame `8` still showed mask; screenshot saved at `/home/simone/.dev-browser/tmp/us032-frame-local-cleanup-browser.png`

### Final Summary

Shipped frame-local mask cleanup across backend route, workspace state, and review inspector UI. Current-frame cleanup now removes only the selected frame mask, preserves adjacent-frame truth, preserves box-backed rows, deletes propagated mask-only rows to keep summary truth honest, and blocks cleanup while refine save is still running.

### Completion Gate

- [x] Acceptance Criteria checkboxes updated to match reality
- [x] Definition of Done checkboxes updated to match reality
- [x] Only now may `status` change to `done`
