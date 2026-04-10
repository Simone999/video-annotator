---
id: TASK-3
title: Milestone 0 - Skeleton
status: In Progress
assignee: []
created_date: '2026-04-10 13:56'
updated_date: '2026-04-10 14:01'
labels:
  - milestone-0
  - skeleton
milestone: m-0
dependencies: []
references:
  - examples/bedroom.mp4
  - AGENTS.md
documentation:
  - docs/spec.md
  - docs/product/requirements.md
  - docs/engineering/runbook.md
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Deliver the Milestone 0 skeleton from docs/spec.md: establish the repository and documentation baseline, scaffold the empty frontend and backend foundations, add SQLite bootstrap plus video indexing metadata, and leave the project ready for Exact frame review without drifting into later-milestone behavior.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 The repository and baseline documentation required for Milestone 0 exist and align with docs/spec.md.
- [ ] #2 The frontend has an empty two-pane shell and the backend has a local health route on the planned architecture.
- [ ] #3 SQLite bootstrap and the initial videos metadata schema exist in local-only storage.
- [ ] #4 The backend can index the committed sample video, persist metadata, and return it through the documented Milestone 0 API.
- [ ] #5 Milestone 0 smoke validation is recorded with any remaining risks or follow-up work captured in Backlog.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Phase 1: completed foundation tasks TASK-3.1 through TASK-3.6 establish repo layout and baseline docs.
Phase 2: contract and stub-doc tasks TASK-3.7 through TASK-3.12 define the Milestone 0 API, data model, frontend interaction, SAM2, export, and test-plan documents.
Phase 3: frontend implementation tasks TASK-3.13 and TASK-3.14 scaffold the React/Vite app and build the empty two-pane shell.
Phase 4: backend foundation tasks TASK-3.15 through TASK-3.18 scaffold FastAPI, add the health route, bootstrap SQLite, and implement metadata extraction.
Phase 5: TASK-3.19 connects the indexing API to persistence, then TASK-3.20 runs smoke validation and records evidence in Backlog.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Split the old coarse Milestone 0 breakdown into smaller Backlog subtasks wherever the work crossed boundaries, touched many files, or bundled docs plus implementation together.

Kept already completed foundation and baseline documentation work as separate done subtasks so the remaining milestone work is visible without relying on docs/delivery/tasks.
<!-- SECTION:NOTES:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Run `make format-check`
- [ ] #2 Run `make lint`
- [ ] #3 Run `make typecheck`
- [ ] #4 Run scoped tests or equivalent verification
<!-- DOD:END -->
