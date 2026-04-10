---
id: TASK-3.5
title: Write Milestone 0 ADR baseline
status: Done
assignee: []
created_date: '2026-04-10 13:56'
updated_date: '2026-04-10 13:59'
labels:
  - milestone-0
  - docs
milestone: m-0
dependencies: []
references:
  - docs/engineering/adrs/README.md
  - docs/engineering/adrs/0001-backend-decoded-frames-canonical.md
  - docs/engineering/adrs/0002-react-fastapi-split.md
  - docs/engineering/adrs/0003-sam2-isolated-service.md
  - docs/engineering/adrs/0004-masks-on-disk.md
documentation:
  - docs/spec.md
  - AGENTS.md
parent_task_id: TASK-3
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Record the core Milestone 0 architectural decisions that later implementation tasks must follow: backend-decoded frames as canonical, React/FastAPI split, SAM2 service isolation, and masks on disk.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 The ADR set records the canonical-frame decision, the frontend/backend split, SAM2 isolation, and local mask storage.
- [x] #2 The ADR index makes the baseline architecture discoverable for later implementation agents.
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Run `make format-check`
- [ ] #2 Run `make lint`
- [ ] #3 Run `make typecheck`
- [ ] #4 Run scoped tests or equivalent verification
<!-- DOD:END -->
