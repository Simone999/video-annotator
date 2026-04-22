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

## Backend toolchain

- `pytest` is the default runner for backend unit and integration tests.
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

## Browser helper

- `dev-browser` is for one-off browser smoke, screenshots, and small repeated browser checks. See [[Using dev-browser for browser smoke verification]].

## Coverage gotcha

- Repo-level `npm run test` enforces `90%` line and branch coverage on backend and frontend.
- Focused frontend reruns should call raw `vitest` with coverage off when global coverage gates would false-fail a single-file check.

## Observations

- [tooling] Unit tests in this repo usually use `pytest` or `Vitest`, depending on whether the local rule lives in backend or frontend code. #unit #testing
- [tooling] Backend workflow tool set for this repo is `pytest`, `httpx`, `TestClient`, `pytest-asyncio`, `factory-boy`, and `pytest-cov`. #backend #testing
- [tooling] Frontend workflow tool set for this repo is `Vitest`, `jsdom`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `Playwright`, `MSW`, and `Storybook`. #frontend #testing
- [gotcha] Focused frontend reruns should call raw `vitest` with coverage off, because the workspace command still enforces the global 90% gate. #frontend #testing #coverage
- [retrieval] Use this note for repo test tool choice, pytest vs Vitest vs Playwright, or MSW and Storybook queries. #search

## Relations

- indexed_by [[Tests Index]]
- relates_to [[unit-tests]]
- relates_to [[frontend-integration-tests]]
- relates_to [[backend-api-integration-tests]]
- relates_to [[e2e-tests]]
- relates_to [[Using dev-browser for browser smoke verification]]
