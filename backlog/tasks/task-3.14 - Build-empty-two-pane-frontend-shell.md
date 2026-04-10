---
id: TASK-3.14
title: Build empty two-pane frontend shell
status: To Do
assignee: []
created_date: '2026-04-10 13:58'
updated_date: '2026-04-10 14:00'
labels:
  - milestone-0
  - frontend
milestone: m-0
dependencies:
  - TASK-3.9
  - TASK-3.13
references:
  - frontend/src/app/App.tsx
  - frontend/src/components/layout/
  - frontend/src/features/video/
  - frontend/src/features/annotations/
documentation:
  - docs/spec.md
  - AGENTS.md
parent_task_id: TASK-3
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implement the Milestone 0 placeholder interface for the playback pane and exact-frame pane without adding annotation behavior that belongs to later milestones.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 The frontend renders placeholder regions for playback work, exact-frame work, and future status or controls.
- [ ] #2 The layout preserves the two-pane workflow and works on desktop and narrow viewports.
- [ ] #3 The shell does not imply browser-time-based annotation behavior or later annotation tools.
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Run `make format-check`
- [ ] #2 Run `make lint`
- [ ] #3 Run `make typecheck`
- [ ] #4 Run scoped tests or equivalent verification
<!-- DOD:END -->
