---
id: task-build-video-library-mockup-shell
title: Build video library mockup shell
status: done
completed: 2026-04-21 05:13:02 CEST
steps:
- creation
- planning
- execution
- wrap_up
tags:
- task
- frontend
- ui
- library
- mockup
permalink: video-annotator/tasks/build-video-library-mockup-shell
---

## Creation Phase

### Description

Build the library screen to match `docs/ui/video-library.html` with fixture data only. Keep it presentational. Do not pull backend or live review logic into the page.

### Scope

- In scope: top header chrome, search field, left nav rail, summary metrics strip, library card rendering, required card fields, state badges, detail lines, propagation progress display, and `Open Review` action UI
- Out of scope: backend fetches, import UI, live progress logic, or router work

### Affected Features

- [[Review Workspace Ergonomics]]

### Acceptance Criteria

- [x] Library shell matches the mockup layout and visual hierarchy
- [x] Top header chrome, left nav rail, and summary metrics strip render in the library shell
- [x] Every card shows preview, display name, state badge, frame count, fps, resolution, last reviewed label, and one detail line
- [x] Propagation progress shows only for `in_progress` fixture rows
- [x] `Open Review` action is present and wired only to local shell navigation
- [x] Task note later records frontend verification honestly

### Test Intent

- Backend: none; backend is out of scope
- Frontend: prove library screen renders shell chrome plus required card fields from fixture data and exposes the open-review action
- Manual: compare the rendered library shell with the mockup

### Definition of Done

- [x] Relevant frontend tests pass
- [x] Feature note updated
- [x] Docs or memory updated if behavior or contracts changed

## Planning Phase
### Planned Integration Tests

- Backend: none; story stays UI-only and fixture-backed.
- Frontend:
  - `npm --workspace frontend run test -- src/features/ui-shell/shell-host.test.tsx` for red-green coverage of library chrome, summary metrics, card metadata, propagation-only progress, and `Open Review` local navigation seam.
  - `npm --workspace frontend run test -- src/app/App.test.tsx` to keep default host swap honest after shell changes.

### Planned E2E Tests

- Backend: none.
- Frontend: no new browser E2E. This story is mockup-only and lower layer can prove behavior. Manual browser verification still required after implementation.

### Planned Implementation

- Step 1: add failing `UiShellApp` integration tests for library shell layout, required card fields, propagation-only progress visibility, and `Open Review` local navigation.
- Step 2: reshape shell fixtures and library page markup to match `docs/ui/video-library.html` while staying fixture-only.
- Step 3: extend shell host with smallest local page-state wiring needed for `Open Review`, without adding router or touching `video-review/api.ts`.
- Step 4: run frontend and repo quality gates, then manual browser check against mockup.

### Feature Matrix Updates

- Feature note updates needed before or during execution:
  - `[[Review Workspace Ergonomics]]` should record that library shell now carries mockup chrome, card metadata, and shell-local `Open Review` entry.
  - No `sam2-demo` reuse needed for this UI-only shell story.


## Execution Phase
### Implementation Notes

- Added `frontend/src/features/ui-shell/shell-host.test.tsx` first and verified red on missing library chrome plus missing `Open Review` button.
- Extended shell fixtures and types so summary metrics and card copy come from fixture data instead of backend contracts.
- Rebuilt `library-page.tsx` and `app.css` into the mockup library shell with top chrome, nav rail, summary strip, filter row, richer cards, and propagation-only progress display.
- Kept shell page switching local in `frontend/src/features/ui-shell/shell-host.tsx`; no router and no `video-review/api.ts` work.


## Wrap-Up Phase
### Verification

- Commands run:
  - `npm --workspace frontend run test -- src/features/ui-shell/shell-host.test.tsx`
  - `npm --workspace frontend run test -- src/app/App.test.tsx`
  - `npm --workspace frontend run typecheck`
  - `npm --workspace frontend run lint`
  - `npm --workspace frontend run test`
  - `npm run typecheck`
  - `npm run lint`
  - `npm run test`
  - Browser verification: `npm run frontend:dev:e2e` on `http://127.0.0.1:5174` plus Playwright click-and-screenshot script
- Results:
  - New shell-host test failed first, then passed after implementation.
  - Frontend typecheck, lint, and full frontend test suite passed.
  - Repo-wide typecheck, lint, and test suite passed.
  - Browser verification saved `/tmp/us-002-video-library-shell.png` and `/tmp/us-002-review-shell.png`; clicking `Open Review loading_bay_102.mp4` opened `Review Shell` with selected fixture text.

### Final Summary

- Library shell now matches the mockup direction with fixed top chrome, hover rail, summary metrics, filter row, and richer fixture cards.
- `Open Review` stays a shell-local action in `shell-host.tsx`, so navigation remains UI-only with no router or backend contract work.

### Completion Gate

- [x] Acceptance Criteria checkboxes updated to match reality
- [x] Definition of Done checkboxes updated to match reality
- [x] Only now may `status` change to `done`

