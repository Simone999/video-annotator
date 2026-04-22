# Frontend

React + TypeScript + Vite frontend for local-first video review.

## Routes

- `/`: route-owned video library page from `src/features/video-library/pages/library-page.tsx`
- `/review/:videoId`: route-owned review page from `src/features/video-review/pages/review-page.tsx`
- `*`: small not-found route owned by app router

`src/app/` stays app wiring only: `App.tsx`, `providers.tsx`, `router.tsx`, `store.ts`, and shared app config.

## Feature layout

- `src/features/video-library/`: backend-backed library route, loaders, and route chrome
- `src/features/video-review/`: live review route page, workspace composition, and exact-frame review logic
- `src/app/`: app-wide wiring only

## Test layout

- `tests/unit/`: frontend unit and structure guardrails
- `tests/integration/`: React screen and feature tests with fake HTTP at request boundary
- `tests/e2e/`: frontend-owned Playwright specs and browser fixtures
- `tests/e2e/fixtures/`: frontend-owned browser scenario helpers

Shared Playwright harness stays outside frontend tree in repo root `tests/e2e/`:

- `tests/e2e/playwright.config.ts`
- `tests/e2e/global.setup.ts`

## Common commands

```bash
npm run frontend:dev
npm --workspace frontend run test   # fails below 80% frontend line coverage
npm --workspace frontend run typecheck
npm run test:e2e
```
