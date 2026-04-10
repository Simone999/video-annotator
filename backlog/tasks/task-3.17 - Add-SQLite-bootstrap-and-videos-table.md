---
id: TASK-3.17
title: Add SQLite bootstrap and videos table
status: To Do
assignee: []
created_date: '2026-04-10 13:59'
updated_date: '2026-04-10 14:00'
labels:
  - milestone-0
  - backend
  - database
milestone: m-0
dependencies:
  - TASK-3.8
  - TASK-3.15
references:
  - backend/app/db/
  - backend/app/models/
  - backend/app/db/init_db.py
  - data/
documentation:
  - docs/spec.md
  - docs/engineering/data-model.md
  - docs/engineering/runbook.md
parent_task_id: TASK-3
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implement local SQLite initialization for Milestone 0 and create the initial videos table that will hold indexed video metadata.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 The application can create or open the local SQLite database in repository-owned storage.
- [ ] #2 The initial videos table matches the documented Milestone 0 data model.
- [ ] #3 Database initialization is safe to rerun locally without destructive side effects.
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Run `make format-check`
- [ ] #2 Run `make lint`
- [ ] #3 Run `make typecheck`
- [ ] #4 Run scoped tests or equivalent verification
<!-- DOD:END -->
