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
- docker E2E command surface is:
  - `npm run test:e2e:docker:build`
  - `npm run test:e2e:docker:up`
  - `npm run test:e2e:docker:test`
  - `npm run test:e2e:docker:down`
  - `npm run test:e2e:docker`
- run `npm ci` on the host before Docker E2E; the Playwright runner bind-mounts the repo and expects repo Node dependencies to exist on that mount
- `npm run test:e2e:docker` is the clean full-run path for the committed browser smoke subset: it tears down old stack state first, builds, starts backend plus frontend, seeds review-navigation scenario through backend container, runs `frontend/tests/e2e/routes.spec.ts` plus `frontend/tests/e2e/review-navigation.spec.ts` in docker mode, then tears down even on failure
- `npm run test:e2e:docker:test` reuses or starts backend plus frontend and leaves stack up for iterative runs; use `npm run test:e2e:docker:down` when done
- both docker commands accept explicit spec args after `--`; use that when a newer browser spec is not part of the default smoke subset yet
- shared Playwright harness stays under `tests/e2e/`, while frontend-owned browser specs and fixtures live under `frontend/tests/e2e/`
- host Playwright reads `.env.e2e`, uses backend `127.0.0.1:8001`, and starts fresh backend plus frontend servers instead of reusing stray local apps
- docker Playwright reads `.env.docker-e2e`, uses backend service name `backend`, frontend service name `frontend`, and receives review-navigation scenario JSON from the host wrapper instead of shelling `uv` inside the Playwright image
- local Playwright stays `fullyParallel: true`, but CI workers stay pinned to `1` because the harness shares fixed ports, shared reset or seed flow, and shared tmp SQLite plus mask paths
- E2E stays out of local git hooks; run it manually or from CI where path-based triggers can be owned outside the repo command surface

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
- [workflow] E2E stays outside git hooks, and CI workers stay serial because the current harness shares ports and persisted tmp paths. #testing #e2e #workflow #parallelism
- [retrieval] Use this note for Playwright E2E, browser workflow, or real cross-stack reviewer journey queries. #search

## Relations

- indexed_by [[Tests Index]]
- relates_to [[Using dev-browser for browser smoke verification]]
- relates_to [[Testing tools]]
