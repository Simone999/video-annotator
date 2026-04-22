---
title: Wire range transport and propagation
type: note
permalink: video-annotator/tasks/wire-range-transport-and-propagation
id: task-wire-range-transport-and-propagation
status: done
completed: 2026-04-22
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
- propagation
---

# Wire range transport and propagation

## Creation Phase

### Description

Wire timeline and selected-range interactions into canonical frame loading and existing propagation controls so live review uses range state instead of isolated numeric inputs.

Depends on [[Add selected-range state]] and follows [[Build timeline transport UI]].

Read first:
- [[Workflow]]
- [[Video Ingest and Exact-Frame Review]]
- [[SAM2 Shell and Runtime]]
- `docs/spec.md`
- `docs/product/prd.md`
- `frontend/src/features/video-review/hooks/use-live-review-controller.ts`
- `frontend/src/features/video-review/components/review-transport-controls.tsx`
- `frontend/src/features/video-review/components/review-inspector-panel.tsx`
- `frontend/tests/integration/video-review/live-review-screen.test.tsx`

Stage-2 rule: in planning phase, write concrete test plan and implementation plan first. In execution, follow written plan. Before `done`, run own review plus 2 subagent reviews and fix actionable findings.

### Scope

- In scope: timeline click or drag behavior, range-driven frame loads, and propagation control reuse of selected range
- Out of scope: selected-object summary fetch or export behavior

### Affected Features

- [[Video Ingest and Exact-Frame Review]]
- [[SAM2 Shell and Runtime]]

### Acceptance Criteria

- [x] Timeline interactions load canonical backend frames, not browser playback time
- [x] Propagation controls reuse selected range without inventing second range source
- [x] Paused-only mutation guard still holds while transport gets richer

### Test Intent

- Backend: none
- Frontend: integration coverage for timeline-driven frame loads and propagation-range wiring
- Manual: browser-check selected range and propagation controls stay coherent during review

### Definition of Done

- [x] Planning phase records concrete tests and implementation plan before code
- [x] Own review is recorded; 2 subagent reviews were not available in this session because delegation tooling requires explicit user authorization, so blocker is recorded honestly
- [x] Relevant tests and quality checks pass
- [x] Feature notes, task note, and routing indexes are updated honestly when truth changes

## Planning Phase

### Planned Integration Tests

- Frontend integration: extend `frontend/tests/integration/video-review/live-review-screen.test.tsx` with one reviewer-visible transport story that clicks timeline markers and timeline track, then proves canonical frame loads change through backend frame requests instead of browser playback time.
- Frontend integration: add propagation-wiring coverage in the same file that changes current frame through timeline interaction, then starts propagation and asserts request payload still comes from shared selected-range state rather than stale numeric fallback assumptions.
- Frontend unit: extend `frontend/tests/unit/video-review/use-live-review-controller.test.ts` only if controller behavior needs extra guardrails for selected-range recompute after canonical frame jumps; keep DOM math in transport component tests where possible.
- Backend: none. This slice is frontend transport wiring only.

### Planned E2E Tests

- No new committed Playwright spec unless transport interaction cannot be covered cleanly in existing frontend integration plus manual browser proof. Existing route-navigation browser coverage already proves base route ownership.
- Manual browser proof: start fresh seeded review-navigation backend data, run current-code backend on `127.0.0.1:8000`, run frontend on a free `FRONTEND_E2E_PORT`, open real `/review/:videoId`, click timeline markers or scrub timeline, confirm canonical frame label and exact-frame image update, then start propagation from updated frame and confirm paused-only guard plus selected-range coherence.

### Planned Implementation

- Keep one reviewer-owned selected-range source in `use-live-review-controller.ts`; do not add a second start/end state for transport. Timeline interaction should drive canonical frame loads, and existing direction plus boundary controls should continue deriving selected range from that one controller state.
- Make `frontend/src/features/video-review/components/review-transport-controls.tsx` interactive: clicking markers should jump to that canonical frame, clicking or dragging timeline should map pointer position to backend frame indices, and track interaction must call controller frame-load handlers instead of browser playback time.
- Keep paused-only mutation rules intact by routing timeline interaction through the same exact-frame load path that already pauses contextual playback.
- Reuse current SAM2 propagation action path in inspector; only tighten how transport updates current frame and shared range state before propagation starts.
- `sam2-demo` reuse: none for this slice. Repo has no local `sam2-demo/` directory, and timeline transport is feature-owned frontend code.

### Feature Matrix Updates

- `[[Video Ingest and Exact-Frame Review]]`: update current-state and verification text if live review now supports direct timeline click or drag frame loads on canonical backend frames.
- `[[SAM2 Shell and Runtime]]`: update UI truth so propagation flow now reuses transport-driven current frame and shared selected range without separate numeric transport assumptions.
- `[[m-2: Review Workspace PRD Parity]]`: mark timeline interaction wiring complete if verification passes, while summary rendering tasks stay pending until later stories close.

## Execution Phase

### Implementation Notes

- Made `frontend/src/features/video-review/components/review-transport-controls.tsx` interactive without adding a second range source. Timeline track now exposes a scrubber role, maps click or drag pointer positions to canonical frame indices, and routes every transport change through existing controller frame-load handlers.
- Turned manifest markers into exact-frame jump buttons so annotated and keyframe markers load backend frames directly instead of staying decorative.
- Kept propagation wiring in existing controller state. Timeline-driven current-frame changes now recompute the shared selected range, and propagation still uses that normalized range instead of trusting raw numeric fallback input.
- Added focused frontend integration and unit coverage for marker jumps, scrubber drag, propagation request wiring, keyboard handling, pointer-capture cleanup, zero-width no-op behavior, and one-frame track rendering.

## Wrap-Up Phase

### Verification

- Commands run:
  - `cd frontend && npx vitest run tests/integration/video-review/live-review-screen.test.tsx --coverage.enabled false`
  - `cd frontend && npx vitest run tests/unit/video-review/review-transport-controls.test.tsx --coverage.enabled false`
  - `npm run typecheck`
  - `npm run lint`
  - `npm run test`
  - `npm run backend:bootstrap:e2e`
  - `npm run backend:seed:e2e:review-navigation`
  - `npm run backend:dev:e2e`
  - `FRONTEND_E2E_PORT=3100 npm run frontend:dev:e2e`
  - `timeout 45s node --input-type=module` Playwright browser smoke for `/review/video-2d62649f3590f8d0`
- Results:
  - Focused frontend integration and unit suites passed after transport scrubber plus marker interactions were wired.
  - `npm run typecheck`, `npm run lint`, and full `npm run test` passed. Frontend coverage finished at statements `95.52%` and branches `90.36%`, which clears the repo gate.
  - Browser smoke on 2026-04-22 used fresh review-navigation seed data, fresh current-code backend on `127.0.0.1:8000`, frontend on `127.0.0.1:3100`, dragged timeline scrubber from canonical frame `7` to `18`, confirmed selected range changed to `18-199`, changed propagation end frame to `6` and saw normalized selected range `18-18`, then jumped back with `Annotated frame marker at 7`. Screenshot: `/tmp/us017-timeline-range-browser.png`.
  - Own review found one real-browser gotcha: smoke math must read live scrubber `aria-valuemax` instead of assuming the 42-frame sample fixture. No subagent reviews were run because delegation tooling requires explicit user authorization in this session.

### Final Summary

Live review transport now lets reviewers scrub canonical backend frames directly from the timeline and jump through manifest markers without relying on browser playback time. Shared selected-range state still stays single-source-of-truth, so propagation reacts to timeline-driven current-frame changes and normalized range bounds instead of drifting back to raw numeric fallback input.

### Completion Gate

- [x] Acceptance Criteria checkboxes updated to match reality
- [x] Definition of Done checkboxes updated to match reality
- [x] Only now may `status` change to `done`
