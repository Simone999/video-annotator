---
title: unit-tests
type: test_guide
canonical: true
domain: testing
aliases:
- unit tests
- reducer tests
- parser tests
permalink: video-annotator/tests/unit-tests
tags:
- testing
- unit
- pytest
- vitest
- reducer
- model
---

# unit-tests

Use this note when the behavior is one small local rule with no browser, no network, and no database.

## Use this layer when

- the rule lives in one function, reducer, parser, serializer, or model helper
- the code can be called directly
- setup is smaller than the rule you are testing

## Do not use this layer when

- the test needs DOM
- the test needs FastAPI or DB wiring
- the test needs a real browser workflow

Move up to [[frontend-integration-tests]], [[backend-api-integration-tests]], or [[e2e-tests]] when any of those boundaries matter.

## Verification

- Start from the owning feature note.
- Write one focused test around one local rule.
- Keep inputs small and assertions direct.
- Run the exact frontend or backend unit-test command for the file you changed.

## Repo guardrails

- backend `frame_idx` is canonical
- browser playback time is never annotation truth
- frontend reducer tests should protect canonical frame state separately from playback state
- unit tests should not hide integration risk behind heavy mocking of app boundaries

## Observations

- [definition] Unit tests in this repo protect small local rules without DOM, request, or database boundaries. #testing #unit
- [boundary] If a test needs screen rendering, FastAPI routes, or persistence round-trips, it is not a unit test anymore. #testing #unit #boundary
- [guardrail] Canonical backend `frame_idx` and playback-separation rules are good unit-test targets because they can drift quietly. #testing #unit #frame-index
- [pattern] Good unit tests keep setup tiny and assertions direct around one local rule. #testing #unit #pattern
- [retrieval] Use this note for unit, reducer, parser, or local-rule test-boundary queries. #search

## Relations

- indexed_by [[Tests Index]]
- relates_to [[Testing tools]]
- relates_to [[frontend-integration-tests]]
- relates_to [[backend-api-integration-tests]]
- relates_to [[e2e-tests]]
