---
id: TASK-3.6
title: Write Milestone 0 runbook baseline
status: Done
assignee: []
created_date: '2026-04-10 13:57'
updated_date: '2026-04-10 14:00'
labels:
  - milestone-0
  - docs
milestone: m-0
dependencies: []
references:
  - docs/engineering/runbook.md
documentation:
  - docs/spec.md
  - AGENTS.md
parent_task_id: TASK-3
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Document the Milestone 0 operating baseline for repository layout, local storage, deferred startup behavior, and the currently verified developer tooling commands.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 The runbook covers repository layout, local storage, deferred startup and model operations, and common failure recovery guidance.
- [x] #2 The runbook distinguishes verified developer tooling commands from still-deferred startup and product test commands.
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Run `make format-check`
- [ ] #2 Run `make lint`
- [ ] #3 Run `make typecheck`
- [ ] #4 Run scoped tests or equivalent verification
<!-- DOD:END -->
