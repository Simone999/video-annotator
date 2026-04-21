---
title: Move feature-owned frontend routes and externalize frontend tests
type: plan
permalink: video-annotator/plans/active/move-feature-owned-frontend-routes-and-externalize-frontend-tests
status: active
tags:
- plan
- frontend
- routing
- tests
---

# Move feature-owned frontend routes and externalize frontend tests

Replace query-string app switching with feature-owned routes, remove the historical `ui-shell` runtime split, and move frontend tests out of `src/`.

## Summary

- Goal: make `/` and `/review/:videoId` the real frontend entrypoints, keep `frontend/src/app/` for app wiring only, move all frontend tests under `frontend/tests/`, and then polish the route-owned library and review pages against the approved mockups without fake data.
- Success criteria: route pages live under their owning features, `ui-shell` runtime is gone, `live-review-app.tsx` is deleted instead of preserved as page ownership, no frontend `*.test.ts*` files remain under `frontend/src/`, the route-owned library matches the mockup direction with honest live data, and the route-owned review page has both loaded-state polish and a designed failure state.
- Audience: future implementation sessions working on frontend structure, routing, test layout, and route-owned UI polish.

## Current State

- Existing behavior: `frontend/src/app/App.tsx` still chooses live review through `?app=live-review`; `frontend/src/features/ui-shell/` mixes library runtime, fixture review runtime, and app-shell naming; live review behavior still enters through `frontend/src/app/live-review-app.tsx`; frontend Vitest files live under `frontend/src/`.
- Main gaps: page ownership is not explicit by feature, route state is not URL-based, `ui-shell` is historical and vague, the current frontend test layout does not match the chosen rule to keep tests outside `src/`, the live library still drifts from `docs/ui/video-library-mockup.png`, and the live review route still needs a mockup-aligned loaded shell plus a designed failure state instead of broken bootstrap presentation.
- Constraints: backend frame index stays canonical; `frontend/src/app/` should hold app-wide setup only; global state belongs only in the closest common owner that truly needs it; fixture-only review runtime should not survive this refactor; `frontend/vite.config.ts` already enables Tailwind, so touched route or page UI should move toward Tailwind utilities instead of growing legacy CSS; preview imagery must stay honest by reusing existing backend frame routes instead of inventing placeholder art.

## Assumptions And Open Questions

- Locked assumptions:
  - canonical frontend routes are `/` and `/review/:videoId`
  - use the current `react-router` package for browser routing
  - `frontend/src/app/store.ts` stays minimal and app-config-only
  - library runtime moves under `frontend/src/features/video-library/`
  - live review route ownership moves under `frontend/src/features/video-review/`
  - frontend tests move under `frontend/tests/{unit,integration,e2e}`
  - the old `ui-shell` runtime should be deleted, not preserved as page owners
  - `frontend/src/app/live-review-app.tsx` should be deleted after live review extraction lands
  - route refresh support in this stack means the current Vite dev and Playwright flow; backend static-file SPA fallback is out of scope
- Open questions:
  - none for stage 1

## Affected Features

- [[Review Workspace Ergonomics]]
- [[Video Ingest and Exact-Frame Review]]

## Task Breakdown

1. [[Set up app route map]] — add real route table and app-level wiring without query-string switching
2. [[Move library route ownership]] — migrate library runtime from `ui-shell` into `video-library`
3. [[Extract live review feature entry]] — move `/review/:videoId` ownership and live review logic under `video-review`
4. [[Delete app live review entrypoint]] — remove `frontend/src/app/live-review-app.tsx` after route ownership is stable
5. [[Delete ui-shell runtime leftovers]] — remove fixture review runtime and stale shell naming after route ownership lands
6. [[Move frontend tests outside src]] — migrate Vitest suites and setup into `frontend/tests/`
7. [[Polish video-library route UI]] — fix route-owned library visual drift against the mockup while keeping live data and previews honest
8. [[Polish video-review route UI]] — fix route-owned review visual drift and add a designed failure state without fake review data
9. [[Verify routes and update docs]] — add browser route proof, update docs, and record the durable decision

## Handoff Notes

- Read `[[Workflow]]`, `[[Review Workspace Ergonomics]]`, `[[Frontend Interaction Spec]]`, `[[frontend-integration-tests]]`, and `[[e2e-tests]]` first.
- Keep dependency order strict: route map first, library route next, live review extraction after that, delete the app-level review entry only after feature ownership is stable, then cleanup, then test-tree migration, then route-owned library UI polish, then route-owned review UI polish, then browser proof plus docs.
- Do not invent new backend routes or relax canonical backend `frame_idx` ownership during this refactor.
- Do not keep test-only runtime helpers under `frontend/src/`; if a dumb runtime placeholder is truly needed during implementation, it must live in the owning feature and carry a future-replacement comment.
- Existing `AGENTS.md` patterns that preserve `ui-shell`, `?app=live-review`, and `frontend/src/app/live-review-app.tsx` are stale for this stack and must be updated as part of the implementation.
- Every task planning phase must re-think frontend integration vs E2E boundaries from `[[frontend-integration-tests]]` and `[[e2e-tests]]` instead of copying current test seams.
- Use `[[Comparing live pages against UI mockups 2026-04-21]]` as the route-owned visual gap inventory. Tests should be written per visible issue cluster before UI changes, and real-stack browser failures must be recorded honestly instead of hidden behind fixture fallback.
- Current `frontend/src/app/live-review-app.tsx` is large enough that extraction and deletion should not be one task, but deletion is still a locked end state for this stack.

## Observations

- [plan] This plan replaces query-param app switching with feature-owned routes and moves frontend tests outside `src/`. #frontend #routing #tests
- [decision] `ui-shell` should be removed in favor of explicit feature names like `video-library` and `video-review`. #frontend #naming
- [rule] `frontend/src/app/` is reserved for app-wide setup and should not own page behavior long-term. #frontend #architecture

## Relations

- indexed_by [[Active Plans Index]]
- relates_to [[Workflow]]
- relates_to [[Review Workspace Ergonomics]]
- relates_to [[Video Ingest and Exact-Frame Review]]
- relates_to [[2026-04-21 - keep frontend page ownership in features and frontend tests outside src]]
- relates_to [[Comparing live pages against UI mockups 2026-04-21]]
