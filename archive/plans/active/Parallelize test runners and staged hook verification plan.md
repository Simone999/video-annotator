---
title: Parallelize test runners and staged hook verification plan
type: plan
status: active
permalink: video-annotator/plans/parallelize-test-runners-and-staged-hook-verification-plan
tags:
- plan
- testing
- frontend
- backend
- workflow
---

# Parallelize test runners and staged hook verification plan

Make default test commands faster, keep low-memory fallback path for frontend coverage, and wire git hooks so unit tests run before commit while integration tests run before push.

## Summary
- Goal: parallelize frontend and backend test runners where safe, then stage repo verification by boundary
- Success criteria: root and workspace test commands run faster by default, frontend keeps explicit shard fallback, backend uses pytest worker fanout, pre-commit runs unit tests, pre-push runs integration tests, and E2E stays opt-in or CI-only
- Audience: current stage-2 execution session

## Current State
- Existing behavior: root `npm run test` serializes backend then frontend, frontend coverage wrapper spawns one Vitest process per file with `VITEST_MAX_WORKERS=1`, backend pytest has no xdist, and `.pre-commit-config.yaml` runs format/lint/typecheck only
- Main gaps: default commands leave easy parallelism unused, hook stages do not match test boundaries, and durable testing notes still treat serial shard coverage as normal path
- Constraints: dirty root worktree must stay untouched, frontend coverage still needs explicit low-memory escape hatch, Playwright keeps shared fixed ports and shared seeded SQLite state, and no CI workflow files exist in repo yet

## Assumptions And Open Questions
- Locked assumptions:
  - conservative plus local-first wins: default commands get faster, but frontend keeps explicit fallback shard mode
  - root frontend and backend suites stay sequential at top level; each half parallelizes internally instead of competing for same CPU or RAM pool
  - E2E gating stays repo-command and docs only for now; future GitHub Actions will own path filters outside this repo
- Open questions:
  - none after reading current scripts, test notes, pre-commit config, and live runner timings

## Affected Features
- [[Testing tools]]
- [[frontend-integration-tests]]
- [[backend-api-integration-tests]]
- [[unit-tests]]
- [[e2e-tests]]

## Task Breakdown
1. [[Parallelize test runners and staged hook verification]] — implement command, hook, doc, and memory changes in one coordinated stage-2 slice

## Handoff Notes
- Read `[[Workflow]]`, `[[Testing tools]]`, `[[frontend-integration-tests]]`, `[[backend-api-integration-tests]]`, `[[unit-tests]]`, and `[[e2e-tests]]` first.
- Tests first for each command contract change: repo tooling tests must go red before script or config edits.
- Keep changes surgical: no product behavior changes, no CI workflow files, and no attempt to parallelize Playwright against shared `.env.e2e` state.
