---
title: Audit test guidance and browser E2E harness plan
type: plan
permalink: video-annotator/plans/audit-test-guidance-and-browser-e2e-harness-plan
tags:
- plan
- testing
- e2e
- memory
- audit
---

# Audit test guidance and browser E2E harness plan

Tighten durable test guidance, add the missing browser E2E runner, then verify the guidance by asking isolated agents to choose and write tests without being told the test type.

## Summary

- Goal: make `basic-memory/tests/` easy to search and easy to follow for unit, integration, and E2E work
- Success criteria: notes route cleanly across test layers, repo has real Playwright wiring, and 5 isolated agents mostly choose the right boundary for one shipped feature
- Audience: junior developers and dumb agents writing tests from memory notes

## Current State

- Existing behavior: tests folder already has `Testing tools`, frontend integration, backend integration, and E2E notes
- Main gaps: no `unit-tests` note, mixed canonical names, weak router queries, and no checked-in Playwright test runner
- Constraints: backend `frame_idx` stays canonical, browser time is never annotation truth, and agent audit must run in isolated worktrees

## Assumptions And Open Questions

- Locked assumptions:
  - `[[Video Ingest and Exact-Frame Review]]` is the shared audit feature because it is shipped and does not depend on SAM2 runtime
  - audit worktrees should live under hidden local `.worktrees/`
  - browser E2E should start with one Chromium smoke suite only
- Open questions:
  - none

## Affected Features

- [[Video Ingest and Exact-Frame Review]]

## Task Breakdown

1. [[Auditing test guidance and browser E2E harness]] — updates notes, installs browser E2E runner, runs the 5-agent audit, and writes the final report

## Handoff Notes

- Read `AGENTS.md`, `[[Workflow]]`, `[[Tests Index]]`, `[[Test Plan]]`, and `[[Video Ingest and Exact-Frame Review]]` before changing tests or guidance
- Save the exact shared agent prompt in memory before dispatching agents
- Do not merge any experiment code from audit worktrees back into the main branch
- Save the final audit findings in engineering memory after verification
