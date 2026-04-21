---
title: Split shipped frontend React boundaries
type: task
permalink: video-annotator/tasks/done/split-shipped-frontend-react-boundaries
id: task-frontend-react-refactor
status: done
completed: []
steps:
- creation
- planning
- execution
- wrap_up
tags:
- task
- frontend
- react
- refactor
---

# Split shipped frontend React boundaries

## Creation Phase

### Description

Refactor shipped `video-library` and `video-review` route code so route pages stay thin, section UI is split by responsibility, and behavior-heavy code moves into focused hooks.

### Scope

- In scope:
  - shipped route code under `frontend/src/features/video-library/`
  - shipped route code under `frontend/src/features/video-review/`
  - required test updates for extracted seams
- Out of scope:
  - fixture-only `ui-shell` cleanup
  - new selected-object summary feature work
  - new timeline or selected-range feature work
  - backend contract changes

### Affected Features

- [[Review Workspace Ergonomics]]
- [[Video Ingest and Exact-Frame Review]]

### Acceptance Criteria

- [x] #1 `VideoLibraryRoutePage` becomes route-thin and pushes load logic into a feature hook.
- [x] #2 `LiveReviewScreen` becomes composition-oriented with extracted section components or controller hook instead of one logic-heavy screen file.
- [x] #3 `useVideoReviewWorkspace` delegates major concerns to smaller internal hooks or modules while keeping exported behavior stable.
- [x] #4 Existing shipped route tests still pass after refactor.

### Test Intent

- Backend: none.
- Frontend: keep current component and route coverage green; add narrow tests for extracted seams where useful.
- Manual: none planned unless automated verification leaves ambiguity.

### Definition of Done

- [x] Tests pass
- [x] Relevant memory updated

## Planning Phase

### Planned Integration Tests

- Frontend:
  - `frontend/tests/component/video-review/live-review-screen.test.tsx`
  - `frontend/tests/component/video-review/review-page.test.tsx`
  - `frontend/tests/component/video-library/video-library-screen.test.tsx`
  - `frontend/tests/component/app/app-routes.test.tsx`

### Planned E2E Tests

- Frontend: none for this refactor-only pass.

### Planned Implementation

- Step 1: add failing tests for new thin-route or controller seams.
- Step 2: extract library route data hook and keep route page thin.
- Step 3: extract live review controller and section components without changing DOM semantics that current tests rely on.
- Step 4: split workspace internals into smaller hooks while preserving exported hook API.
- Step 5: run frontend tests and targeted type or lint verification.

### Feature Matrix Updates

- Feature note updates needed before or during execution: record refactor evidence or structural guidance if behavior-facing truth changes.

## Execution Phase

### Implementation Notes

Execution started from shipped-first refactor plan. Keep unrelated worktree edits untouched.
- Added `frontend/src/features/video-library/hooks/use-video-library-route-data.ts` and moved route-level load plus default-selection logic out of `pages/library-page.tsx`.
- Split `frontend/src/features/video-library/components/video-library-screen.tsx` into route-neutral header, sidebar, summary, filter, grid, and card components while keeping current copy and labels stable.
- Added `frontend/src/features/video-review/hooks/use-live-review-controller.ts` and moved live review state, bootstrap effects, frame handlers, playback handlers, and keyboard shortcuts out of `components/live-review-screen.tsx`.
- Split live review JSX into `review-video-list-panel.tsx`, `review-surface-panel.tsx`, `review-transport-controls.tsx`, and `review-inspector-panel.tsx`.
- Split `frontend/src/features/video-review/workspace.ts` into composed hooks for indexed videos, selection, exact-frame loading, and SAM2 workspace behavior while preserving exported `useVideoReviewWorkspace()` shape.

## Wrap-Up Phase

### Verification

- Commands run:
- `npm --workspace frontend run test -- --run tests/component/video-library/video-library-screen.test.tsx tests/component/video-review/live-review-screen.test.tsx tests/component/video-review/review-page.test.tsx tests/component/app/app-routes.test.tsx tests/unit/video-review/workspace.test.ts tests/unit/video-review/use-live-review-controller.test.ts tests/unit/video-library/use-video-library-route-data.test.ts`
- `npm --workspace frontend run typecheck`
- `npm --workspace frontend run lint`
- Results:
- Targeted affected frontend suites passed: `7` files, `24` tests.
- Hook-level refactor tests passed: `use-video-library-route-data`, `use-live-review-controller`, and `workspace`.
- Frontend typecheck passed.
- Frontend lint passed.
- jsdom printed expected `HTMLMediaElement` not-implemented messages for `play()` and `pause()` during live review tests, but suites stayed green.

### Final Summary

Shipped frontend React boundaries are thinner now without changing route behavior. `video-library` route page became data-wiring only, live review behavior moved into a controller hook plus visible section components, and review workspace internals now compose smaller focused hooks behind the same public API.

### Completion Gate

- [x] Acceptance Criteria checkboxes updated to match reality
- [x] Definition of Done checkboxes updated to match reality
- [x] Only now may `status` change to `done`
