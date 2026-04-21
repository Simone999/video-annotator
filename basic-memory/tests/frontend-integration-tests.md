---
title: frontend-integration-tests
type: note
permalink: video-annotator/tests/frontend-integration-tests
tags:
- testing
- frontend
- integration
- frontend-integration-tests
- frontend integration tests
- vitest
- testing-library
- msw
---

# frontend-integration-tests

Use this note when test must prove a real React screen or feature works, but backend stays fake at HTTP boundary.
This is the frontend integration tests guide for video-annotator.
Tool catalog lives in [[Testing tools]].
Browser-wide workflow guidance lives in [[e2e-tests]].

Frontend integration tests sit between tiny unit tests and browser E2E:

- render real screen or feature
- keep React state, DOM, and typed clients real
- fake backend responses at request layer
- assert user-visible results, not React internals

Choose this layer from product behavior and feature notes first.
Do not start by reading current tests to decide boundary; existing tests are only style references after the layer is already chosen.

## Default choice in this repo

Start here for shipped review-screen behavior such as:

- open indexed video
- load exact frame
- jump to another frame
- step next or previous
- show canonical frame state in UI

Choose [[backend-api-integration-tests]] instead when backend owns the truth you need to freeze.

## First 5 steps

1. Read the owning feature note and current task note.
2. Inspect the screen and workflow code that drives the UI state.
3. List every request the screen must stub, including detail, manifest, and frame-annotation routes when relevant.
4. Write one small user story in one test.
5. Run `npm --workspace frontend run test -- <path>`.

## Minimum done bar

- write the test
- run one exact frontend verification command
- report pass or fail honestly
- do not stop at planning

## What this layer is for

Use this layer for review-screen behavior such as:

- loading an exact frame and showing the requested frame state
- stepping frame-by-frame through current review state
- showing saved annotations and manual boxes on the current frame
- enabling or blocking actions when object selection or box state changes
- showing mask-generation success or failure in UI
- showing propagation progress, completion, or error feedback
- showing delete or correction results in overlays and controls
- showing export success or error feedback when export UI exists

Feature truth stays in:

- [[Video Ingest and Exact-Frame Review]]
- [[Annotation Foundation and Manual Box Workflow]]
- [[Mask Editing and Cleanup]]
- [[SAM2 Shell and Runtime]]
- [[Export]]

## What this layer is not for

Do not use this layer for:

- tiny helpers or geometry functions
- pure presentational components with no meaningful behavior
- whether backend decoded the correct frame image
- whether SAM2 model output is good
- whether exported files are deterministic on disk

Backend-decoded frame truth and persistence rules belong in [[backend-api-integration-tests]].
Full browser workflow belongs in [[e2e-tests]].

## How to shape one test

Keep one small user story per test:

- load exact frame
- step to next frame
- draw box and unlock action
- generate mask and show result
- delete bad saved annotation

Use simple flow:

1. Arrange: render the real screen, then stub request boundary with `MSW`.
2. Act: use Testing Library and `userEvent` to drive the story.
3. Assert: check visible labels, buttons, status, overlays, and disabled or enabled state.

Prefer semantic selectors such as role, label, and visible name.
Use `findBy...` or `waitFor` when UI changes after request completes.
Do not assert hook calls, local state, or component-private props.

## Repo-specific guardrails

Keep these rules in mind for this repo:

- opening a review video fetches both `GET /api/videos/{id}` and `GET /api/videos/{id}/manifest`; frontend tests that mock selection must stub both routes
- review object selection stays manifest-backed; do not reintroduce free-text object id input in tests or examples
- exact-frame reload depends on `GET /api/videos/{id}/annotations/frame/{frame_idx}` returning manual rows with `mask: null`
- exact-frame reload must hydrate saved manual annotations from fetched manual rows, not only from current in-memory frame state
- multi-test frontend integration files should add explicit `afterEach(cleanup)`; do not rely on implicit DOM cleanup between repeated `render` calls in this repo
- use current workflow names and fixture names from feature notes or product code; do not copy stale names like `sample-b.mp4` from older tests

These rules support feature truth in [[Video Ingest and Exact-Frame Review]] and [[Annotation Foundation and Manual Box Workflow]].

## Common mistakes

- mocking hooks, components, or helpers so heavily that no real integration remains
- using brittle selectors tied to DOM shape
- asserting implementation details instead of visible outcome
- putting too many stories into one large test
- forgetting to reset `MSW` handlers, spies, and other shared state between tests
- using existing tests as source of truth for what feature behavior matters or which layer to choose

## Quick checklist

Before keeping a frontend integration test, ask:

- does this render a real screen or feature?
- did I fake only the request boundary?
- does the test tell one clear user story?
- do selectors match what user can see or operate?
- do assertions check visible outcome?
- does this belong to frontend behavior instead of backend truth?

## Observations
- [definition] Frontend integration tests in this repo render a real React screen or feature and fake backend responses only at request boundary. #testing #frontend #integration
- [boundary] Backend-decoded frame truth, persistence semantics, and export determinism do not belong in this layer. #testing #frontend #boundary
- [technique] Frontend integration tests that mock review selection must stub both video detail and manifest routes, and saved manual annotation reload must use manual rows with `mask: null`. #testing #frontend #msw #manifest
- [guardrail] Multi-test frontend integration files should call `afterEach(cleanup)` explicitly because repeated renders can leak DOM between Vitest cases in this repo. #testing #frontend #vitest
- [pattern] Good frontend integration tests follow one small user story, use semantic selectors, and wait for visible async UI signals. #testing #frontend #testing-library
- [anti_pattern] Mocking too much, brittle selectors, implementation-detail assertions, giant tests, and leaked handlers make this layer noisy and weak. #testing #frontend #anti-pattern
- [guardrail] Choose frontend integration tests from real screen behavior with fake backend boundary, not from whatever tests already exist in the repo. #testing #frontend #boundary
- [retrieval] Use this note for frontend integration tests, real screen with fake backend, MSW boundary, Testing Library user stories, or manifest-backed review UI queries. #testing #frontend #vitest #msw #testing-library
- [retrieval] Search query `frontend integration tests` should land on this note when reader wants a real screen with fake backend responses. #testing #frontend #search

## Relations
- indexed_by [[Tests Index]]
- relates_to [[Testing tools]]
- relates_to [[unit-tests]]
- relates_to [[e2e-tests]]
- relates_to [[backend-api-integration-tests]]
- relates_to [[Video Ingest and Exact-Frame Review]]
- relates_to [[Annotation Foundation and Manual Box Workflow]]
- relates_to [[Mask Editing and Cleanup]]
- relates_to [[SAM2 Shell and Runtime]]
- relates_to [[Export]]
