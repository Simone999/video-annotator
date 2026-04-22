---
id: task-set-up-app-route-map
title: Set up app route map
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
- routing
- app
permalink: video-annotator/tasks/set-up-app-route-map
---

# Set up app route map

## Creation Phase

### Description

Add real browser routing for the frontend so the app uses `/` and `/review/:videoId` instead of `?app=live-review`. Keep `frontend/src/app/` limited to app-wide wiring with `App.tsx`, `providers.tsx`, `router.tsx`, and a minimal app-config store.

### Scope

- In scope: add `react-router`, wire `BrowserRouter`, create `frontend/src/app/router.tsx`, add `frontend/src/app/providers.tsx`, add minimal `frontend/src/app/store.ts`, replace query-string switching with route definitions for `/`, `/review/:videoId`, and `*`
- Out of scope: moving library runtime into `video-library`, moving live review route ownership into `video-review`, deleting `ui-shell` leftovers, or moving test files outside `src/`

### Affected Features

- [[Review Workspace Ergonomics]]

### Acceptance Criteria

- [x] App boot uses a real route table instead of `?app=live-review`
- [x] `/` resolves through the router to the current library runtime entry
- [x] `/review/:videoId` resolves through the router, even if later tasks still refine the route element
- [x] `frontend/src/app/store.ts` is app-config-only and does not hold page or feature workflow state
- [x] Unknown routes render a small not-found route with a clear path back to `/`
- [x] Task planning explicitly rethinks frontend integration and E2E coverage using `[[frontend-integration-tests]]` and `[[e2e-tests]]`
- [x] Any route or page UI touched by this task uses Tailwind utilities instead of adding new non-Tailwind styling
- [x] Routing support in this task is limited to the current Vite dev and Playwright flow; backend static-file SPA fallback stays out of scope

### Test Intent

- Backend: none
- Frontend: add or update route integration proof for `/`, `/review/:videoId`, and `*`
- Manual: open `/` and one direct `/review/<videoId>` path under the dev frontend

### Definition of Done

- [x] Relevant frontend tests pass
- [x] Typecheck passes
- [x] Routing truth is recorded honestly in task wrap-up

## Planning Phase

### Planned Integration Tests

- Update `frontend/src/app/App.test.tsx` so route-aware app-host coverage proves:
  - `/` renders the current backend-backed library runtime entry
  - `/review/:videoId` resolves through router and passes route param into temporary live-review route adapter
  - unknown routes render a small not-found view with a link back to `/`
- Keep this at frontend integration layer because story changes React route wiring and app-host rendering, while backend stays fake at HTTP boundary.

### Planned E2E Tests

- No committed Playwright coverage in this task. Browser proof stays manual `dev-browser` smoke because route-map wiring is small and `[[Verify routes and update docs]]` owns route-focused committed browser coverage later.
- Manual smoke will verify:
  - `/` opens current library runtime on Vite dev stack
  - direct `/review/<videoId>` loads live review host for known backend video id
  - unknown route shows not-found copy and `Back to Library` navigation

### Planned Implementation

- Add `react-router` dependency for browser routing with current Vite SPA stack.
- Add `frontend/src/app/store.ts` as app-config-only route config, not page or review workflow state.
- Add `frontend/src/app/providers.tsx` to own router provider wiring.
- Add `frontend/src/app/router.tsx` for `/`, `/review/:videoId`, and `*`.
- Keep `/` route on current `UiShellApp` runtime entry for now; `[[Move library route ownership]]` will move route page ownership into `frontend/src/features/video-library/`.
- Use temporary app-level review-route adapter that reads `videoId` from router params and passes it into `LiveReviewApp`; `[[Extract live review feature entry]]` will move ownership into `frontend/src/features/video-review/`.
- Add small Tailwind-only not-found route view with clear path back to `/`.
- Remove `?app=live-review` switching from `frontend/src/app/App.tsx`.

### Feature Matrix Updates

- After verification, update `[[Review Workspace Ergonomics]]` to record that real `/` and `/review/:videoId` app-host routes now exist, while feature-owned page extraction still remains follow-up in later tasks.

## Execution Phase

### Implementation Notes

- Chose frontend integration after re-reading `[[frontend-integration-tests]]` because this story changes app-host route wiring and user-visible route outcomes while backend can stay fake at HTTP boundary.
- Did not add committed browser E2E after re-reading `[[e2e-tests]]` because one real-browser smoke is enough for this route-table slice, and later route-proof work already lives in `[[Verify routes and update docs]]`.
- Installed `react-router` and split app wiring into `frontend/src/app/App.tsx`, `frontend/src/app/providers.tsx`, `frontend/src/app/router.tsx`, and `frontend/src/app/store.ts`.
- Kept `/` on current `UiShellApp` runtime entry and used a temporary app-level `/review/:videoId` adapter that reads route params and passes `initialVideoId` into `LiveReviewApp`.
- Added a small Tailwind-only not-found route with `Back to Library`.
- Expanded `frontend/src/app/App.test.tsx` so app-host coverage now proves legacy `?app=live-review` is ignored, `/review/:videoId` resolves through router, and `*` returns to `/`.

## Wrap-Up Phase

### Verification

- Commands run:
- `npm --workspace frontend run test -- src/app/App.test.tsx`
- `npm --workspace frontend run typecheck`
- `npm --workspace frontend run lint`
- `npm --workspace frontend run test`
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `dev-browser --headless` route smoke against `http://127.0.0.1:5174`
- Results:
- targeted app-route integration: pass
- frontend `typecheck`: pass
- frontend `lint`: pass
- frontend `test`: pass
- repo `lint`: pass
- repo `typecheck`: pass
- repo `test`: pass
- browser smoke:
  - `/`: pass
  - `*`: pass, `Back to Library` returned to `/`
  - `/review/video-2d62649f3590f8d0`: route resolved and marked `Open bedroom.mp4` selected from URL state, but current local backend `/api/videos/{video_id}/manifest` returned `500`, so full live-workspace bootstrap stayed blocked by pre-existing backend issue
  - screenshots: `/home/simone/.dev-browser/tmp/us001-library-route.png`, `/home/simone/.dev-browser/tmp/us001-review-route.png`, `/home/simone/.dev-browser/tmp/us001-missing-route.png`

### Final Summary

Added real browser route wiring for `/`, `/review/:videoId`, and `*`, removed legacy query-string switching from app boot, kept app config in a minimal store, and recorded honest browser smoke for the new route map.

### Completion Gate

- [x] Acceptance Criteria checkboxes updated to match reality
- [x] Definition of Done checkboxes updated to match reality
- [x] Only now may `status` change to `done`
