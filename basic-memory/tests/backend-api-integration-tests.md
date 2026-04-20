---
title: backend-api-integration-tests
type: note
permalink: video-annotator/tests/backend-api-integration-tests
tags:
- testing
- backend
- api
- integration
- backend-api-integration-tests
- backend api integration tests
- pytest
- fastapi
- httpx
---

# backend-api-integration-tests

Use this note when test must prove FastAPI route, validation, service wiring, and persistence work together without browser UI.
This is the backend API integration tests guide for video-annotator.
Tool catalog lives in [[Testing tools]].
Browser-wide workflow guidance lives in [[e2e-tests]].

Backend API integration tests sit between low-level unit tests and browser E2E:

- send requests to real FastAPI app
- keep route validation, dependencies, service logic, and DB real
- use test database or isolated test state
- replace only heavy or external dependencies when needed

Choose this layer from product behavior and backend ownership first.
Do not start by reading current tests to decide boundary; existing tests are only style references after the layer is already chosen.

## Default choice in this repo

Start here for backend-owned truth such as:

- `GET /api/videos/{id}/frame/{frame_idx}`
- invalid frame bounds or validation
- persistence after create, update, or delete
- propagation range semantics
- backend error contract at app boundary

Choose [[frontend-integration-tests]] instead when the main question is visible UI behavior after a fake response.

## First 5 steps

1. Read the owning feature note and current task note.
2. Inspect the route, service, and persistence code that owns the truth.
3. Prepare isolated DB state and selective dependency overrides only where needed.
4. Write one request-plus-persistence test.
5. Run `uv run --project backend pytest <path>`.

## Minimum done bar

- write the test
- run one exact backend verification command
- report pass or fail honestly
- do not stop at planning

## What this layer is for

Use this layer for backend behavior such as:

- exact-frame retrieval through backend-decoded frame index
- manual annotation create, update, and delete persistence
- prompt box or saved manual row persistence
- mask-generation API flow with fake SAM2 adapter
- propagation range semantics and persisted results
- failure cases at app boundary
- export contract and deterministic output once export exists

Feature truth stays in `features` notes.

## What this layer is not for

Do not use this layer for:

- tiny pure helpers
- full browser behavior
- visual overlay correctness in frontend
- real SAM2 model quality
- performance benchmarking

Frontend screen behavior belongs in [[frontend-integration-tests]].
Full browser workflow belongs in [[e2e-tests]].

## How to shape one test

Keep one meaningful workflow per test:

- request exact frame and verify returned frame truth
- save manual annotation and read it back
- start propagation and verify only requested range is affected
- delete saved annotation and verify persistence is gone

Use simple flow:

1. Arrange: build test app, prepare isolated DB state, and use FastAPI `app.dependency_overrides` for only heavy dependency such as SAM2.
2. Act: send real HTTP request through app boundary.
3. Assert: check response, then check persisted state through another route or repository read.

Start with FastAPI `TestClient` for simple route tests.
Use `httpx.AsyncClient` plus `ASGITransport` when async flow matters.
If app setup depends on startup or shutdown, use `LifespanManager` too.

## Repo-specific guardrails

Keep these rules in mind for this repo:

- backend-decoded frame index is canonical; do not use browser time as annotation truth
- exact-frame behavior belongs here because backend frame service owns frame retrieval truth
- persistence tests should prove saved state, not only immediate response payload
- SAM2-heavy flows should keep app, route, and DB real while replacing only model-facing adapter or external runtime
- export status belongs in [[Export]]; use this note only to choose correct backend test layer once export contract exists
- do not choose this layer only because a similar backend test already exists; choose it when backend owns the truth

## Common mistakes

- mocking repository, service, and dependency chain until no real backend integration remains
- using production DB or shared mutable state
- asserting only status code and not saved state
- writing one monster test for many workflows
- forgetting startup or shutdown behavior in async tests
- using existing tests as source of truth for which API workflows deserve coverage

## Quick checklist

Before keeping a backend API integration test, ask:

- am I calling the real FastAPI app boundary?
- am I using isolated test DB state?
- did I replace only heavy or external dependency?
- does the test prove one important workflow or failure case?
- did I check both response and persisted state?
- does this belong to backend truth instead of frontend behavior?

## Observations
- [definition] Backend API integration tests in this repo hit the real FastAPI app boundary and keep validation, service wiring, and persistence real. #testing #backend #fastapi #integration
- [boundary] Exact-frame truth and persistence semantics belong in backend integration tests because backend frame retrieval is canonical. #testing #backend #boundary
- [technique] Good backend integration tests use isolated DB state, FastAPI `app.dependency_overrides` for selective replacement, and assertions on both response and saved state. #testing #backend #pytest #persistence
- [technique] `TestClient` is default start point; `httpx.AsyncClient` plus `ASGITransport` fits async flows, and `LifespanManager` matters when startup or shutdown work exists. #testing #backend #httpx #async
- [anti_pattern] Mocking whole backend, using prod DB, status-only assertions, and giant multi-workflow tests make this layer weak. #testing #backend #anti-pattern
- [guardrail] Choose backend api integration tests from backend-owned truth and persistence semantics, not from existing test inventory. #testing #backend #boundary
- [retrieval] Use this note for backend api integration tests, real FastAPI app with test DB, dependency override guidance, persistence checks, propagation range semantics, or async client lifespan queries. #testing #backend #pytest #fastapi #httpx
- [retrieval] Search query `backend api integration tests` should land on this note when reader wants real FastAPI plus test DB guidance. #testing #backend #search

## Relations
- indexed_by [[Tests Index]]
- relates_to [[Testing tools]]
- relates_to [[unit-tests]]
- relates_to [[e2e-tests]]
- relates_to [[frontend-integration-tests]]
- relates_to [[Video Ingest and Exact-Frame Review]]
- relates_to [[Annotation Foundation and Manual Box Workflow]]
- relates_to [[Mask Editing and Cleanup]]
- relates_to [[SAM2 Shell and Runtime]]
- relates_to [[Export]]
