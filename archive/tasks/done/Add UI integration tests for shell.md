---
id: task-add-ui-integration-tests-for-shell
title: Add UI integration tests for shell
status: done
completed: 2026-04-21
steps:
- creation
- planning
- execution
- wrap_up
tags:
- task
- testing
- frontend
- ui
- integration
permalink: video-annotator/tasks/add-ui-integration-tests-for-shell
---

## Creation Phase

### Description

Add durable test coverage for the mockup shell. Carefully re-think frontend integration vs browser E2E before writing tests. Start from `[[Review Workspace Ergonomics]]`, `[[frontend-integration-tests]]`, and `[[e2e-tests]]`. Default proof layer is frontend integration with mocked HTTP fixture loads.

### Scope

- In scope: library shell chrome render coverage, review shell chrome render coverage, open-review navigation, back-to-library navigation, selected-object inspector switching, and explicit browser-E2E justification if any browser test is added
- Out of scope: backend API coverage, live review logic tests, or fake green E2E added only because the shell is visual

### Affected Features

- [[Review Workspace Ergonomics]]

### Testing Notes

- [[frontend-integration-tests]]
- [[e2e-tests]]

### Acceptance Criteria

- [x] Task note explicitly re-thinks frontend integration vs browser E2E with help from the testing notes before choosing coverage
- [x] Frontend integration proves library shell chrome render, review shell chrome render, open-review navigation, back-to-library navigation, and selected-object inspector switching
- [x] Frontend integration proves the explicit review-screen back affordance exists and works
- [x] Browser E2E is absent by default or justified explicitly if one shell workflow truly needs browser proof
- [x] Tests use mocked HTTP or fixture loads only and do not depend on live backend routes
- [x] `[[Review Workspace Ergonomics]]` is updated with evidence links and honest execution status values

### Test Intent

- Backend: none; backend is out of scope
- Frontend: prove real shell screens and page actions work while backend stays fake at request boundary
- Manual: compare shell interactions with the mockup and record anything automation misses

### Definition of Done

- [x] Relevant frontend tests pass
- [x] Feature note updated
- [x] Manual execution status recorded honestly
- [x] Docs or memory updated if behavior or contracts changed

## Planning Phase

### Planned Integration Tests

- Backend: none; shell story stays UI-only and fixture-backed.
- Frontend:
  - extend `frontend/src/app/App.test.tsx` with one root-app workflow that proves default library chrome, opens review, switches selected object, returns through explicit `Back to Library`, and reopens same video with coherent inspector state
  - keep `frontend/src/features/ui-shell/shell-host.test.tsx` as lower shell seam coverage; this story's durable proof runs through `App` so default host swap and no-live-review guard stay covered together
  - keep backend fake by reusing the `../features/video-review` mock and local fixture loader only; do not add `/api` stubs or live backend routes

### Planned E2E Tests

- Backend: none.
- Frontend: no browser E2E added. Shell workflow is local state plus fixture loader only, so app-root frontend integration is the smallest boundary that proves the story. Run one manual browser smoke only for honest task evidence.

### Planned Implementation

- Step 1: update `frontend/src/app/App.test.tsx` first with root-app shell workflow assertions for library chrome, review chrome, open-review, back-to-library, and selected-object inspector switching.
- Step 2: only if the new test reveals a gap, patch shell production code minimally; otherwise keep production code untouched and treat this story as coverage plus evidence work.
- Step 3: run targeted frontend tests, repo quality gates, and one manual browser smoke because the task Definition of Done requires honest manual status.

### Feature Matrix Updates

- Feature note updates needed before or during execution:
  - `[[Review Workspace Ergonomics]]` should record that app-root frontend integration now proves shell chrome, navigation, and inspector switching without live backend routes.

## Execution Phase

### Implementation Notes

- Chose frontend integration over browser E2E after re-reading `[[frontend-integration-tests]]` and `[[e2e-tests]]` because the shell workflow is local-state-only and fixture-backed.
- Added root-app workflow coverage in `frontend/src/app/App.test.tsx` so the default host path now proves library chrome, review chrome, `Open Review`, explicit `Back to Library`, and selected-object persistence through reopen.
- First targeted run failed on duplicate `Primary` navigation landmarks because repeated renders leaked DOM between tests in `App.test.tsx`; fixed that by adding explicit `afterEach(cleanup)`.
- Left shell production code untouched because the existing UI already satisfied the story once app-root integration coverage existed.

## Wrap-Up Phase

### Verification

- Commands run:
  - `npm --workspace frontend run test -- src/app/App.test.tsx`
  - `npm --workspace frontend run test -- src/features/ui-shell/shell-host.test.tsx`
  - `npm run typecheck`
  - `npm run lint`
  - `npm run test`
  - Browser verification: `npm run frontend:dev:e2e` on `http://127.0.0.1:5174` plus Playwright smoke that opened review, selected `pedestrian_01`, returned to library, reopened review, and saved `/tmp/us-005-shell-app-integration.png`
- Results:
  - `src/app/App.test.tsx` failed first on duplicated `Primary` navigation landmarks from leaked prior renders, then passed after explicit cleanup was added.
  - `src/features/ui-shell/shell-host.test.tsx` passed.
  - Repo-wide `npm run typecheck`, `npm run lint`, and `npm run test` passed.
  - Browser smoke passed and screenshot proof saved at `/tmp/us-005-shell-app-integration.png`.

### Final Summary

Added durable app-root frontend integration proof for the mockup shell and fixed the test-file cleanup leak it exposed, so the default `App` host now has explicit automated coverage for shell chrome, local navigation, back affordance, and selected-object inspector switching without live backend routes.

### Completion Gate

- [x] Acceptance Criteria checkboxes updated to match reality
- [x] Definition of Done checkboxes updated to match reality
- [x] Only now may `status` change to `done`
