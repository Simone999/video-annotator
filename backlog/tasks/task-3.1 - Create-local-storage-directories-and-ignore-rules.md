---
id: TASK-3.1
title: Create local storage directories and ignore rules
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
  - .gitignore
  - data/README.md
  - masks/README.md
  - exports/README.md
documentation:
  - docs/spec.md
  - docs/engineering/runbook.md
parent_task_id: TASK-3
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Establish the Milestone 0 local-only storage layout so repository-owned state has canonical locations for runtime data, mask artifacts, and exports.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 The repository contains the local storage directories required by the Milestone 0 scaffold.
- [x] #2 The ignore rules keep runtime storage out of versioned outputs while preserving any placeholder files that explain directory purpose.
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Run `make format-check`
- [ ] #2 Run `make lint`
- [ ] #3 Run `make typecheck`
- [ ] #4 Run scoped tests or equivalent verification
<!-- DOD:END -->
