---
id: task-testing-review-workspace-ergonomics
title: Testing review workspace ergonomics
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
- workspace
- ergonomics
permalink: video-annotator/tasks/testing-review-workspace-ergonomics
---

## Creation Phase

### Description

Add durable coverage for the mockup-first review workspace shell without pretending live backend wiring already exists. Start from `[[Review Workspace Ergonomics]]`, then carefully re-think backend integration, frontend integration, and browser E2E before writing tests. Use `[[frontend-integration-tests]]`, `[[backend-api-integration-tests]]`, and `[[e2e-tests]]` first instead of copying old test shape.

### Scope

- In scope: library render, review render, page navigation, selected-object inspector switching, blocked rows for live backend or live-review gaps, and detailed manual checks for current shell ergonomics
- Out of scope: backend contract work, live review wiring, SAM2 runtime behavior, export work, or pretending blocked flows already have runnable coverage

### Affected Features

- [[Review Workspace Ergonomics]]

### Testing Notes

- [[frontend-integration-tests]]
- [[backend-api-integration-tests]]
- [[e2e-tests]]

### Acceptance Criteria

- [x] Task note explicitly re-thinks backend integration vs frontend integration vs browser E2E with help from the testing notes before choosing coverage
- [x] Frontend integration covers library render, review render, open-review navigation, back-to-library navigation, and selected-object inspector switching for the mockup shell
- [x] Browser E2E stays optional and is used only if the task note explains why frontend integration is not enough for one shell workflow
- [x] Live backend or live-review gaps stay blocked with exact reasons instead of fake green tests
- [x] Manual frontend checks describe reviewer navigation flow clearly and show what still cannot be performed in the live stack
- [x] `[[Review Workspace Ergonomics]]` is updated with evidence links and honest execution status values

### Test Intent

- Backend: none by default for the shell slice; if backend coverage becomes necessary, the task must explain why the shell question is really backend-owned
- Frontend: prove mockup-first shell behavior with fixture-backed UI and local page state while keeping backend fake at request boundary
- Manual: show how reviewer navigation feels in the shell today, where speed improves, and which live-review gaps remain blocked

### Definition of Done

- [x] Relevant backend tests pass
- [x] Relevant frontend tests pass
- [x] Feature note updated
- [x] Manual execution status recorded honestly
- [x] Docs or memory updated if behavior or contracts changed

## Planning Phase

### Planned Integration Tests

- Backend:
  - none; mockup shell is fixture-backed UI-only path and this story does not change backend-owned truth
- Frontend:
  - run `frontend/src/app/App.test.tsx` as app-host proof for library render, review render, `Open Review`, `Back to Library`, selected-object switching, and reopen coherence
  - run `frontend/src/features/ui-shell/shell-host.test.tsx` as lower shell-seam proof for library chrome, review chrome, local navigation, and inspector switching without live review wiring

### Planned E2E Tests

- Backend:
  - none; no browser-to-backend workflow is being added in this story
- Frontend:
  - browser E2E stays absent because fixture-backed frontend integration already proves shell workflow cleanly at lower cost
  - do one manual browser smoke run through library -> review -> back-to-library, then record exact live-stack gaps that still block full browser proof

### Planned Implementation

- Step 1: audit current shell tests against acceptance criteria and confirm missing proof is evidence/truth work, not backend coverage
- Step 2: run focused frontend integration commands and manual browser smoke, then record exact results and blocked live-review reasons in task and feature notes
- Step 3: update Ralph tracking files only after verification evidence is written down honestly

### Feature Matrix Updates

- Feature note updates needed before or during execution:
  - `[[Review Workspace Ergonomics]]` should record that shell ergonomics proof is fixture-backed frontend integration plus manual browser smoke
  - `[[Review Workspace Ergonomics]]` should name live backend and live review workspace gaps explicitly instead of implying they are already covered

## Execution Phase

### Implementation Notes

- Re-read `[[frontend-integration-tests]]`, `[[backend-api-integration-tests]]`, and `[[e2e-tests]]` before touching verification so layer choice stayed anchored to ownership instead of habit.
- Chose frontend integration over backend integration because shell path is owned by `frontend/src/app/App.tsx`, `frontend/src/features/ui-shell/shell-host.tsx`, and `frontend/src/features/ui-shell/loader.ts`, all of which stay fixture-backed and never hit backend routes.
- Chose no committed browser E2E because shell workflow is local state plus static fixtures; lower-cost frontend integration already proves render and navigation behavior more directly.
- Audited existing shell coverage and confirmed `frontend/src/app/App.test.tsx` plus `frontend/src/features/ui-shell/shell-host.test.tsx` already cover library render, review render, `Open Review`, `Back to Library`, and selected-object inspector switching for the default host path.
- Ran manual browser smoke through fixture shell to confirm reviewer can open review, switch selected object, and return to library outside test runner.
- Left production code untouched; this story closes evidence and feature-truth gaps, not a product-behavior gap.

## Wrap-Up Phase

### Verification

- Commands run:
  - `npm --workspace frontend run test -- src/app/App.test.tsx src/features/ui-shell/shell-host.test.tsx`
  - `npm run typecheck`
  - `npm run lint`
  - `npm run test`
  - Browser verification: `npm run frontend:dev:e2e` on `http://127.0.0.1:5174` plus Playwright smoke that opened review, selected `pedestrian_01`, returned to library, and saved `/tmp/us-006-library-shell.png`, `/tmp/us-006-review-shell.png`, and `/tmp/us-006-library-return.png`
- Results:
  - Focused frontend integration passed: 2 files, 6 tests.
  - Repo-wide `npm run typecheck`, `npm run lint`, and `npm run test` passed.
  - Browser smoke passed on fixture shell and screenshots were captured.
  - Live-stack ergonomics remain blocked because `frontend/src/app/App.tsx` mounts `UiShellApp`, `frontend/src/features/ui-shell/loader.ts` returns static fixtures, and review-shell controls stay UI-only rather than driving `LiveReviewApp`, `useVideoReviewWorkspace`, or backend routes.

### Final Summary

Closed mockup-shell ergonomics evidence gap without changing product behavior. Task now records why frontend integration is right layer for this fixture-backed shell, captures manual browser smoke for reviewer navigation flow, and names exact live-stack blockers instead of implying backend-backed review ergonomics are already proven.

### Completion Gate

- [x] Acceptance Criteria checkboxes updated to match reality
- [x] Definition of Done checkboxes updated to match reality
- [x] Only now may `status` change to `done`
