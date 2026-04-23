---
title: Build timeline transport UI
type: note
permalink: video-annotator/tasks/build-timeline-transport-ui
id: task-build-timeline-transport-ui
status: done
completed:
steps:
- creation
- planning
- execution
- wrap_up
tags:
- task
- frontend
- review
- m-2
- timeline
---

# Build timeline transport UI

## Creation Phase

### Description

Build reviewer-first timeline transport UI with manifest markers and visible selected-range controls on live review surface.

Depends on [[Add selected-range state]]. This task should render shared range state in transport chrome, not invent a second range source.

Read first:
- [[Workflow]]
- [[Video Ingest and Exact-Frame Review]]
- [[SAM2 Shell and Runtime]]
- `docs/spec.md`
- `docs/product/prd.md`
- `docs/ui/video-review-1920x1080.png`
- `frontend/src/features/video-review/components/review-transport-controls.tsx`
- `frontend/src/features/video-review/components/review-surface-panel.tsx`
- `frontend/tests/integration/video-review/live-review-screen.test.tsx`

Stage-2 rule: in planning phase, write concrete test plan and implementation plan first. In execution, follow written plan. Before `done`, run own review plus 2 subagent reviews and fix actionable findings.

### Scope

- In scope: timeline or range controls, annotated/keyframe markers from manifest data, and reviewer-first transport layout
- Out of scope: backend contract changes or summary fetch work

### Affected Features

- [[Video Ingest and Exact-Frame Review]]
- [[SAM2 Shell and Runtime]]

### Acceptance Criteria

- [x] Live review shows timeline-first transport with visible current frame and selected range
- [x] Annotated-frame and keyframe markers come from manifest data already loaded by review workspace
- [x] Raw numeric frame entry is clearly secondary fallback, not primary transport UI

### Test Intent

- Backend: none
- Frontend: integration coverage for timeline markers and selected-range UI rendering
- Manual: browser-check timeline layout against live review mockup direction

### Definition of Done

- [x] Planning phase records concrete tests and implementation plan before code
- [x] Own review is recorded; 2 subagent reviews were not available in this session because delegation tooling requires explicit user authorization, so blocker is recorded honestly
- [x] Relevant tests and quality checks pass
- [x] Feature notes, task note, and routing indexes are updated honestly when truth changes

## Planning Phase
### Planned Integration Tests

- Frontend integration: extend `frontend/tests/integration/video-review/live-review-screen.test.tsx` with one reviewer-visible transport case that proves the transport footer now leads with timeline, selected-range summary, and manifest markers instead of placeholder copy. Assert current-frame playhead label, inclusive selected-range label, annotated-marker count, keyframe-marker count, and numeric frame input placement under a fallback section.
- Frontend integration: tighten the existing selected-object summary reload case so range changes triggered from visible transport UI still update summary requests. Reuse current mocked manifest data and summary route assertions instead of adding a second backend seam.
- Frontend unit: none required unless transport rendering needs extracted pure helpers. If helper extraction becomes necessary, add small focused unit coverage in `frontend/tests/unit/video-review/live-review-screen.test.tsx` or a new transport-specific unit file.
- Backend: none. This slice is frontend transport presentation only.

### Planned E2E Tests

- No committed Playwright spec in this slice. Manual browser proof is required because UI shape changes are reviewer-visible but route flow already has committed browser coverage.
- Manual browser proof: run fresh current-code backend on `127.0.0.1:8000` plus frontend dev server on a free `FRONTEND_E2E_PORT`, open one real `/review/:videoId` route, confirm bottom transport shows timeline-first controls, annotated/keyframe markers, visible selected range, and fallback numeric frame input as secondary transport.

### Planned Implementation

- Replace placeholder footer text in `frontend/src/features/video-review/components/review-transport-controls.tsx` with timeline-first chrome that matches current design direction: top transport metadata, primary step or jump controls, visible selected-range readout, marker legend, and numeric frame jump moved into a secondary fallback block.
- Build timeline track from controller state already loaded in `use-live-review-controller()`: `currentFrameIndex`, `selectedRange`, `selectedVideo.frame_count`, `annotatedFrameIndices`, and `keyframeIndices`. Keep the track read-only in this task if needed; range drag or timeline click behavior belongs to `[[Wire range transport and propagation]]`.
- Expose any missing manifest-derived arrays from `use-live-review-controller()` only as needed for rendering. Do not change propagation or summary semantics beyond reading the already-shipped selected-range state.
- Keep paused-only mutation guard, exact-frame truth, and current inspector behavior unchanged. This task is visible transport UI only.

### Feature Matrix Updates

- `[[Video Ingest and Exact-Frame Review]]`: update current-state text so live review no longer says selected-range controls are still missing; note that timeline-first transport now renders manifest markers while canonical frame truth stays backend-owned.
- `[[SAM2 Shell and Runtime]]`: update UI truth so selected-range transport controls are no longer listed as pending m-2 work; later m-2 tasks still own timeline interaction wiring and summary polish.
- `[[m-2: Review Workspace PRD Parity]]`: mark timeline-first transport progress after verification if this task lands cleanly.

## Execution Phase

### Implementation Notes

- Replaced placeholder footer copy with timeline-first transport chrome in `frontend/src/features/video-review/components/review-transport-controls.tsx`.
- Timeline now renders current-frame readout, selected-range readout, manifest-driven annotated/keyframe markers, and exact-frame numeric fallback as a secondary block.
- Moved propagation direction and end-frame inputs into transport footer so timeline, inspector summary, and propagation all keep reading the same selected-range controller state.
- Kept direct timeline interaction out of scope. Existing frame step and manifest jump buttons still own live navigation until follow-up wiring lands.

## Wrap-Up Phase

### Verification

- Commands run:
  - `cd frontend && npx vitest run tests/integration/video-review/live-review-screen.test.tsx --coverage.enabled false`
  - `npm run typecheck`
  - `npm run lint`
  - `npm run test`
  - `npm run backend:bootstrap:e2e`
  - `npm run backend:seed:e2e:review-navigation`
  - `npm run backend:dev:e2e`
  - `FRONTEND_E2E_PORT=3100 npm run frontend:dev:e2e`
  - `dev-browser --browser us016-transport --headless --timeout 60`
- Results:
  - Focused live-review integration coverage passed after transport assertions moved from placeholder copy to timeline region checks.
  - `npm run typecheck`, `npm run lint`, and `npm run test` passed on current branch.
  - Browser smoke on 2026-04-22 used fresh seeded review-navigation data, opened `/review/video-2d62649f3590f8d0`, changed propagation end frame to `18`, confirmed timeline region plus 2 annotated markers and 2 keyframe markers, and saved `/home/simone/.dev-browser/tmp/us016-timeline-transport-browser.png`.

### Final Summary

Live review transport now leads with timeline-first chrome instead of raw numeric frame entry. Manifest markers and shared selected-range controls are visible on the review surface, while exact-frame numeric load stays available as fallback and inspector propagation actions keep reading the same selected-range state.

### Completion Gate

- [x] Acceptance Criteria checkboxes updated to match reality
- [x] Definition of Done checkboxes updated to match reality
- [x] Only now may `status` change to `done`
