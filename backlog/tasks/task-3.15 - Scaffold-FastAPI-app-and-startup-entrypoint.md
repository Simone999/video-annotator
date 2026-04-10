---
id: TASK-3.15
title: Scaffold FastAPI app and startup entrypoint
status: To Do
assignee: []
created_date: '2026-04-10 13:58'
updated_date: '2026-04-10 14:00'
labels:
  - milestone-0
  - backend
milestone: m-0
dependencies:
  - TASK-3.7
  - TASK-3.8
references:
  - backend/pyproject.toml
  - backend/app/main.py
  - backend/app/api/
  - backend/app/core/
  - backend/app/schemas/
documentation:
  - docs/spec.md
  - AGENTS.md
parent_task_id: TASK-3
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create the Milestone 0 backend application scaffold with FastAPI app startup and package structure aligned to the planned architecture.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 The backend project contains a FastAPI app entrypoint and the package layout needed for API core and schema modules.
- [ ] #2 The scaffold stays within Milestone 0 scope and does not introduce later product features.
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Run `make format-check`
- [ ] #2 Run `make lint`
- [ ] #3 Run `make typecheck`
- [ ] #4 Run scoped tests or equivalent verification
<!-- DOD:END -->
