---
title: Testing tools
type: note
permalink: video-annotator/tests/testing-tools
tags:
- testing
- tools
- backend
- frontend
- pytest
- vitest
- jsdom
- playwright
- msw
- storybook
---

# Testing tools

This note lists reusable testing tools for this repo by test boundary.
Use smallest tool set that proves the boundary you care about.
Do not drag browser stack into backend contract tests. Do not drag full E2E into screen-level checks.
Use [[Tests Index]] when you first need the right test layer. Use this note after the boundary is already chosen.
Choose the layer from feature notes and product code first; do not use existing tests as the router.

## How to use this note

1. Choose the boundary first in [[Tests Index]] or the owning feature note.
2. Read only the tool row for that boundary.
3. Run one exact verification command after writing the test.

Guide links point to Context7 pages when available.

## Backend

Backend tests prove API contracts, service rules, persistence, and async job behavior without browser UI.

### Backend Testing Tools

| Tool | Purpose | How to use | Guide |
| --- | --- | --- | --- |
| `pytest` | Run backend unit and integration tests with fixtures and plain asserts. | Put tests under `backend/tests` and run `uv run --project backend pytest`. | [ctx7](https://context7.com/pytest-dev/pytest) |
| `httpx` | Async HTTP client for async API tests and client-level request flows. | Use `httpx.AsyncClient` when test needs async request flow instead of sync client. | [ctx7](https://context7.com/encode/httpx) |
| `TestClient` | Sync FastAPI test client for route tests around app boundary. | Build app, create `TestClient`, send sync requests, assert status and payload. | [ctx7](https://context7.com/fastapi/fastapi) |
| `pytest-asyncio` | Run async pytest functions. | Mark async tests with `@pytest.mark.asyncio` and await async helpers. | [ctx7](https://context7.com/pytest-dev/pytest-asyncio) |
| `factory-boy` | Generate reusable fake test objects, data, models, etc. | Start reusable builders in `backend/tests/factories/models.py`, then build or create data instead of hand-writing large fixtures. | [ctx7](https://context7.com/websites/factoryboy_readthedocs_io_en_stable) |
| `pytest-cov` | Report coverage for backend test runs. | Run `pytest --cov=app` or repo coverage command when coverage matters. | [ctx7](https://context7.com/pytest-dev/pytest-cov) |

## Frontend

Frontend tests prove typed client boundaries, reducer and hook state, DOM rendering, user flows, and full browser workflows.

### Frontend Testing Tools

| Tool | Purpose | How to use | Guide |
| --- | --- | --- | --- |
| `Vitest` | Run frontend unit and component tests with mocks and snapshots. | Run `npm --workspace frontend run test` and use `vi` for mocks, spies, and timers. | [ctx7](https://context7.com/vitest-dev/vitest) |
| `jsdom` | Provide browser-like DOM environment for component and hook tests. | Set `test.environment = "jsdom"` in config or use `// @vitest-environment jsdom` per file. | [ctx7](https://context7.com/jsdom/jsdom) |
| `@testing-library/react` | Render React UI and query it the way user sees it. | Render component, then query by role, label, text, and other user-facing selectors. | [ctx7](https://context7.com/testing-library/react-testing-library) |
| `@testing-library/user-event` | Simulate realistic user actions such as click, type, tab, and keyboard shortcuts. | Prefer `userEvent` for user flows instead of low-level event dispatch when behavior matters. | [ctx7](https://context7.com/testing-library/user-event) |
| `@testing-library/jest-dom` | Add expressive DOM matchers such as `toBeInTheDocument()`. | Load matcher setup once in `frontend/src/test/setup.ts`, then use richer DOM assertions in component tests. | [ctx7](https://context7.com/testing-library/jest-dom) |
| `Playwright` | Run end-to-end tests in real browsers. | Use for full review flows, route wiring, and browser behavior that DOM mocks cannot prove. | [ctx7](https://context7.com/microsoft/playwright) |
| `dev-browser` | Run manual browser smoke and incremental browser automation on the local stack. | Use for one-off visual checks, screenshot evidence, and small repeated browser workflows; keep scripts small and follow [[Using dev-browser for browser smoke verification]]. | [[Using dev-browser for browser smoke verification]] |
| `MSW` | Mock API calls at request layer across tests and local UI work. | Reuse the shared server in `frontend/src/test/msw/server.ts`; register handlers per test or per story as needed. | [ctx7](https://context7.com/mswjs/msw) |
| `Storybook` | Build components in isolation and support interaction or a11y checks. | Run `npm run storybook` for local UI work or `npm run storybook:build` for verification; current config lives under `frontend/.storybook/`. | [ctx7](https://context7.com/storybookjs/storybook) |

## Observations
- [tooling] Unit tests in this repo usually use `pytest` or `Vitest`, depending on whether the local rule lives in backend or frontend code. #unit #testing
- [tooling] Backend workflow tool set for this repo is `pytest`, `httpx`, `TestClient`, `pytest-asyncio`, `factory-boy`, and `pytest-cov` #backend #testing
- [tooling] Frontend workflow tool set for this repo is `Vitest`, `jsdom`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `Playwright`, `MSW`, and `Storybook` #frontend #testing
- [tooling] `dev-browser` is repo tool for manual browser smoke, screenshot artifacts, and small repeated browser workflows; committed broad-stack suites still belong to `Playwright`. #frontend #browser #dev-browser
- [setup] Shared frontend test setup lives in `frontend/src/test/setup.ts`, and shared MSW server bootstrap lives in `frontend/src/test/msw/server.ts` #frontend #testing #msw #jest-dom
- [setup] Current reusable backend factory starters live in `backend/tests/factories/models.py` #backend #testing #factory-boy
- [pattern] Pick smallest tool set that matches the test boundary instead of forcing every tool into every test #testing #workflow
- [retrieval] Use this note for testing tools, repo test tool choice, pytest vs vitest vs playwright, or boundary-based test tool queries #testing #tools
- [retrieval] Search query `testing tools` should land on this note for pytest, Vitest, jsdom, Playwright, MSW, Storybook, and boundary-based tool selection. #testing #tools #pytest #vitest #playwright

## Relations
- indexed_by [[Tests Index]]
- relates_to [[unit-tests]]
- relates_to [[e2e-tests]]
- relates_to [[frontend-integration-tests]]
- relates_to [[backend-api-integration-tests]]
- relates_to [[Using dev-browser for browser smoke verification]]
