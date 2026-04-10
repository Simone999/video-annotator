---
id: TASK-1
title: Add baseline formatting linting and typechecking for backend and frontend
status: Done
assignee:
  - codex
created_date: '2026-04-10 13:10'
updated_date: '2026-04-10 13:23'
labels:
  - tooling
  - milestone-0
dependencies: []
documentation:
  - docs/spec.md
  - docs/engineering/runbook.md
  - AGENTS.md
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Establish the first verified developer-quality gate for the scaffolded repo by adding backend and frontend formatting, linting, typechecking, root make targets, and pre-commit integration. Keep the setup aligned with the Milestone 0 stack and document the autofix-first workflow for agents and contributors.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Backend tooling uses Ruff for formatting and linting plus Pyright in strict mode with Google-style docstring convention.
- [x] #2 Frontend tooling uses Prettier for formatting, ESLint for linting, and TypeScript compiler checks through documented scripts.
- [x] #3 The repository exposes root make targets for format, format-check, lint, lint-fix, typecheck, check, and precommit-install.
- [x] #4 A root pre-commit configuration runs the repo formatting, linting, and typechecking gates without duplicating tool configuration.
- [x] #5 AGENTS and the engineering runbook document the autofix-first workflow and the verified developer commands that now exist.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Add a thin root Makefile that exposes the approved command surface: format, format-check, lint, lint-fix, typecheck, check, and precommit-install.
2. Add backend Python project metadata in backend/pyproject.toml with Ruff configured for formatting/linting, pydocstyle Google convention, and Pyright strict mode scoped to backend sources.
3. Add frontend package/config files in frontend/ for Prettier, ESLint, and TypeScript typechecking with scripts that the Makefile delegates to.
4. Add a root .pre-commit-config.yaml that uses the repo command surface instead of duplicating tool options.
5. Update AGENTS.md and docs/engineering/runbook.md to document the autofix-first workflow and the newly verified commands.
6. Update backlog Definition of Done defaults to require formatter/linter checks, typechecking, and narrow relevant verification.
7. Install dependencies as needed, run the new make targets plus pre-commit, and capture the actual verification results before completion.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implemented a thin root Makefile for backend and frontend install format lint typecheck and pre-commit commands.

Added backend uv project metadata with Ruff formatting and lint rules Pyright strict mode and a minimal app package placeholder.

Added frontend package scripts with Prettier ESLint TypeScript config and a minimal typed placeholder source file.

Updated AGENTS and the engineering runbook to document the verified developer commands and the autofix-first workflow.

Updated project Definition of Done defaults to include formatter and linter checks typechecking and scoped tests or the narrowest relevant verification.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Added the first verified developer-tooling baseline for the scaffolded repository. The repo now has a root Makefile command surface, backend Ruff and Pyright strict configuration, frontend Prettier ESLint and TypeScript scripts, root pre-commit integration, updated AGENTS and runbook guidance for autofix-first workflows, and updated Backlog Definition of Done defaults for formatting linting typechecking and scoped verification.
<!-- SECTION:FINAL_SUMMARY:END -->
