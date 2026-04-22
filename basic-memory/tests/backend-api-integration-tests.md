---
title: backend-api-integration-tests
type: test_guide
canonical: true
domain: testing
aliases:
- backend integration tests
- fastapi integration tests
- api integration tests
permalink: video-annotator/tests/backend-api-integration-tests
tags:
- testing
- backend
- api
- integration
- pytest
- fastapi
- httpx
---

# backend-api-integration-tests

Use this note when the truth lives at the FastAPI app boundary: validation, dependency wiring, route behavior, and persistence.

## Use this layer when

- the behavior is backend-owned
- the test should hit the real FastAPI app
- the DB or persisted state matters
- you can replace only heavy or external dependencies, such as the SAM2 runtime

## Do not use this layer when

- the rule is a small helper or reducer
- the main question is visible UI behavior
- the test needs a real browser workflow

Use [[frontend-integration-tests]] for screen behavior and [[e2e-tests]] for browser journeys.

## Repo guardrails

- backend-decoded `frame_idx` is canonical truth
- persistence checks matter as much as response checks
- keep app, route wiring, and DB real
- clear cached engine and session factories when tests swap `APP_DB_URL`
- choose this layer from backend ownership, not because a similar test already exists

## Verification

- Start from the owning feature note.
- Prepare isolated DB state.
- Write one request-plus-persistence story.
- Run `uv run --project backend pytest <path>`.
- Report exact pass or fail outcome.

## Observations

- [definition] Backend API integration tests in this repo hit the real FastAPI app boundary and keep validation, service wiring, and persistence real. #testing #backend #fastapi #integration
- [boundary] Exact-frame truth and persistence semantics belong in backend integration tests because backend frame retrieval is canonical. #testing #backend #boundary
- [technique] Good backend integration tests use isolated DB state, FastAPI `app.dependency_overrides` for selective replacement, and assertions on both response and saved state. #testing #backend #pytest #persistence
- [guardrail] Clear cached SQLAlchemy engine and session factory when backend api integration tests swap `APP_DB_URL`, or the app can keep talking to stale SQLite state inside the same pytest worker. #testing #backend #sqlite #cache
- [retrieval] Use this note for backend integration, FastAPI test DB, or persistence-boundary queries. #search

## Relations

- indexed_by [[Tests Index]]
- relates_to [[Testing tools]]
- relates_to [[unit-tests]]
- relates_to [[frontend-integration-tests]]
- relates_to [[e2e-tests]]
