---
id: task-wire-page-actions-and-local-ui-state
title: Wire page actions and local UI state
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
- navigation
- state
permalink: video-annotator/tasks/wire-page-actions-and-local-ui-state
---

## Creation Phase

### Description

Wire shell page actions with local UI state only. `Open Review` must open the chosen fixture video. `Back to Library` must return to the library through one explicit review-screen control added in shell chrome, because the mockup does not provide a clear back action by itself. Keep this state local and simple.

### Scope

- In scope: page enum state, chosen video state, selected object state, open-review action, one explicit back-to-library action in review chrome, and shell-local state persistence across page switches
- Out of scope: router library, URL routing, backend state sync, or live feature reducer work

### Affected Features

- [[Review Workspace Ergonomics]]

### Acceptance Criteria

- [x] `Open Review` opens the review shell for the chosen fixture video
- [x] Review shell exposes one clear `Back to Library` affordance in its chrome
- [x] `Back to Library` returns to the library shell
- [x] Selected video and selected object state stay coherent across shell page switches
- [x] Navigation uses local state only and adds no router dependency
- [x] Task note later records frontend verification honestly

### Test Intent

- Backend: none; backend is out of scope
- Frontend: prove page actions and selection state work through local shell state only
- Manual: switch between pages and confirm selected shell state stays coherent

### Definition of Done

- [x] Relevant frontend tests pass
- [x] Feature note updated
- [x] Docs or memory updated if behavior or contracts changed

## Planning Phase

### Planned Integration Tests

- Backend: none; shell task stays UI-only with fixture loader only
- Frontend:
  - extend `frontend/src/features/ui-shell/shell-host.test.tsx` with one user story that opens review, confirms explicit `Back to Library` chrome action exists, returns to library, then re-opens same video and confirms selected object details stayed coherent
  - keep selectors semantic: review action button name, library heading, selected object inspector labels, and selected video article state where helpful

### Planned E2E Tests

- Backend: none
- Frontend: none for this task; browser proof is still required because story changes visible shell UI, but durable automation stays frontend integration per `[[m-2a: Mockup UI Shell]]`

### Planned Implementation

- Step 1: add explicit review-chrome back action in `frontend/src/features/ui-shell/review-page.tsx` with callback prop only
- Step 2: keep page switch and selected video or object state in `frontend/src/features/ui-shell/shell-host.tsx` with no router and no live review wiring
- Step 3: update shell tests first, then minimal app and CSS changes only if new chrome needs styling

### Feature Matrix Updates

- Feature note updates needed before or during execution:
  - `[[Review Workspace Ergonomics]]` should drop explicit back-navigation gap and record that shell page switches now stay local

## Execution Phase

### Implementation Notes

- Added shell-host red test first for explicit review back action, library return, and selected-object persistence after reopening same fixture video.
- Confirmed RED on missing `Back to Library` control before touching production code.
- Added one callback prop to `review-page.tsx` for review-chrome back navigation and kept page-switch state in `shell-host.tsx`.
- Left selected video and selected object state untouched on page flips so same fixture review reopens coherently without router or URL state.

## Wrap-Up Phase

### Verification

- Commands run:
  - `npm --workspace frontend run test -- src/features/ui-shell/shell-host.test.tsx`
  - `npm run typecheck`
  - `npm run lint`
  - `npm run test`
  - Browser verification: `npm run frontend:dev:e2e` on `http://127.0.0.1:5174` plus Playwright script that opened review, selected `pedestrian_01`, returned to library, reopened review, and saved `/tmp/us-004-shell-navigation.png`
- Results:
  - Shell-host navigation test failed first on missing `Back to Library`, then passed after callback wiring.
  - Repo-wide typecheck, lint, and test commands passed.
  - Browser verification passed and screenshot proof saved at `/tmp/us-004-shell-navigation.png`.

### Final Summary

Added one explicit `Back to Library` action in review chrome and kept shell navigation in `shell-host.tsx`, so library and review now behave like one local-state shell and selected-object state survives page flips for same fixture video.

### Completion Gate

- [x] Acceptance Criteria checkboxes updated to match reality
- [x] Definition of Done checkboxes updated to match reality
- [x] Only now may `status` change to `done`
