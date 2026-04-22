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

This is the canonical task template and blank task note shape. Use it when you need a task template, task note template, or blank task record.

Concrete task notes belong in `archive/tasks/<status>/`. Durable process notes live in `basic-memory/process/`.

```markdown
---
id: task-42
title: clear brief title that summarizes task (< 10 words)
status: todo
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

Brief explanation of task purpose and why it matters.

### Scope

- In scope:
- Out of scope:

### Affected Features

- [[feature-note]]

### Acceptance Criteria

- [ ] Outcome 1
- [ ] Outcome 2

### Test Intent

- Backend:
- Frontend:
- Manual:

### Definition of Done

- [ ] Tests pass
- [ ] Docs or durable memory updated

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

## Execution Phase

### Implementation Notes

## Wrap-Up Phase

### Verification

- Commands run:
- Results:

### Final Summary

### Completion Gate

- [ ] Acceptance Criteria checkboxes updated to match reality
- [ ] Definition of Done checkboxes updated to match reality
- [ ] Only now may `status` change to `done`
```

## Observations
- [template] This note is canonical blank shape for one task note.
- [phase] Creation, planning, execution, and wrap-up stay separated so reader always knows task stage.
- [completion] `status: done` is forbidden until Acceptance Criteria and Definition of Done checkboxes match reality.
- [storage] Concrete task notes live in `archive/tasks/<status>/`; reusable process notes stay in `basic-memory/process/`.

## Relations
- indexed_by [[Process Index]]
- relates_to [[Task Definition]]
- relates_to [[Task Breakdown Guide]]
- relates_to [[Task Implementation Guide]]
- relates_to [[Task]]
