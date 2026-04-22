---
title: Tests Index
type: index
canonical: false
domain: testing
aliases:
- testing guide
- test index
- which test type
permalink: video-annotator/tests/index
tags:
- tests
- index
- navigation
---

# Tests Index

Use this note to pick the smallest test boundary that proves the behavior. Open one leaf guide after the choice is made.

## Pick the right test note

- Small local rule with no DOM, request, or DB: [[unit-tests]]
- Real React screen with fake backend at request boundary: [[frontend-integration-tests]]
- FastAPI contract or persistence truth with real app wiring: [[backend-api-integration-tests]]
- One real browser-visible workflow across the stack: [[e2e-tests]]

Read the owning feature note first. Existing tests are style references only after the boundary is chosen.

## Durable testing notes

- [[unit-tests]]
- [[frontend-integration-tests]]
- [[backend-api-integration-tests]]
- [[e2e-tests]]
- [[Testing tools]]
- [[Test Plan]]

## Observations

- [routing] This note routes readers to one boundary guide and should stay short. #testing
- [guardrail] Choose boundary from feature truth and product code, not from existing test inventory. #testing

## Relations

- indexed_by [[Memory Index]]
