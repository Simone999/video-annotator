---
id: TASK-3.13
title: Scaffold frontend React and Vite app
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
references:
  - frontend/package.json
  - frontend/tsconfig.json
  - frontend/vite.config.ts
  - frontend/index.html
  - frontend/src/main.tsx
documentation:
  - docs/spec.md
  - AGENTS.md
parent_task_id: TASK-3
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create the Milestone 0 frontend application scaffold using React TypeScript and Vite so later tasks can implement the empty two-pane shell on a real app foundation.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 The frontend project includes the package and config files needed for a React TypeScript Vite application.
- [ ] #2 The frontend scaffold can be launched locally once the documented startup flow is added.
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Run `make format-check`
- [ ] #2 Run `make lint`
- [ ] #3 Run `make typecheck`
- [ ] #4 Run scoped tests or equivalent verification
<!-- DOD:END -->
