---
title: e2e-tests
type: test_guide
canonical: true
domain: testing
aliases:
- browser e2e
- playwright e2e
- end to end tests
permalink: video-annotator/tests/e2e-tests
tags:
- testing
- e2e
- playwright
- browser
---

# e2e-tests

Use this note when one real browser-visible workflow across frontend, backend, and DB must be proven. If one manual smoke or screenshot is enough, use [[Using dev-browser for browser smoke verification]] instead.

## Use this layer when

- the workflow matters to a real reviewer
- lower-level tests would miss route wiring or browser behavior
- frontend, backend, and DB should all stay real
- only true external systems, such as SAM2 runtime, may be stubbed when they are not the subject of the test

## Do not use this layer when

- you only need one screen with fake backend data
- you are testing a helper, reducer, or API rule
- you only need one manual smoke or screenshot artifact

## Repo guardrails

- `tests/e2e/global.setup.ts` owns reset plus migrate plus baseline seed before committed Playwright specs run
- `backend:dev:e2e` only starts the FastAPI server; use `npm run backend:bootstrap:e2e` when browser proof needs clean indexed videos first
- use `npm run backend:seed:e2e:review-navigation` when browser proof needs seeded manifest markers
- shared Playwright harness stays under `tests/e2e/`, while frontend-owned browser specs and fixtures live under `frontend/tests/e2e/`
- host Playwright reads `.env.e2e`, uses backend `127.0.0.1:8001`, and starts fresh backend plus frontend servers instead of reusing stray local apps

## Verification

- Write one clear user story per spec.
- Prefer semantic selectors such as `getByRole` and `getByLabel`.
- Wait for visible signals, not fixed sleeps.
- Keep failures debuggable with trace or screenshot artifacts.
- Run the exact E2E command for the spec you changed.

## Observations

- [pattern] `tests/e2e/global.setup.ts` owns reset plus migrate plus baseline seed before committed Playwright specs run. #testing #e2e #playwright #bootstrap
- [gotcha] `backend:dev:e2e` only starts the server; without explicit seed, manifest jump controls stay disabled by design until real annotation rows exist. #testing #e2e #manifest
- [technique] `npm run backend:seed:e2e:review-navigation` is the repo-provided scenario seed path for browser proof that needs manifest jump markers immediately. #testing #e2e #manifest #bootstrap
- [gotcha] Repo env files own port truth now; local dev defaults use backend `127.0.0.1:8000`, while host Playwright E2E uses backend `127.0.0.1:8001`. #testing #e2e #playwright #ports #env
- [retrieval] Use this note for Playwright E2E, browser workflow, or real cross-stack reviewer journey queries. #search

## Relations

- indexed_by [[Tests Index]]
- relates_to [[Using dev-browser for browser smoke verification]]
- relates_to [[Testing tools]]
