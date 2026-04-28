---
title: Review m-7 hardening checkpoint
type: note
permalink: video-annotator/tasks/review-m-7-hardening-checkpoint
id: task-review-m-7-hardening-checkpoint
status: done
completed: 2026-04-28 17:20:00 CEST
steps:
- creation
- planning
- execution
- wrap_up
tags:
- task
- review
- tests
- docker
- m-7
- docs
---

# Review m-7 hardening checkpoint

## Creation Phase

### Description

Review the first shipped m-7 hardening slice before release verification starts. Fix actionable drift in same task.

Read first:
- [[Workflow]]
- [[Spec and PRD roadmap parity audit 2026-04-22]]
- [[Stabilize frontend Vitest media environment and clean per-test teardown]]
- `basic-memory/tests/e2e-tests.md`
- all linked m-7 task notes through Docker commands

Stage-2 rule: in planning phase, write concrete test plan and implementation plan first. In execution, follow written plan. Before `done`, run own review plus 2 subagent reviews and fix actionable findings.

### Scope

- In scope: code review, docs or memory drift, stale links, and Docker workflow mismatches after shipped compose stack, stale-task cleanup, Playwright Docker mode, and Docker commands or docs
- In scope: confirm shared frontend test environment stays clean before release verification starts
- Out of scope: new scope beyond checkpoint fixes

### Affected Features

- [[Video Ingest and Exact-Frame Review]]

### Acceptance Criteria

- [x] Run own review plus 2 subagent reviews and fix actionable findings before release verification task starts
- [x] Task, feature, and milestone routing matches current Docker E2E truth after fixes
- [x] Hardening docs and command surface stay free of stale references after review

### Test Intent

- Backend: rerun targeted Docker/backend checks touched by review fixes
- Frontend: rerun targeted frontend/Playwright checks touched by review fixes
- Manual: run one Docker E2E smoke after review fixes if workflow changed

### Definition of Done

- [x] Planning phase records concrete tests and implementation plan before code
- [x] Own review plus 2 subagent reviews are recorded and actionable findings are fixed
- [x] Relevant tests and quality checks pass
- [x] Feature notes, task note, and routing indexes are updated honestly when truth changes

## Planning Phase

### Planned Integration Tests

- rerun `backend/tests/unit/tooling/test_docker_e2e_compose.py` and `backend/tests/unit/tooling/test_repo_test_commands.py` only if checkpoint fixes touch docker command surface, compose text, or routing contracts around those files
- rerun `frontend/tests/unit/tooling/docker-e2e-wrapper.test.ts` only if checkpoint fixes touch `scripts/docker-e2e.mjs`

### Planned E2E Tests

- rerun `docker compose -f docker-compose.e2e.yml config` if compose or docs truth changes around runner command surface
- rerun `node scripts/docker-e2e.mjs test frontend/tests/e2e/routes.spec.ts frontend/tests/e2e/review-navigation.spec.ts` only if workflow text or wrapper behavior changes; record Docker daemon blocker honestly if it still fails before container start

### Planned Implementation

- Step 1: move task to active state and gather checkpoint scope from `m-7`, done task notes, todo routing, and durable E2E testing memory
- Step 2: run own review for stale links, stale commands, milestone or task drift, and shared test-environment mismatches across the first hardening slice
- Step 3: run one spec-review subagent and one quality-review subagent on the same checkpoint scope
- Step 4: fix only actionable checkpoint drift found by review
- Step 5: rerun targeted proofs for touched areas, then close task honestly before release verification starts

### Feature Matrix Updates

- none expected unless checkpoint review changes current milestone or task-routing truth

## Execution Phase

### Implementation Notes

- Own checkpoint review found live routing drift, not feature drift.
  - `m-7` still lived under planned milestones even though roadmap work is active.
  - `m-7` checklist still read Docker mode and documented command surface as unfinished even after those tasks shipped.
  - todo routing still said remaining hardening started at Docker mode and Docker commands instead of checkpoint review and release verification.
- Subagent review found one wording ambiguity in checkpoint scope and one live contract mismatch in raw compose runner behavior.
  - checkpoint language said `first five m-7 tasks` or `after task five`, which became stale once shipped slices moved and review scope was framed around shipped hardening instead of task count
  - compose `playwright` default command still included `review-navigation.spec.ts` even though only the npm wrapper injects `E2E_REVIEW_NAVIGATION_SCENARIO_JSON`
- Fixed routing truth by:
  - moving `m-7` into `archive/milestones/in_progress/` and updating milestone indexes
  - updating `m-7` goal, open-work text, and checklist to current truth
  - updating todo routing so remaining `m-7` work starts at checkpoint review, release verification, and final review
  - rewriting checkpoint task wording to refer to the first shipped hardening slice instead of a brittle task count
- Fixed compose truth by making raw compose runner default to the seed-free `frontend/tests/e2e/routes.spec.ts` smoke only. The wrapper still passes both committed smoke specs explicitly after it seeds review-navigation state.

## Wrap-Up Phase

### Verification

- Commands run:
- `uv run --project backend pytest backend/tests/unit/tooling/test_docker_e2e_compose.py -q`
- `docker compose -f docker-compose.e2e.yml config`
- `rg -n "first five m-7 tasks|after task five|Playwright Docker mode, Docker command surface, release verification, and final review|planned/m-7 - Docker E2E and Release Hardening|honest Docker-daemon blocker notes" archive`
- Results:
- red first: updated compose contract failed because raw compose runner still defaulted to the seeded `review-navigation.spec.ts` path
- green after fix: compose contract test passed
- compose config still rendered cleanly after runner-command change
- readback search found no stale `m-7` checkpoint-count wording or stale planned-path references in live archive routing
- own review plus 3 subagent reviews ran for this checkpoint
  - one spec reviewer found stale count-based checkpoint wording
  - one quality reviewer found milestone-path packet drift, blocker-wording drift, and raw compose-runner mismatch
  - one narrow routing reviewer found no extra live drift after fixes

### Final Summary

Checkpoint review found routing truth drift and one compose runner mismatch, not new product scope. `m-7` now sits in the active milestone lane, its checklist matches shipped Docker hardening truth, todo routing now points at release verification next, and raw compose runner defaults to the seed-free route smoke while the wrapper owns seeded review-navigation coverage.

### Completion Gate

- [x] Acceptance Criteria checkboxes updated to match reality
- [x] Definition of Done checkboxes updated to match reality
- [x] Only now may `status` change to `done`
