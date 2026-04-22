---
id: task-wire-live-library-shell
title: Wire live library shell
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
- library
- review
permalink: video-annotator/tasks/wire-live-library-shell
---

## Creation Phase

### Description

Replace fixture-only library loading on the default shell path with backend-backed review summaries while preserving the current `App.tsx` and `shell-host.tsx` boundaries. This task should make normal app startup reflect real indexed videos instead of hardcoded mock cards.

### Scope

- In scope: live library data loader, typed frontend client for review summaries, empty or error handling on default host, and `Open Review` wiring for real video ids
- Out of scope: live review layout rewrite, router work, export shipping, or fixture-shell-only visual experiments

### Affected Features

- [[Review Workspace Ergonomics]]
- [[Video Ingest and Exact-Frame Review]]

### Acceptance Criteria

- [x] Default app library host loads real review summaries from backend instead of `uiShellFixtureData`
- [x] Library cards stay aligned with shell presentation boundaries while using honest live data
- [x] Opening review from library selects a real backend video id with no router dependency
- [x] Frontend tests cover live library loading and navigation states

### Test Intent

- Backend: only mocked HTTP or existing backend routes needed for frontend proof
- Frontend: prove default app host renders live library state, handles load failures, and opens review from backend-derived rows
- Manual: open default app and verify library shows real indexed content instead of fixture cards

### Definition of Done

- [x] Relevant frontend tests pass
- [x] Manual execution status recorded honestly
- [x] Memory updated if behavior changes
- [x] Supporting docs updated if frontend contract changes

## Planning Phase

### Planned Integration Tests

- Backend:
- none; this story proves frontend behavior with mocked HTTP at `/api/videos`
- Frontend:
  - extend `frontend/src/app/App.test.tsx` so default host proves live library load from backend-shaped rows, empty-library messaging, load-failure messaging, and `Open Review` bridge into the live review host with a real backend video id
  - update `frontend/src/features/ui-shell/shell-host.test.tsx` to keep lower seam fixture proof by mocking `loadUiShellData`, so shell presentational coverage stays separate from live-library host coverage

### Planned E2E Tests

- Backend:
- none
- Frontend:
- browser smoke on default app path: verify library renders backend-backed rows instead of fixture card names, then open one real row and confirm the review host receives that selection without router navigation

### Planned Implementation

- Step 1: add red app-host tests for live library ready, empty, and error states plus review-open bridge, while keeping lower shell seam tests mocked to fixtures
- Step 2: replace fixture-only `ui-shell` loader with a typed live-library client plus mapper from backend review summaries into shell card fields and summary metrics
- Step 3: preserve `shell-host.tsx` local page state, but branch live-library review opens into `LiveReviewApp` through a tiny host adapter instead of redesigning review layout in this story

### Feature Matrix Updates

- Feature note updates needed before or during execution:
  - `[[Review Workspace Ergonomics]]` should record that default host now reads backend library summaries while live review layout remains legacy until the next task
  - `[[Video Ingest and Exact-Frame Review]]` should note that normal app startup now reaches real indexed library rows before entering live review

## Execution Phase

### Implementation Notes

- Chosen minimal path: keep library shell chrome, make default loader backend-backed, and use only a tiny `LiveReviewApp` host adapter for `Open Review` because single-stage review rewrite belongs to `[[Build live single-stage review]]`.
- Added `frontend/src/features/ui-shell/api.ts` as a shell-local typed client for `/api/videos`, so default-host library mapping stays outside `frontend/src/features/video-review/api.ts`.
- Split shell data truth by source: fixture review-shell coverage now stays in `frontend/src/features/ui-shell/shell-host.test.tsx` by mocking `loadUiShellData`, while default-host proof in `frontend/src/app/App.test.tsx` now exercises backend-shaped rows, empty state, load failure, and live-review handoff.
- Kept review handoff minimal: `shell-host.tsx` still owns page state locally, but live-library `Open Review` now renders `LiveReviewApp` with `initialVideoId` and `onBackToLibrary` instead of inventing new router state or redesigning review layout early.

## Wrap-Up Phase

### Verification

- Commands run:
- `npm --workspace frontend run test -- src/app/App.test.tsx`
- `npm --workspace frontend run test -- src/features/ui-shell/shell-host.test.tsx`
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run frontend:dev:e2e`
- `npm run backend:dev:e2e`
- `curl -s http://127.0.0.1:8000/api/videos`
- `node --input-type=module <<'EOF' ... playwright smoke ... EOF`
- Results:
- Targeted frontend tests passed: `App.test.tsx` 5 tests and `shell-host.test.tsx` 4 tests.
- Repo-wide lint passed after one typed-spy cleanup and one type alias cleanup.
- Repo-wide typecheck passed.
- Repo-wide tests passed: backend `14 passed`; frontend `8 files, 29 tests passed`.
- Fresh backend smoke server on `127.0.0.1:8000` indexed real local `bedroom.mp4` and `smoke.mp4`; stale old port listeners were killed first so smoke used current code.
- Manual browser smoke on `http://127.0.0.1:5174` passed: default host rendered backend-backed library rows, `Open Review bedroom.mp4` entered live review with the selected real video, `Back to Library` returned to the library, and screenshots were saved at `/tmp/us-014-live-library-shell.png` and `/tmp/us-014-live-review-entry.png`.

### Final Summary

Replaced fixture-only default library loading with a typed backend `/api/videos` client plus honest shell-card mapping, preserved local shell page state, and added a tiny `LiveReviewApp` handoff so default-host `Open Review` now uses a real backend video id without router work. Verification covered targeted frontend red-green tests, repo-wide lint or typecheck or test gates, and real browser smoke against fresh local backend/frontend servers.

### Completion Gate

- [x] Acceptance Criteria checkboxes updated to match reality
- [x] Definition of Done checkboxes updated to match reality
- [x] Only now may `status` change to `done`
