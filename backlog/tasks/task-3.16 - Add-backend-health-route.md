---
id: TASK-3.16
title: Add backend health route
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
  - TASK-3.15
references:
  - backend/app/main.py
  - backend/app/api/
  - backend/app/schemas/
documentation:
  - docs/spec.md
  - docs/engineering/api-spec.md
parent_task_id: TASK-3
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Add a minimal backend smoke-test route for Milestone 0 so the FastAPI service can be launched and queried locally.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 The backend exposes a local health or hello-world route within the documented Milestone 0 API scope.
- [ ] #2 The route returns a successful response suitable for smoke validation.
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Run `make format-check`
- [ ] #2 Run `make lint`
- [ ] #3 Run `make typecheck`
- [ ] #4 Run scoped tests or equivalent verification
<!-- DOD:END -->
