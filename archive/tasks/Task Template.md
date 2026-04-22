---
title: Task Template
type: note
permalink: video-annotator/tasks/task-template
tags:
- task
- memory
- template
---

# Task Template

This is the canonical task template and blank task note shape. Use this note when you need a task template, task note template, blank task record, or the standard markdown shape for a task.

Concrete task notes belong in `basic-memory/tasks/<status>/`. Keep reference notes in `basic-memory/tasks/` root.

```markdown
---
id: task-42
title: clear brief title that summarizes the task (< 10 words)
status: todo
# Hard rule: `status: done` is forbidden until Acceptance Criteria and Definition of Done checkboxes match reality.
completed:
steps:
- creation
- planning
- execution
- wrap_up
tags:
- backend
- api
---

## Creation Phase

### Description

Brief explanation of the task purpose and why it matters.

### Scope

- In scope:
- Out of scope:

### Affected Features

- [[feature-note]]

### Acceptance Criteria

- [ ] #1 Outcome 1
- [ ] #2 Outcome 2

### Test Intent

- Backend:
- Frontend:
- Manual:

### Definition of Done

- [ ] Tests pass
- [ ] Docs updated

## Planning Phase

### Planned Integration Tests

- Backend:
- Frontend:

### Planned E2E Tests

- Backend:
- Frontend:

### Planned Implementation

- Step 1:
- Step 2:

### Feature Matrix Updates

- Feature note updates needed before or during execution:

## Execution Phase

### Implementation Notes

Write progress, decisions, blockers, and verification observations here while work is active.

## Wrap-Up Phase

### Verification

- Commands run:
- Results:

### Final Summary

PR-style summary of what changed and how it was verified.

### Completion Gate

- [ ] Acceptance Criteria checkboxes updated to match reality
- [ ] Definition of Done checkboxes updated to match reality
- [ ] Only now may `status` change to `done`
```

## When Sections Get Filled

- Creation: `title`, `description`, `scope`, `affected features`, `acceptance criteria`, `test intent`, `definition of done`, ordered `steps`, and optional labels, priority, and assignee
- Planning: `Planned Integration Tests`, `Planned E2E Tests`, `Planned Implementation`, and `Feature Matrix Updates` after the task is taken over and before code changes begin
- Execution: `Implementation Notes` while work is in progress, plus any step tracking needed for the active work
- Wrap-up: `Verification`, `Final Summary`, completed checks, and completion metadata at task completion
- Status gate: do not set `status: done` until Acceptance Criteria and Definition of Done checkboxes are updated to match reality
- Storage gate: move the task note into the folder that matches its current `status`

## Observations
- [template] This note is the canonical task template and blank task note shape.
- [retrieval] Use this note for task template, task note template, or blank task record queries.
- [phase] Creation, planning, execution, and wrap-up stay separated so the reader always knows what stage the task is in.
- [scope] Scope and test intent belong in the initial task record so the agent does not start coding before the work boundary is clear.
- [planning] Concrete planned tests and implementation belong in planning phase, not in creation phase.
- [format] A fenced markdown block is the easiest way to keep the canonical structure copyable.
- [completion] Wrap-up belongs after verification, not before.
- [completion] `status: done` is forbidden until Acceptance Criteria and Definition of Done checkboxes match reality.
- [storage] Concrete task notes live in `tasks/<status>/`; reference notes stay at `tasks/` root.

## Relations
- relates_to [[Task Definition]]
- relates_to [[Task Breakdown Guide]]
- relates_to [[Task Implementation Guide]]
- relates_to [[Task]]
