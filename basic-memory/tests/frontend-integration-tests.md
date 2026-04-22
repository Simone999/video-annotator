---
title: frontend-integration-tests
type: test_guide
canonical: true
domain: testing
aliases:
- frontend integration tests
- react integration tests
- msw screen tests
permalink: video-annotator/tests/frontend-integration-tests
tags:
- testing
- frontend
- integration
- vitest
- testing-library
- msw
---

# frontend-integration-tests

Use this note when a real React screen or feature should stay real, but backend responses can be faked at the HTTP boundary.

## Use this layer when

- the question is visible UI behavior
- React state, DOM, and typed clients should stay real
- backend responses can be stubbed with `MSW`
- one small user story is enough

## Do not use this layer when

- the rule is a helper, parser, or reducer
- backend frame truth or persistence is what matters
- the workflow needs a real browser

Use [[backend-api-integration-tests]] for backend-owned truth and [[e2e-tests]] for browser journeys.

## Repo guardrails

- opening a review video fetches both `GET /api/videos/{id}` and `GET /api/videos/{id}/manifest`
- review object selection stays manifest-backed
- exact-frame reload depends on `GET /api/videos/{id}/annotations/frame/{frame_idx}` returning manual rows with `mask: null`
- re-query `Exact frame canvas` after `Load frame`; live review can remount the canvas node
- multi-test frontend integration files should call `afterEach(cleanup)` explicitly
- live review polling tests should prefer real timers

## Verification

- Start from the owning feature note.
- Stub only the request boundary.
- Write one small user story.
- Use semantic selectors and visible assertions.
- Run the exact frontend test command and report the outcome honestly.

## Observations

- [definition] Frontend integration tests in this repo render a real React screen or feature and fake backend responses only at request boundary. #testing #frontend #integration
- [boundary] Backend-decoded frame truth, persistence semantics, and export determinism do not belong in this layer. #testing #frontend #boundary
- [technique] Frontend integration tests that mock review selection must stub both video detail and manifest routes, and saved manual annotation reload must use manual rows with `mask: null`. #testing #frontend #msw #manifest
- [guardrail] Re-query `Exact frame canvas` after `Load frame` because live review can remount the canvas node and stale refs can break later drag or resize events. #testing #frontend #canvas
- [retrieval] Use this note for frontend integration, MSW boundary, or screen-level test queries. #search

## Relations

- indexed_by [[Tests Index]]
- relates_to [[Testing tools]]
- relates_to [[unit-tests]]
- relates_to [[backend-api-integration-tests]]
- relates_to [[e2e-tests]]
