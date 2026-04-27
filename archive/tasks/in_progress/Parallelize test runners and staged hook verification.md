---
title: Parallelize test runners and staged hook verification
type: note
permalink: video-annotator/tasks/parallelize-test-runners-and-staged-hook-verification
id: task-parallelize-test-runners-and-staged-hook-verification
status: in_progress
completed:
steps:
- creation
- planning
- execution
- wrap_up
tags:
- task
- testing
- frontend
- backend
- workflow
---

# Parallelize test runners and staged hook verification

## Creation Phase

### Description

Make default test commands faster, keep safe fallback path for frontend coverage, and align git hooks with unit versus integration boundaries.

Read first:
- [[Workflow]]
- [[Testing tools]]
- [[frontend-integration-tests]]
- [[backend-api-integration-tests]]
- [[unit-tests]]
- [[e2e-tests]]
- `package.json`
- `frontend/package.json`
- `frontend/vite.config.ts`
- `frontend/scripts/run-vitest-coverage.mjs`
- `backend/pyproject.toml`
- `.pre-commit-config.yaml`

Stage-2 rule: write concrete tests and implementation plan first. During execution, record command truth honestly. Before `done`, run own review plus subagent review loops and fix actionable findings.

### Scope

- In scope: frontend Vitest command or config changes, backend pytest xdist changes, root script boundary split, staged git hooks, and docs or memory truth updates for new test workflow
- Out of scope: product code, CI workflow files, Playwright shared-state redesign, and unrelated existing test failures

### Affected Features

- [[Testing tools]]
- [[frontend-integration-tests]]
- [[backend-api-integration-tests]]
- [[unit-tests]]
- [[e2e-tests]]

### Acceptance Criteria

- [x] Root and workspace test commands expose explicit unit, integration, and full-suite paths
- [x] Frontend default test path stops spawning one Vitest process per file and uses parallel workers by default
- [x] Backend default pytest path uses xdist worker fanout with stable distribution mode
- [x] Pre-commit runs unit tests and pre-push runs integration tests
- [x] Docs and durable testing notes explain what still stays serial and why

### Test Intent

- Backend: contract tests for root scripts or hook wiring, plus command verification for new backend unit/integration/full paths
- Frontend: contract tests for frontend test script/config and command verification for new frontend unit/integration/full paths
- Manual: none expected beyond command timing and failure-set comparison

### Definition of Done

- [x] Planning phase records concrete tests and implementation plan before code
- [x] Own review plus subagent review loops are recorded and actionable findings are fixed
- [x] Relevant tests and quality checks pass or pre-existing failures are recorded honestly
- [x] Archive note, docs, and durable memory updates match shipped workflow truth

## Planning Phase

### Planned Integration Tests

- Backend tooling contract updates in `backend/tests/unit/tooling/test_repo_test_commands.py` for:
  - root script split
  - backend coverage command shape
  - frontend test script routing
- Frontend tooling contract update in `frontend/tests/unit/tooling/vitest-coverage-config.test.ts` for:
  - explicit worker config and coverage config shape
- New or updated hook contract coverage for `.pre-commit-config.yaml` stage routing if no existing test covers it

### Planned E2E Tests

- None. E2E stays opt-in or future CI-owned because repo harness uses shared fixed ports, shared seed flow, and shared `/tmp` SQLite plus mask paths.

### Planned Implementation

- Step 1: change frontend tooling contract tests first, then replace serial per-file coverage runner with one-shot parallel default plus explicit shard fallback mode
- Step 2: change backend tooling contract tests first, then add pytest-xdist and new unit/integration/full backend command split
- Step 3: wire root scripts and staged pre-commit/pre-push hooks, then update docs and durable testing notes

### Feature Matrix Updates

- `[[Testing tools]]` should document new default commands plus shard fallback
- `[[e2e-tests]]` should document that E2E stays out of git hooks and future CI owns path-based triggering

## Execution Phase

### Implementation Notes

- Baseline isolated worktree created at `.worktrees/tasks-parallelize-tests` on branch `task-parallelize-tests` because root worktree is dirty.
- Initial baseline in worktree:
  - `npm run test` failed before any runner edits because backend SAM2 tests needed `numpy` and `Pillow`
  - installed backend extra with `uv sync --project backend --group dev --extra sam2` so later runner verification measures workflow changes instead of dependency drift
- Implemented repo command split:
  - root `test:backend:unit`, `test:backend:integration`, `test:frontend:unit`, `test:frontend:integration`, `test:unit`, `test:integration`
  - frontend `test:unit`, `test:integration`, `test:sharded`
- Backend default pytest config now uses `-q -n auto --dist loadscope`; root backend scripts rely on that default and keep top-level backend plus frontend suites sequential.
- Git hooks now stage by boundary:
  - `pre-commit`: format-check, lint-fix, lint, typecheck, `repo-unit-tests`
  - `pre-push`: `repo-integration-tests`
- Frontend full-test scripts now run an explicit coverage-summary gate after Vitest so `Unknown% (0/0)` coverage fails loudly instead of passing falsely.
- Investigation result for remaining blocker:
  - raw frontend `vitest run --coverage` returns `Unknown% (0/0)` even for single-file runs
  - same `0/0` happens with one-shot default runner and explicit sharded fallback
  - same `0/0` happens with V8 and an installed Istanbul provider
  - temporary config tests ruled out `coverage.include` and the new worker settings as sole causes
  - current blocker is broader frontend Vitest coverage instrumentation, not just the new runner wrapper

## Wrap-Up Phase

### Verification

- Commands run:
- `node node_modules/vitest/vitest.mjs run frontend/tests/unit/tooling/vitest-coverage-config.test.ts frontend/tests/unit/tooling/frontend-test-runner-contract.test.ts frontend/tests/unit/tooling/frontend-coverage-gate-contract.test.ts`
- `uv run --project backend pytest backend/tests/unit/tooling/test_repo_test_commands.py backend/tests/unit/tooling/test_repo_hook_commands.py`
- `npm run test:backend:unit -- --collect-only backend/tests/unit/tooling/test_repo_test_commands.py`
- `npm run test:backend:integration -- --collect-only backend/tests/integration/api/test_database_prepare.py`
- `npm run test:unit`
- `npm run test:integration`
- `uv run --project backend pre-commit run --all-files --hook-stage pre-commit --config .pre-commit-config.yaml`
- `uv run --project backend pre-commit run repo-unit-tests --hook-stage pre-commit --all-files --config .pre-commit-config.yaml`
- `uv run --project backend pre-commit run --all-files --hook-stage pre-push --config .pre-commit-config.yaml`
- `npm run test`
- `node node_modules/vitest/vitest.mjs run frontend/tests/unit/video-review/use-live-review-controller-objects.test.ts`
- focused frontend coverage-debug commands:
  - raw one-file and full-suite `vitest run --coverage`
  - sharded fallback `npm --workspace frontend run test:sharded`
  - temporary-config runs without `coverage.include`
  - temporary-provider run with installed `@vitest/coverage-istanbul`
- Results:
- Frontend tooling contract tests passed after subagent review fixes, lint-safe mock cleanup, and explicit frontend coverage gate additions.
- Backend tooling contract tests passed and command probes collected expected unit and integration suites with xdist active.
- `npm run test:unit` passed after mirroring root `.env` into the isolated worktree for verification because one frontend tooling test reads a real `.env` file.
- `npm run test:integration` passed.
- Focused `use-live-review-controller-objects` rerun passed after updating one stale expectation to match the existing `createObject(label, color)` call shape.
- Full `pre-commit` stage now passes on `ralph/ui`.
- Direct `repo-unit-tests` hook passed.
- Full `pre-push` stage now fails on `ralph/ui`, but not because of test-runner or hook-routing changes:
  - backend integration suite reports 11 failures where existing API responses no longer include expected `id` or `job_id` fields
  - no backend application code changed in this task; failures appeared only after merging the task work onto the already-advanced `ralph/ui` branch
- `npm run test` now fails honestly on frontend coverage instead of false-green passing:
  - backend coverage gate passed at statements `97.19%` and branches `90.36%`
  - frontend tests passed, but Vitest coverage summary stayed `Unknown% (0/0)`
  - explicit frontend coverage gate now fails with `Frontend coverage summary is missing numeric line/branch totals`

### Final Summary

Implemented the parallel command split, backend xdist default, staged git hooks, and durable note updates. The remaining blocker is not runner parallelism anymore; it is frontend Vitest coverage instrumentation returning `0/0`, which the repo now reports explicitly instead of hiding.

### Completion Gate

- [x] Acceptance Criteria checkboxes updated to match reality
- [ ] Definition of Done checkboxes updated to match reality
- [ ] Only now may `status` change to `done`
