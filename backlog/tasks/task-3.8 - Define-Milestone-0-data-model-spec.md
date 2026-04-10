---
id: TASK-3.8
title: Define Milestone 0 data model spec
status: To Do
assignee: []
created_date: '2026-04-10 13:57'
updated_date: '2026-04-10 14:00'
labels:
  - milestone-0
  - docs
  - backend
milestone: m-0
dependencies:
  - TASK-3.4
  - TASK-3.5
  - TASK-3.6
references:
  - docs/engineering/data-model.md
documentation:
  - docs/spec.md
  - docs/product/requirements.md
  - docs/engineering/runbook.md
parent_task_id: TASK-3
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Write the initial Milestone 0 data model contract for local filesystem layout and the SQLite videos table that will store indexed metadata.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 The data model spec defines the initial videos table fields required by Milestone 0 indexing.
- [ ] #2 The document covers local filesystem assumptions for repository-owned state relevant to Milestone 0.
- [ ] #3 Object, mask, and later annotation lifecycle rules are explicitly deferred.
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Run `make format-check`
- [ ] #2 Run `make lint`
- [ ] #3 Run `make typecheck`
- [ ] #4 Run scoped tests or equivalent verification
<!-- DOD:END -->
