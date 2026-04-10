---
id: TASK-3.2
title: Add frontend and backend placeholder directories
status: Done
assignee: []
created_date: '2026-04-10 13:56'
updated_date: '2026-04-10 13:59'
labels:
  - milestone-0
  - infra
milestone: m-0
dependencies: []
references:
  - frontend/README.md
  - backend/README.md
documentation:
  - docs/spec.md
parent_task_id: TASK-3
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create the reserved frontend and backend directories for the planned React/Vite client and FastAPI service without implying unimplemented product behavior.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 The repository contains frontend and backend top-level directories aligned with the planned architecture.
- [x] #2 Each directory includes a placeholder README that explains its role without claiming application behavior already exists.
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Run `make format-check`
- [ ] #2 Run `make lint`
- [ ] #3 Run `make typecheck`
- [ ] #4 Run scoped tests or equivalent verification
<!-- DOD:END -->
