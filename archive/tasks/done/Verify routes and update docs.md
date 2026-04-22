---
id: task-verify-routes-and-update-docs
title: Verify routes and update docs
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
- docs
- e2e
- memory
permalink: video-annotator/tasks/verify-routes-and-update-docs
---

# Verify routes and update docs

## Creation Phase

### Description

Finish the refactor with browser proof, docs, and durable memory updates so the new route and test layout become explicit project truth instead of only code truth.

### Scope

- In scope: move Playwright route proof into `frontend/tests/e2e/`, point `playwright.config.ts` at that tree, add one route-focused browser test for `/` and `/review/:videoId`, update `docs/engineering/architecture.md` plus `frontend/README.md`, record the durable routing or test-layout decision in memory, and keep refresh proof limited to the current Vite dev plus Playwright flow
- Out of scope: new product behavior beyond what the earlier routing and test tasks already shipped
- Out of scope: backend static-file SPA fallback or any production-asset serving change

### Affected Features

- [[Review Workspace Ergonomics]]
- [[Video Ingest and Exact-Frame Review]]

### Acceptance Criteria

- [x] Playwright uses `frontend/tests/e2e/` as the frontend browser-test tree
- [x] Browser proof covers library load on `/`, navigation to `/review/:videoId`, refresh on the review route, and navigation back to `/`
- [x] `docs/engineering/architecture.md` describes real route paths instead of `?app=live-review`
- [x] `frontend/README.md` describes the real app structure and frontend test directories
- [x] Durable memory includes the decision to keep page ownership in features and frontend tests outside `src/`
- [x] Task planning explicitly rethinks frontend integration and E2E coverage using `[[frontend-integration-tests]]` and `[[e2e-tests]]`
- [x] Any route or page UI touched by this task uses Tailwind utilities instead of adding new non-Tailwind styling
- [x] Refresh proof in this task is limited to the current Vite dev and Playwright flow; backend static-file SPA fallback remains out of scope

### Test Intent

- Backend: none
- Frontend: Playwright route smoke plus any touched frontend test suites
- Manual: browser route proof if Playwright coverage still needs a manual gap note

### Definition of Done

- [x] Relevant frontend tests pass
- [x] Typecheck passes
- [x] Browser verification truth is recorded honestly

## Planning Phase

### Planned Integration Tests

- None new by default. `[[frontend-integration-tests]]` says keep frontend integration for React behavior with fake HTTP boundary, and this task changes browser-proof placement plus docs, not route runtime behavior.
- Re-run touched frontend suites only if E2E-tree or doc wiring forces app-path changes.

### Planned E2E Tests

- Move committed browser specs into `frontend/tests/e2e/` so frontend-owned browser proof lives with frontend tests while shared Playwright harness stays under `tests/e2e/`.
- Keep one route-journey spec for `/` -> `/review/:videoId` -> refresh -> `/` because `[[e2e-tests]]` says this is reviewer-visible route value that lower layers cannot prove alone.
- Keep seeded manifest-jump browser proof in Playwright too; move it with route spec so frontend browser stories share one tree.
- Verify route refresh only in current Vite dev plus Playwright flow. Do not expand scope into backend static-file SPA fallback.

### Planned Implementation

- Update `tests/e2e/playwright.config.ts` so Chromium project reads specs from `frontend/tests/e2e/` while setup stays on shared `tests/e2e/global.setup.ts`.
- Move `routes.spec.ts` and `review-navigation.spec.ts` into `frontend/tests/e2e/`, and fix imports to shared fixtures.
- Update docs and memory truth that still point at old Playwright roots instead of `frontend/tests/e2e/` for committed frontend browser proof.
- Refresh task, feature, decision, and progress artifacts with honest verification results.

### Feature Matrix Updates

- `[[Review Workspace Ergonomics]]`: update committed browser-proof paths and latest route-proof evidence.
- `[[Video Ingest and Exact-Frame Review]]`: update route-flow E2E evidence path.
- `[[2026-04-21 - keep frontend page ownership in features and frontend tests outside src]]`: extend durable decision to say committed frontend browser specs live under `frontend/tests/e2e/` while shared Playwright harness stays under `tests/e2e/`.

## Execution Phase

### Implementation Notes

- Kept shared Playwright bootstrap in `tests/e2e/` and moved committed frontend browser stories plus scenario fixture ownership into `frontend/tests/e2e/`.
- Added `frontend/tests/unit/frontend-structure/playwright-test-tree.test.ts` coverage for both moved specs and moved fixtures so the old repo-root Playwright tree cannot silently return.
- Updated supporting docs plus feature and decision notes so current route-proof evidence now points at `frontend/tests/e2e/` instead of stale repo-root spec paths.

## Wrap-Up Phase

### Verification

- Commands run:
  - `npm --workspace frontend run test -- tests/unit/frontend-structure/playwright-test-tree.test.ts`
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test`
  - `FRONTEND_E2E_PORT=3100 npm run test:e2e -- frontend/tests/e2e/routes.spec.ts frontend/tests/e2e/review-navigation.spec.ts`
- Results:
  - New Playwright-tree guardrail failed first while legacy `tests/e2e/specs/` still existed, then passed after the move.
  - `npm run lint`: passed.
  - `npm run typecheck`: passed.
  - `npm run test`: passed with `18` backend tests and `45` frontend tests.
  - Focused Playwright E2E: passed `3` tests on clean port `3100`, including setup bootstrap, route refresh, and seeded manifest-jump coverage.

### Final Summary

- Moved committed frontend browser proof into `frontend/tests/e2e/` while keeping shared Playwright setup under repo-root `tests/e2e/`.
- Updated `docs/engineering/architecture.md`, `frontend/README.md`, feature notes, and durable routing decision so route and test-tree truth now matches shipped code.
- Re-verified refresh on `/review/:videoId` with fresh seeded Playwright coverage instead of leaving it as stale-memory doubt.

### Completion Gate

- [x] Acceptance Criteria checkboxes updated to match reality
- [x] Definition of Done checkboxes updated to match reality
- [x] Only now may `status` change to `done`
