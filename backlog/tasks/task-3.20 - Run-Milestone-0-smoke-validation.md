---
id: TASK-3.20
title: Run Milestone 0 smoke validation
status: To Do
assignee: []
created_date: '2026-04-10 13:59'
updated_date: '2026-04-10 14:01'
labels:
  - milestone-0
  - validation
milestone: m-0
dependencies:
  - TASK-3.12
  - TASK-3.14
  - TASK-3.16
  - TASK-3.17
  - TASK-3.19
references:
  - examples/bedroom.mp4
documentation:
  - docs/spec.md
  - docs/engineering/runbook.md
  - docs/engineering/test-plan.md
parent_task_id: TASK-3
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Run the Milestone 0 smoke checks across the frontend shell backend health route SQLite bootstrap and video indexing flow, then record the validation evidence and any follow-up work in Backlog.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 The frontend shell backend health route SQLite bootstrap and video indexing flow are validated end to end against Milestone 0 expectations.
- [ ] #2 Validation evidence and any follow-up work or residual risks are recorded in Backlog instead of hidden in docs-based trackers.
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Run `make format-check`
- [ ] #2 Run `make lint`
- [ ] #3 Run `make typecheck`
- [ ] #4 Run scoped tests or equivalent verification
<!-- DOD:END -->
