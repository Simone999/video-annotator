---
title: 2026-04-21 - keep frontend page ownership in features and frontend tests outside src
type: decision
canonical: true
domain: decisions
aliases:
- feature owned routes
- frontend tests outside src
- page ownership decision
permalink: video-annotator/decisions/2026-04-21-keep-frontend-page-ownership-in-features-and-frontend-tests-outside-src
tags:
- decision
- frontend
- routing
- tests
---

# 2026-04-21 - keep frontend page ownership in features and frontend tests outside src

- Date: 2026-04-21

## Decision

Frontend pages should live under the feature that owns them, not under vague app-shell folders. `frontend/src/app/` stays for app-wide setup only. Frontend tests should live outside `frontend/src/`, under `frontend/tests/`, and `ui-shell` should be removed in favor of explicit feature names like `video-library` and `video-review`.

## Why

The old structure mixed product capabilities with historical shell naming:
- `ui-shell` no longer describes a real product capability
- `live-review-app.tsx` in `app/` made page ownership look like app wiring
- query-string routing hid real page structure
- Vitest files under `src/` blurred runtime and test boundaries

Feature-owned routes plus an external frontend test tree make ownership clearer, keep app wiring thin, and match the chosen rule that global state belongs only in the closest common owner that truly needs it.

## Consequences
- Real frontend routes should be `/` and `/review/:videoId`, not `?app=live-review`.
- `frontend/src/app/` should keep router, providers, and app-config store wiring only.
- `frontend/src/shared/` should hold reusable frontend primitives such as base API helpers, icon wrappers, and generic route-status shell building blocks.
- `frontend/src/features/video-library/` and `frontend/src/features/video-review/` should own their route pages.
- Similar full-screen route loading, empty, and error shells may share one primitive, but feature wrappers should keep domain copy and actions.
- `frontend/src/app/live-review-app.tsx` is deleted; live review runtime ownership stays under `frontend/src/features/video-review/`.
- Frontend Vitest and Playwright suites live under `frontend/tests/`, not under `frontend/src/`.
- Frontend-owned Playwright specs and browser fixtures now live under `frontend/tests/e2e/`, while shared Playwright harness files stay under repo-root `tests/e2e/`.
- Route refresh proof for this stack means the current Vite dev plus Playwright flow; backend static-file SPA fallback is separate work.
- Task planning should re-think frontend integration vs browser E2E placement from the testing notes instead of inheriting the current file layout.
- Route or page UI touched during this stack should use Tailwind utilities instead of growing new non-Tailwind styling.
## Links

- Related notes: [[Move feature-owned frontend routes and externalize frontend tests]], [[Video Ingest and Exact-Frame Review]], [[SAM2 Shell and Runtime]]
- Related docs: `basic-memory/spec/engineering/Architecture.md`,
  `frontend/README.md`

## Observations
- [decision] Frontend page ownership lives in feature folders, while `frontend/src/app/` stays app-wide setup only. #frontend #routing
- [decision] Reusable frontend primitives belong under `frontend/src/shared/`, not `frontend/src/app/`. #frontend #architecture
- [decision] Similar full-screen route loading, empty, and error shells may share one primitive, but feature wrappers keep domain copy and actions. #frontend #ui #architecture
- [decision] Historical `ui-shell` runtime naming should be removed in favor of explicit feature names. #frontend #naming
- [decision] Frontend tests belong under `frontend/tests/`, not under `frontend/src/`. #frontend #tests
- [decision] Frontend-owned Playwright specs and browser fixtures live under `frontend/tests/e2e/`, while shared Playwright harness files stay under repo-root `tests/e2e/`. #frontend #tests #playwright
## Relations

- indexed_by [[Decisions Index]]
- relates_to [[Memory Index]]
- relates_to [[Move feature-owned frontend routes and externalize frontend tests]]
- relates_to [[Video Ingest and Exact-Frame Review]]
- relates_to [[SAM2 Shell and Runtime]]
