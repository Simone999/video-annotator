---
title: Tests Index
type: note
permalink: video-annotator/tests/index
tags:
- tests
- index
- navigation
---

# Tests Index

This folder holds durable testing guidance that stays useful after one feature slice or one task ends. Feature notes keep only template-required verification sections. Concrete test planning, evidence, and execution truth live in task notes and reusable testing notes here.

## Pick the right test note

1. Is this one small local rule with no DOM, request, or DB? Read [[unit-tests]].
2. Is this React screen behavior with fake backend responses? Read [[frontend-integration-tests]].
3. Is this FastAPI contract or persistence behavior with real app wiring? Read [[backend-api-integration-tests]].
4. Is this one real browser-visible workflow across the stack? Read [[e2e-tests]].

Open [[Test Plan]] when you need the cross-layer testing strategy before choosing one leaf note.
Choose the layer from feature notes and product code first.
Do not use existing tests as source of truth for which layer to pick or what behavior matters; existing tests are style references only after the boundary is already chosen.

## How to use this folder

1. Read the owning feature note.
2. Inspect product code for the current workflow shape.
3. Choose the smallest boundary that proves the behavior.
4. Read one leaf note, not all four in depth.
5. Write one focused test.
6. Run one exact verification command and report the result honestly.

## Same feature, four layers

| Scenario | Default note |
| --- | --- |
| one reducer, parser, transform, or state rule | [[unit-tests]] |
| review UI open video, load frame, jump, next, previous | [[frontend-integration-tests]] |
| exact-frame contract, invalid frame bounds, persistence truth | [[backend-api-integration-tests]] |
| one browser-visible smoke path across stack | [[e2e-tests]] |

## Notes

- [[unit-tests]]
- [[Testing tools]]
- [[e2e-tests]]
- [[frontend-integration-tests]]
- [[backend-api-integration-tests]]
- [[Test Plan]]

## Observations

- [navigation] This note is the entrypoint for durable testing guidance in memory.
- [scope] Feature notes keep template-required verification sections, while this folder keeps reusable testing guidance and routing across features.
- [routing] Use this note when `Memory Index` or other indexes route you toward testing guidance instead of one feature note.
- [routing] This note is the main router for unit, frontend integration, backend integration, and browser E2E guidance. #testing #navigation
- [retrieval] Use this note for tests folder navigation, which test type should I write, or reusable testing-guidance queries. #testing #navigation
- [guardrail] Pick test type from feature notes and product code, not from whatever tests already exist. #testing #routing #boundary
- [technique] Read feature note first, then choose one leaf note, then run one exact verification command instead of stopping at planning. #testing #workflow

## Relations

- indexed_by [[Memory Index]]
- indexes [[unit-tests]]
- indexes [[Testing tools]]
- indexes [[e2e-tests]]
- indexes [[frontend-integration-tests]]
- indexes [[backend-api-integration-tests]]
- relates_to [[Test Plan]]
- relates_to [[Features Index]]
- relates_to [[Tasks Index]]
