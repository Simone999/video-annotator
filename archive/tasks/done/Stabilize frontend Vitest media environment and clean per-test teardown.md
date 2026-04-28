---
title: Stabilize frontend Vitest media environment and clean per-test teardown
type: note
permalink: video-annotator/tasks/stabilize-frontend-vitest-media-environment-and-clean-per-test-teardown
id: task-stabilize-frontend-vitest-media-environment-and-clean-per-test-teardown
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
- tests
- vitest
- jsdom
- m-7
---

# Stabilize frontend Vitest media environment and clean per-test teardown

## Creation Phase

### Description

Make frontend Vitest start each test from a clean environment and remove raw jsdom media behavior from review tests. Current symptom: full repo `npm run test` can fail even though `export-ui-flow.test.tsx` passes alone. Review-path tests still print raw jsdom `HTMLMediaElement play()/pause()` not-implemented noise, and shared setup does not yet own timer/global/media reset centrally.

Read first:
- [[Workflow]]
- [[Testing tools]]
- `frontend/tests/setup/vitest.setup.ts`
- `frontend/tests/unit/tooling/vitest-setup.test.tsx`
- `frontend/tests/integration/video-review/export-ui-flow.test.tsx`
- `frontend/src/features/video-review/hooks/use-live-review-controller.ts`

Stage-2 rule: in planning phase, write concrete test plan and implementation plan first. In execution, follow written plan. Before `done`, run own review plus 2 subagent reviews and fix actionable findings.

### Scope

- In scope: shared frontend test setup, deterministic media mocks for jsdom review tests, centralized teardown for timers/globals/DOM, and verification that full frontend suite starts clean
- Out of scope: product behavior changes, Docker E2E runtime work, or review UX redesign

### Affected Features

- [[Video Ingest and Exact-Frame Review]]
- [[Export]]

### Acceptance Criteria

- [x] Shared frontend Vitest setup owns cleanup for DOM, timers, stubbed globals, and mock restoration
- [x] Review integration tests no longer depend on raw jsdom `HTMLMediaElement` not-implemented behavior
- [x] `npm --workspace frontend run test` passes from a clean start
- [x] Repo `npm run test` passes from a clean start

### Test Intent

- Frontend: add red tooling tests for shared setup guarantees, then rerun focused review integration and full frontend suite
- Backend: none
- Manual: none

### Definition of Done

- [x] Planning phase records concrete tests and implementation plan before code
- [x] Own review plus 2 subagent reviews are recorded and actionable findings are fixed
- [x] Relevant tests and quality checks pass
- [x] Feature notes, task note, and routing indexes are updated honestly when truth changes

## Planning Phase

### Planned Integration Tests

- `frontend/tests/integration/video-review/export-ui-flow.test.tsx`
- `frontend/tests/integration/video-review/live-review-screen.test.tsx`

### Planned E2E Tests

- None

### Planned Implementation

- Add tooling tests that prove shared Vitest setup resets fake timers and stubbed globals between tests and provides deterministic media play/pause behavior.
- Move shared cleanup into `frontend/tests/setup/vitest.setup.ts`.
- Add jsdom media mocks in shared setup instead of relying on raw browser not-implemented methods.
- Rerun focused review suites, full frontend suite, and repo `npm run test`.

### Feature Matrix Updates

- Update `[[Testing tools]]` only if this lands a durable frontend test-environment rule.

## Execution Phase

### Implementation Notes

- Moved frontend shared cleanup into `frontend/tests/setup/vitest.setup.ts`:
  - `cleanup()` after every DOM test
  - `server.resetHandlers()`
  - `vi.useRealTimers()`
  - `vi.unstubAllGlobals()`
  - `vi.restoreAllMocks()`
  - `vi.clearAllMocks()`
- Added DOM-only jsdom media shims in shared setup with `typeof HTMLMediaElement !== "undefined"` guard so node-environment tests do not crash:
  - `load()` no-op
  - `pause()` no-op
  - `play()` resolves immediately
- Added tooling proof in `frontend/tests/unit/tooling/vitest-setup.test.tsx` for:
  - deterministic media behavior
  - timer reset between tests
  - global unstub between tests
  - DOM cleanup and spy restoration between tests
- Fixed stale or leaky frontend tests uncovered by shared cleanup:
  - split `export-ui-flow.test.tsx` into smaller honest export-state flows and removed local cleanup duplication
  - `review-page.test.tsx` now clears hoisted mock call history
  - `live-review-screen.test.tsx` now resets hoisted mock implementations, not only call counts

### Review Notes

- Subagent `Aquinas` found real isolation leak:
  - `vi.restoreAllMocks()` alone does not clear plain `vi.fn()` hoisted module mocks
  - concrete example was `liveReviewRenderSpy` in `review-page.test.tsx`
  - fix was shared `vi.clearAllMocks()` plus local hoisted-mock cleanup where tests keep module-level spies
- Subagent `Carson` found two note or test-quality gaps:
  - task note needed `[[Export]]` as affected feature
  - shared-setup proof should cover DOM cleanup and spy restoration, not only timers and globals
  - both were fixed
- Subagent `Linnaeus` found two behavior-coverage gaps in export review flow:
  - split export tests had dropped same-session `ready -> exported -> ready` proof
  - test also stopped proving `Download latest export` disappears after later manual edit
  - both were restored in final `export-ui-flow.test.tsx`

## Wrap-Up Phase

### Verification

- Commands run:
- `npm exec --workspace frontend vitest run tests/unit/tooling/vitest-setup.test.tsx`
- `npm exec --workspace frontend vitest run tests/unit/tooling/vitest-setup.test.tsx tests/integration/video-review/export-ui-flow.test.tsx tests/integration/video-review/review-page.test.tsx tests/unit/video-review/live-review-screen.test.tsx --coverage.enabled=false`
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- Results:
- Initial red proof:
  - shared setup test failed before fix because raw jsdom media and leaked fake timers left dirty state between tests
- Focused touched-file rerun passed:
  - `4` files, `14` tests
- `npm run lint` passed
- `npm run typecheck` passed
- `npm run test` passed from clean start:
  - backend coverage gate passed at statements `97.50%`, branches `90.44%`
  - frontend full suite passed at `50` files / `240` tests
  - frontend coverage gate passed at lines `94.19%`, branches `90.25%`

### Final Summary

Frontend Vitest now starts review DOM tests from a clean shared baseline instead of depending on raw jsdom media failures or leftover timers, globals, spies, and rendered DOM. The export flow timeout in full-suite runs was stale test-isolation debt, not product behavior drift.

### Completion Gate

- [x] Acceptance Criteria checkboxes updated to match reality
- [x] Definition of Done checkboxes updated to match reality
- [x] Only now may `status` change to `done`
