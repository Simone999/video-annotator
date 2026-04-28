---
title: Clean frontend shared and router boundaries
type: note
permalink: video-annotator/tasks/clean-frontend-shared-and-router-boundaries
id: task-clean-frontend-shared-and-router-boundaries
status: done
steps:
- creation
- planning
- execution
- wrap_up
tags:
- task
- frontend
- routing
- shared
- react
- architecture
---

# Clean frontend shared and router boundaries

## Creation Phase

### Description

Clean frontend structure so `frontend/src/app/` keeps app wiring only, reusable frontend primitives move under `frontend/src/shared/`, and similar route-status shells reuse one shared primitive while domain wrappers keep copy and actions feature-owned.

### Scope

- In scope: move reusable API base-url helper and Material Symbols icon wrapper into `shared/`, move router provider ownership into `app/router.tsx`, add one shared route-status shell primitive with feature-owned wrappers, keep `src/main.tsx` as style entry, and split static review chrome out of `live-review-screen.tsx`
- Out of scope: top-level `src/pages/`, backend contract changes, route URL changes, new review business logic, or centralizing all loading or error state into one featureless status system

### Affected Features

- [[Video Ingest and Exact-Frame Review]]

### Acceptance Criteria

- [x] `frontend/src/app/` contains only app bootstrap, providers, router, and store concerns
- [x] Reusable API base-url and icon helpers live under `frontend/src/shared/`
- [x] `frontend/src/main.tsx` stays sole runtime style-entry import site
- [x] Similar full-screen route loading or empty or error shells reuse one shared primitive while feature wrappers keep domain copy and actions
- [x] Library and review route pages stay feature-owned under `frontend/src/features/*/pages/`
- [x] Relevant frontend tests, typecheck, and lint pass

### Test Intent

- Backend: none
- Frontend: write failing-first structure coverage for app or shared boundary ownership, then keep route and feature tests green through refactor
- Manual: none planned unless automated verification exposes layout regression that needs browser confirmation

### Definition of Done

- [x] Relevant frontend tests pass
- [x] Frontend typecheck passes
- [x] Frontend lint passes
- [x] Feature and docs or memory truth updated where structure references changed

## Planning Phase

### Planned Integration Tests

- Keep `frontend/tests/integration/app/app-routes.test.tsx` green while router ownership moves into `app/router.tsx`
- Keep touched library or review screen tests green while shared status primitive and review chrome extraction land

### Planned E2E Tests

- None required for this structure-only slice unless automated route coverage reveals unexpected runtime breakage

### Planned Implementation

- Add one failing structure test for shared helper ownership, shared route-status primitive, feature wrappers, and router module owning `BrowserRouter`
- Move reusable helpers into `frontend/src/shared/` and update imports plus tests
- Add shared route-status shell primitive and refactor library or review status panels into thin wrappers
- Move `BrowserRouter` ownership into `frontend/src/app/router.tsx` and keep `providers.tsx` non-router only
- Split static review top bar and rail into small feature-owned components without changing route or workspace behavior

### Feature Matrix Updates

- Update [[Video Ingest and Exact-Frame Review]] only if current-state or architecture wording becomes stale after structure cleanup

## Execution Phase

### Implementation Notes

- Started implementation session from approved plan and locked choices: keep `src/main.tsx`, keep feature-owned route pages, use shared primitive plus feature wrappers for similar route-status shells.
- Repo state now reflects the planned boundary split:
  - reusable API base-url helper and icon wrapper live under `frontend/src/shared/`
  - router ownership lives in `frontend/src/app/router.tsx`
  - similar route-status shells reuse one shared primitive with feature-owned wrappers
  - static review chrome is split out of `live-review-screen.tsx`

## Wrap-Up Phase

### Verification

- Commands run:
- `npm exec --workspace frontend vitest run tests/unit/frontend-structure/app-shared-boundaries.test.ts tests/integration/app/app-routes.test.tsx --coverage.enabled=false`
- `npm run typecheck`
- `npm run lint`
- Results:
- Focused frontend structure and route tests passed: `2` files, `10` tests.
- `npm run typecheck` passed for backend pyright and frontend `tsc`.
- `npm run lint` passed for backend Ruff and frontend ESLint.

### Final Summary

- Frontend shared and router boundaries now match the intended split: `app/` owns bootstrap and router wiring, reusable helpers live under `shared/`, and feature pages keep route ownership while sharing one route-status shell primitive.
### Completion Gate

- [x] Acceptance Criteria checkboxes updated to match reality
- [x] Definition of Done checkboxes updated to match reality
- [x] Only now may `status` change to `done`
