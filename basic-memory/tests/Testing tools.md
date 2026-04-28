---
title: Testing tools
type: test_guide
canonical: true
domain: testing
aliases:
- testing tools
- pytest vitest playwright
- msw storybook
permalink: video-annotator/tests/testing-tools
tags:
- testing
- tools
- backend
- frontend
- pytest
- vitest
- playwright
- msw
- storybook
---

# Testing tools

Use this note after you already chose a test boundary. Keep the tool set as small as the boundary allows.

## Repo command surface

- `npm run test:unit` runs backend unit tests, then frontend unit tests.
- `npm run test:integration` runs backend integration tests, then frontend integration tests.
- `npm run test` is still the full coverage gate.
- `make precommit-install` installs both managed hook types.
- local git hooks now stage checks by boundary:
  - `pre-commit` runs format, lint-fix, lint, typecheck, then `npm run test:unit`
  - `pre-push` runs `npm run test:integration`
- `npm run test:e2e` stays manual or CI-owned and is not part of git hooks.

## Backend toolchain

- `pytest` is the default runner for backend unit and integration tests.
- backend default pytest config now uses xdist with `loadscope` distribution.
- use `uv --project backend run pytest -n 0` when you need single-process debugging.
- `TestClient` is the default sync FastAPI client.
- `httpx.AsyncClient` plus `ASGITransport` fits async request flows.
- `pytest-asyncio` supports async pytest cases.
- `factory-boy` is the reusable backend fixture builder.
- `pytest-cov` is for coverage-sensitive runs.

## Frontend toolchain

- `Vitest` is the default frontend runner.
- `jsdom` backs DOM-level unit and integration tests.
- `@testing-library/react` and `@testing-library/user-event` drive user-visible screen behavior.
- `@testing-library/jest-dom` adds DOM matchers from shared setup.
- `MSW` is the request-boundary fake for frontend integration tests.
- `Playwright` is for committed real-browser workflows.
- `Storybook` is for isolated UI work.
- shared `frontend/tests/setup/vitest.setup.ts` owns frontend per-test cleanup:
  - `cleanup()` for rendered DOM
  - `server.resetHandlers()` for MSW
  - `vi.useRealTimers()`
  - `vi.unstubAllGlobals()`
  - `vi.restoreAllMocks()`
  - `vi.clearAllMocks()` because hoisted `vi.fn()` mocks keep call history unless cleared
- shared jsdom media shims belong in `beforeEach` and must guard `typeof HTMLMediaElement !== "undefined"` so node-environment tests do not crash

## Browser helper

- `dev-browser` is for one-off browser smoke, screenshots, and small repeated browser checks. See [[Using dev-browser for browser smoke verification]].

## Coverage gotchas

- Repo-level `npm run test` enforces `90%` line and branch coverage on backend and frontend.
- Frontend coverage instrumentation now reports real totals instead of false `0/0` summaries.
- When repo-level `npm run test` still fails on frontend coverage, treat it as a real branch-gap problem, not an instrumentation problem.
- Focused frontend reruns may still call raw `vitest` with coverage off when verifying one slice, but reason is speed or isolation, not false `0/0` totals.

## Observations

- [tooling] Unit tests in this repo usually use `pytest` or `Vitest`, depending on whether the local rule lives in backend or frontend code. #unit #testing
- [tooling] Backend workflow tool set for this repo is `pytest`, `httpx`, `TestClient`, `pytest-asyncio`, `factory-boy`, and `pytest-cov`. #backend #testing
- [tooling] Frontend workflow tool set for this repo is `Vitest`, `jsdom`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `Playwright`, `MSW`, and `Storybook`. #frontend #testing
- [workflow] Frontend DOM tests start from shared cleanup in `frontend/tests/setup/vitest.setup.ts`; if a test needs raw media failures or different teardown, it must override that locally and restore truth honestly. #frontend #testing #jsdom
- [workflow] Repo verification is now split by boundary: unit tests on `pre-commit`, integration tests on `pre-push`, and E2E outside git hooks. #testing #workflow #hooks
- [gotcha] Frontend coverage totals now report correctly; keep any exact current coverage deficit in active task history, not in this durable tooling note. #frontend #testing #coverage
- [retrieval] Use this note for repo test tool choice, pytest vs Vitest vs Playwright, or git-hook stage routing queries. #search

## Relations

- indexed_by [[Tests Index]]
- relates_to [[unit-tests]]
- relates_to [[frontend-integration-tests]]
- relates_to [[backend-api-integration-tests]]
- relates_to [[e2e-tests]]
- relates_to [[Using dev-browser for browser smoke verification]]
