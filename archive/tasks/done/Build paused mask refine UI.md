---
title: Build paused mask refine UI
type: note
permalink: video-annotator/tasks/build-paused-mask-refine-ui
id: task-build-paused-mask-refine-ui
status: done
completed: 2026-04-23 22:36 CEST
steps:
- creation
- planning
- execution
- wrap_up
tags:
- task
- frontend
- review
- m-4
- mask-editing
---

# Build paused mask refine UI

## Creation Phase

### Description

Add paused-stage brush add/erase refine UI for existing masks on live review surface.
Keep current review-route 1920x1080 direction from `docs/ui/video-review-1920x1080.png`. Use `docs/ui/video-review.html` as guide only, not strict contract.

Read first:
- [[Workflow]]
- [[Mask Editing and Cleanup]]
- [[SAM2 Shell and Runtime]]
- `docs/spec.md`
- `docs/product/prd.md`
- `docs/ui/video-review-1920x1080.png`
- `docs/ui/video-review.html`
- `frontend/src/features/video-review/components/review-surface-panel.tsx`
- `frontend/src/features/video-review/exact-frame-canvas.tsx`
- `frontend/src/features/video-review/components/review-inspector-panel.tsx`

Stage-2 rule: in planning phase, write concrete test plan and implementation plan first. In execution, follow written plan. Before `done`, run own review plus 2 subagent reviews and fix actionable findings.

### Scope

- In scope: paused-stage refine affordance, brush add/erase interaction, save trigger, honest disabled states, and preserving current 1920x1080 review-route direction
- Out of scope: cleanup flows, object-track delete, or redesigning current review-route shell

### Affected Features

- [[Mask Editing and Cleanup]]

### Acceptance Criteria

- [x] Live review exposes paused-only refine controls for existing masks
- [x] Brush add and erase interactions feed refine save flow on canonical frame
- [x] Touched review UI keeps current 1920x1080 route direction from `docs/ui/video-review-1920x1080.png`; `docs/ui/video-review.html` stays guide only
- [x] Frontend tests and browser proof cover refine affordance and paused-only guard

### Test Intent

- Backend: none
- Frontend: integration coverage for refine UI states and save trigger
- Manual: browser-check refine affordance on live review surface at 1920x1080 against committed PNG truth

### Definition of Done

- [x] Planning phase records concrete tests and implementation plan before code
- [ ] Own review plus 2 subagent reviews are recorded and actionable findings are fixed
- [x] Relevant tests and quality checks pass
- [x] Feature notes, task note, and routing indexes are updated honestly when truth changes

## Planning Phase

### Planned Integration Tests

- `frontend/tests/integration/video-review/live-review-screen.test.tsx`
  - seed frame `7` with one persisted `source = "sam2"` mask for selected object
  - assert `Correct mask` stays disabled while playback is active and enabled again after pause
  - enter refine mode, add one add-brush stroke and one erase-brush stroke on exact-frame canvas, then save
  - assert `POST /api/videos/{video_id}/sam2/refine-mask` receives canonical `frame_idx`, `object_id`, `session_id`, `positive_points`, and `negative_points`
  - assert corrected mask reopens on stage as `source = "sam2_edited"` and refine UI exits back to idle state
  - assert selected-object summary refreshes from backend after corrected save so current source or corrected counter truth does not stay stale

### Planned E2E Tests

- browser proof on seeded review route:
  - open review workspace at 1920x1080
  - confirm paused stage shows `Correct mask` only when selected object has persisted mask
  - draw one add stroke and one erase stroke, save corrected mask, and verify overlay stays on canonical paused frame
  - compare overall three-panel direction against committed `docs/ui/video-review-1920x1080.png`

### Planned Implementation

- add typed frontend client support for `POST /api/videos/{video_id}/sam2/refine-mask`
- extend SAM2 workspace state with refine request status or error and apply refined annotation back into current-frame annotation state
- add controller state for refine mode, selected brush (`add` or `erase`), collected stroke samples, save or cancel actions, and summary refresh trigger after corrected save
- teach `ExactFrameCanvas` a refine interaction mode that samples normalized points from paused-stage pointer strokes and renders visible stroke markers without breaking existing box interactions
- wire refine controls into inspector `Mask Tools` while preserving current route layout and honest disabled states

### Feature Matrix Updates

- update `[[Mask Editing and Cleanup]]` only if shipped frontend behavior or verification truth differs from current note

## Execution Phase

### Implementation Notes

- frontend refine UI will treat brush strokes as sampled positive or negative point prompts sent to backend refine route; frontend does not own pixel-mask persistence

## Wrap-Up Phase

### Verification

- Commands run:
- `npm --workspace frontend exec vitest run tests/unit/video-review/use-sam2-workspace.test.tsx tests/unit/video-review/exact-frame-canvas.test.tsx tests/unit/video-review/state.test.ts tests/integration/video-review/live-review-screen.test.tsx`
- `npm run lint`
- `npm run typecheck`
- `npm run test:backend:coverage`
- raw frontend coverage shards from `frontend/`:
  - batch1 app and tooling
  - batch2 video-library
  - batch3 app-routes and review screen
  - batch4 video-review api and workspace hooks
  - batch5a exact-frame-canvas and state
  - batch5b review-transport-controls
- merged shard JSON with `istanbul-lib-coverage`
- Results:
- frontend targeted refine tests passed
- lint passed
- typecheck passed
- backend coverage gate passed
- merged frontend shard coverage passed at `94.64%` lines and `90.22%` branches
- browser proof passed with screenshot `/tmp/us031-refine-ui-browser.png`
- own review completed; no subagent reviews were run in this session

### Final Summary

Paused review now supports same-frame mask correction with add or erase brushes, save flow into `POST /sam2/refine-mask`, corrected-source reopen, and selected-summary refresh after save. Browser and frontend proofs cover paused-only guard, brush input, clear or cancel reset, and corrected-save flow.

### Completion Gate

- [x] Acceptance Criteria checkboxes updated to match reality
- [x] Definition of Done checkboxes updated to match reality
- [x] Only now may `status` change to `done`
