---
title: Add object-track delete and summary reset
type: note
permalink: video-annotator/tasks/add-object-track-delete-and-summary-reset
id: task-add-object-track-delete-and-summary-reset
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
- objects
---

# Add object-track delete and summary reset

## Creation Phase

### Description

Add whole-object track delete flow and reset summary/confidence truth after corrected-mask work.
Keep current review-route 1920x1080 direction from `docs/ui/video-review-1920x1080.png`. Use `docs/ui/video-review.html` as guide only, not strict contract.

Read first:
- [[Workflow]]
- [[Mask Editing and Cleanup]]
- [[Annotation Foundation and Manual Box Workflow]]
- [[SAM2 Shell and Runtime]]
- [[API]]
- `docs/ui/video-review-1920x1080.png`
- `docs/ui/video-review.html`
- `backend/app/services/object_tracks.py`
- `backend/app/services/review_summaries.py`
- `frontend/src/features/video-review/components/review-video-list-panel.tsx`
- `frontend/src/features/video-review/components/review-inspector-panel.tsx`

Stage-2 rule: in planning phase, write concrete test plan and implementation plan first. In execution, follow written plan. Before `done`, run own review plus 2 subagent reviews and fix actionable findings.

### Scope

- In scope: object-track delete path, corrected summary reset, confidence-reset wiring after corrections or deletes, and preserving current 1920x1080 review-route direction
- Out of scope: export behavior, import behavior, or redesigning current review-route shell

### Affected Features

- [[Mask Editing and Cleanup]]
- [[Annotation Foundation and Manual Box Workflow]]
- [[SAM2 Shell and Runtime]]

### Acceptance Criteria

- [x] Live review can delete one whole object track with clear scope and reload truth
- [x] Selected-object summary and confidence truth reset correctly after corrected or deleted mask state changes
- [x] Touched review UI keeps current 1920x1080 route direction from `docs/ui/video-review-1920x1080.png`; `docs/ui/video-review.html` stays guide only
- [x] Tests prove delete scope and summary reset behavior

### Test Intent

- Backend: integration coverage for object-track delete and summary-reset behavior
- Frontend: integration coverage for object delete action and inspector reset
- Manual: browser-check object delete and summary reset behavior on live review route at 1920x1080 against committed PNG truth

### Definition of Done

- [x] Planning phase records concrete tests and implementation plan before code
- [x] Own review is recorded; subagent review was not run because session policy forbids delegation without explicit user request
- [x] Relevant tests and quality checks pass
- [x] Feature notes, task note, and routing indexes are updated honestly when truth changes

## Planning Phase

### Planned Integration Tests
- Backend API: create two object tracks with frame annotations and persisted masks, delete one object track through `DELETE /api/videos/{video_id}/objects/{object_id}`, then prove deleted track and all linked frame annotations are gone while other object rows remain reloadable.
- Backend API: fetch selected-object summary before delete to prove corrected or confidence truth exists, delete selected object track, then prove deleted object summary returns `404` and surviving object summary still reports honest bbox or confidence or counters.
- Frontend integration: render live review with two objects, delete selected object track, then prove inspector falls back to surviving object, stale deleted-object label or confidence disappear, current frame reload drops deleted overlay, and object list count shrinks.

### Planned E2E Tests
- Browser: open seeded live review route at `1920x1080`, delete one selected object track, confirm current-frame overlay and object list reload to surviving truth without layout drift from committed PNG direction.

### Planned Implementation
- Backend:
  - add object-track delete service that deletes selected `ObjectTrack`, all linked `FrameAnnotation` rows, and any persisted mask PNG files for those rows
  - add `DELETE /api/videos/{video_id}/objects/{object_id}` route with explicit `404` mapping for missing video or object track
- Frontend:
  - add typed API client for object-track delete
  - refresh manifest truth after delete so selected-object fallback stays manifest-owned, then reload current canonical frame
  - expose controller action and clear-scope inspector affordance for deleting one whole object track
- State and summary:
  - rely on existing manifest fallback rule for next selected object or `null`
  - make inspector summary reset by changing selected object and current-frame annotations from reloaded backend truth, not local guesses

### Feature Matrix Updates
- Update `[[Mask Editing and Cleanup]]` and object API truth if whole-track delete contract ships.

## Execution Phase

### Implementation Notes
- Assumption: whole-track delete should delete object row and all linked frame-annotation rows, not convert rows to maskless leftovers.
- Assumption: selected-object fallback should stay manifest-driven; first surviving manifest object becomes selection, or `null` when none remain.
- Added backend whole-track delete service plus route that remove the selected `ObjectTrack`, all linked `FrameAnnotation` rows, and backing mask PNG files for those deleted rows.
- Added frontend API, workspace, controller, and inspector wiring so delete refetches manifest first, then reloads the current canonical frame and clears stale deleted-object summary state.
- Kept current review-route chrome intact and limited UI scope to a new inspector action plus error text.

## Wrap-Up Phase

### Verification

- Commands run:
- `uv run --project backend pytest backend/tests/unit/api/test_videos_routes.py backend/tests/integration/api/test_annotation_foundation_manual_box.py -k 'object_track_delete or object_track_delete_route'`
- `cd frontend && npx vitest run tests/unit/video-review/use-live-review-controller-object-delete.test.ts tests/unit/video-review/use-live-review-controller-mask-cleanup.test.ts tests/integration/video-review/live-review-screen.test.tsx -t 'whole-object delete|deletes selected object track|runs whole-object cleanup then reloads current frame'`
- `cd frontend && npx vitest run tests/unit/video-review/review-inspector-panel.test.tsx`
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- merged same-revision frontend coverage JSON shards with a local `istanbul-lib-coverage` node script after monolithic Vitest coverage OOMed
- `dev-browser --browser us035 --headless` on `http://127.0.0.1:5173/review/video-2d62649f3590f8d0`
- Results:
- Backend route and integration delete tests passed.
- Focused frontend controller, integration, and inspector tests passed.
- Lint passed.
- Typecheck passed.
- Backend coverage gate passed during `npm run test` with 141 tests green.
- Frontend monolithic coverage OOMed on this branch, so same-revision Vitest shard JSON outputs were merged; final merged frontend coverage passed at lines `95.10%` and branches `90.32%`.
- Browser proof passed. Object count changed from `1 OBJ` to `0 OBJ`, inspector reset to `No object selected`, and screenshot saved at `/home/simone/.dev-browser/tmp/us035-object-delete-browser.png`.

### Final Summary
- Shipped whole-track delete end to end across backend persistence, live-review state, inspector UI, and durable tracker notes.
- Delete now resets selected-object summary and confidence honestly by refetching manifest-owned object truth before reloading the current canonical frame.

### Completion Gate

- [x] Acceptance Criteria checkboxes updated to match reality
- [x] Definition of Done checkboxes updated to match reality
- [x] Only now may `status` change to `done`
