---
id: task-build-review-page-mockup-shell
title: Build review page mockup shell
status: done
completed: 2026-04-21
steps:
- creation
- planning
- execution
- wrap_up
tags:
- task
- frontend
- ui
- review
- mockup
permalink: video-annotator/tasks/build-review-page-mockup-shell
---

## Creation Phase

### Description

Build the review screen to match `docs/ui/video-annotation.html` with fixture data only. Keep it UI-only. The shell may show playback chrome and overlays, but it must not wire live review behavior.

### Scope

- In scope: top metadata bar, left global nav, frame-object list, main stage with overlay chrome, bottom transport and timeline, right inspector, fixture-backed selected object display, and mockup-first layout styling
- Out of scope: backend frame loads, live playback rules, SAM2 runtime, save behavior, or export behavior

### Affected Features

- [[Review Workspace Ergonomics]]

### Acceptance Criteria

- [x] Review shell matches the mockup structure and visual hierarchy
- [x] Top metadata bar and left global nav render in the review shell
- [x] Frame-object list, stage, bottom transport, timeline, and right inspector all render from fixture data
- [x] Stage chrome includes the visible play overlay and the review action controls from the mockup, even when they are UI-only
- [x] Selected object data in the inspector comes from shell-local state, not live backend state
- [x] All action buttons stay UI-only unless they navigate between shell pages
- [x] Task note later records frontend verification honestly

### Test Intent

- Backend: none; backend is out of scope
- Frontend: prove the review screen renders the full mockup shell from fixture data and reflects shell-local selection state
- Manual: compare the rendered review shell with the mockup

### Definition of Done

- [x] Relevant frontend tests pass
- [x] Feature note updated
- [x] Docs or memory updated if behavior or contracts changed

## Planning Phase
### Planned Integration Tests

- Backend: none; story stays fixture-backed and UI-only.
- Frontend:
  - `npm --workspace frontend run test -- src/features/ui-shell/shell-host.test.tsx` for red-green coverage of review-shell chrome, object rail, stage controls, inspector fields, and shell-local selected-object switching.
  - `npm --workspace frontend run test -- src/app/App.test.tsx` to keep default shell host rendering honest after review-screen work.

### Planned E2E Tests

- Backend: none.
- Frontend: no new browser E2E. This story is mockup-only and fixture-backed, so frontend integration is enough for automated proof. Manual browser verification against `docs/ui/video-annotation.html` is still required after implementation.

### Planned Implementation

- Step 1: add failing `UiShellApp` integration coverage for review-screen chrome, selected fixture metadata, stage action controls, track summary, and selected-object inspector switching.
- Step 2: extend shell types and fixtures with review-page data for object rows, selected-range summary, timeline markers, and inspector values while staying local-only.
- Step 3: replace review placeholder markup with mockup-first review layout and add the minimal shell-host state needed for local object selection.
- Step 4: add only the CSS needed for review-shell layout parity, then run targeted tests, repo quality gates, and manual browser comparison.

### Feature Matrix Updates

- Feature note updates needed before or during execution:
  - `[[Review Workspace Ergonomics]]` should record that the review screen now renders the mockup shell with fixture-backed inspector data while live backend detail still remains future work.
  - No `sam2-demo` reuse needed for this UI-only shell story.

## Execution Phase
### Implementation Notes

- Added `frontend/src/features/ui-shell/shell-host.test.tsx` assertions first and verified RED on missing review-shell chrome and missing selected-object inspector state.
- Extended shell fixture types and loader cloning so each fixture video now carries UI-only review data for object rows, timeline, thumbnails, and inspector values.
- Replaced `review-page.tsx` placeholder with a mockup-first review shell that renders top metadata chrome, left nav, object rail, stage overlays, bottom transport and timeline, and right inspector from fixture data only.
- Kept selected-object state in `frontend/src/features/ui-shell/shell-host.tsx`, leaving `review-page.tsx` presentational.
- Added review-shell CSS in `frontend/src/app/app.css` for the three-column workspace layout, overlay chrome, transport strip, and inspector cards.
- Fixed the one fallout type fixture in `library-page.test.tsx` so shared `UiShellVideo` test data stays valid after the new review payload became required.

## Wrap-Up Phase
### Verification

- Commands run:
  - `npm --workspace frontend run test -- src/features/ui-shell/shell-host.test.tsx`
  - `npm --workspace frontend run test -- src/features/ui-shell/library-page.test.tsx`
  - `npm --workspace frontend run test -- src/app/App.test.tsx`
  - `npm --workspace frontend run typecheck`
  - `npm --workspace frontend run lint`
  - `npm run typecheck`
  - `npm run lint`
  - `npm run test`
  - Browser verification: `npm run frontend:dev:e2e` on `http://127.0.0.1:5174` plus a Playwright click-and-screenshot script that opened `street_scene_014.mp4` review shell and saved `/tmp/us-003-review-shell.png`
- Results:
  - Shell-host review tests passed after the RED-to-GREEN cycle.
  - Library card boundary test and default app host test passed.
  - Frontend and repo-wide typecheck, lint, and test commands passed.
  - Browser-rendered review shell loaded, opened from library, and screenshot proof was captured at `/tmp/us-003-review-shell.png`.

### Final Summary

Built the fixture-backed review page mockup shell with local selected-object state, mockup chrome, stage overlays, timeline, and inspector cards while keeping every action UI-only and backend-free.

### Completion Gate

- [x] Acceptance Criteria checkboxes updated to match reality
- [x] Definition of Done checkboxes updated to match reality
- [x] Only now may `status` change to `done`

