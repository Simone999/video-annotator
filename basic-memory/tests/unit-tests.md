---
title: unit-tests
type: note
permalink: video-annotator/tests/unit-tests
tags:
- testing
- unit
- unit-tests
- unit tests
- pytest
- vitest
- reducer
- model
---

# unit-tests

Use this note when test must prove one small local rule with no browser, no network, and no database.
This is the unit tests guide for video-annotator.
Cross-layer strategy lives in [[Test Plan]].
Tool catalog lives in [[Testing tools]].

Unit tests are the smallest automated boundary in this repo:

- one pure function, reducer, parser, serializer, or model rule
- no FastAPI app boundary
- no request mocking
- no DOM or browser

Choose this layer from product behavior and feature notes first.
Do not decide from existing tests that happen to already be in the repo.

## Default choice in this repo

Start here when behavior is one small local rule such as:

- reducer state transition
- parser or normalization rule
- frame-index helper
- typed boundary conversion
- job-state transition with no app wiring

## First 5 steps

1. Read the owning feature note or task note.
2. Inspect the local function, reducer, or model code.
3. Confirm the rule does not need DOM, request, or DB.
4. Write one focused test around one local rule.
5. Run `npm --workspace frontend run test -- <path>` or `uv run --project backend pytest <path>`.

## Minimum done bar

- write the test
- run one exact verification command
- report pass or fail honestly
- do not stop at planning

## What this layer is for

Use unit tests for local rules such as:

- frame index conversion or validation helpers
- box normalization or coordinate transforms
- reducer state transitions
- model field constraints and persistence-shape rules that do not need route wiring
- job-state transitions
- response parsing at typed boundaries

## What this layer is not for

Do not use unit tests for:

- React screen behavior
- FastAPI route contracts
- database round-trips through real persistence
- exact-frame fetch through live backend services
- full browser reviewer workflows

If test needs DOM, move to [[frontend-integration-tests]].
If test needs FastAPI or DB wiring, move to [[backend-api-integration-tests]].
If test needs a real browser workflow, move to [[e2e-tests]].

## How to shape one test

Keep one rule per test or one tiny cluster of related rules:

- one reducer action changes exactly the expected state
- one parser accepts one valid shape or rejects one invalid shape
- one helper normalizes one input into one canonical output

Use direct inputs and direct assertions.
Avoid fixtures larger than the rule under test.
If test setup is bigger than the rule, boundary is probably too low.

## Repo-specific guardrails

Keep these rules in mind for this repo:

- backend `frame_idx` is canonical, so any unit logic around frames must preserve that truth
- browser playback time is never annotation truth
- frontend reducer tests should protect canonical frame state separately from playback state
- unit tests should not hide integration risk behind heavy mocking of app boundaries

## Common mistakes

- calling something a unit test when it really needs DOM, network, or DB
- asserting too many rules in one large test
- copying payloads much larger than needed
- mocking through several layers instead of just calling the local code directly
- freezing implementation details instead of meaningful local behavior

## Quick checklist

Before keeping a unit test, ask:

- is this a small local rule?
- can I call the code directly?
- does it avoid browser, network, and DB?
- does it protect canonical frame truth or state logic cleanly?
- would this still be useful if UI and API wiring changed?

## Observations

- [definition] Unit tests in this repo protect small local rules without DOM, request, or database boundaries. #testing #unit
- [boundary] If a test needs screen rendering, FastAPI routes, or persistence round-trips, it is not a unit test anymore. #testing #unit #boundary
- [guardrail] Canonical backend `frame_idx` and playback-separation rules are good unit-test targets because they can drift quietly. #testing #unit #frame-index
- [pattern] Good unit tests keep setup tiny and assertions direct around one local rule. #testing #unit #pattern
- [guardrail] Choose unit tests from local-rule shape, not from existing test inventory. #testing #unit #boundary
- [retrieval] Use this note for unit tests, reducer tests, model-rule tests, parser tests, or small local testing-boundary queries. #testing #unit #pytest #vitest
- [retrieval] Search query `unit tests` should land on this note when reader wants the smallest local test boundary. #testing #unit #search

## Relations

- indexed_by [[Tests Index]]
- relates_to [[Test Plan]]
- relates_to [[Testing tools]]
- relates_to [[frontend-integration-tests]]
- relates_to [[backend-api-integration-tests]]
- relates_to [[e2e-tests]]
