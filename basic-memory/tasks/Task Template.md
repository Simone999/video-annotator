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

```markdown
---
id: task-42
title: clear brief title that summarizes the task (< 10 words)
status: todo
completed:
tags:
- backend
- api
---

## Description

Brief explanation of the task purpose and why it matters.

## Acceptance Criteria

- [ ] #1 Outcome 1
- [ ] #2 Outcome 2

## Definition of Done

- [ ] Tests pass
- [ ] Docs updated

## Implementation Plan

## Implementation Notes

Write progress, decisions, and blockers here while you work.

## Final Summary

PR-style summary of what changed and how it was verified.
```

## When Sections Get Filled

- Creation: `title`, `description`, `acceptance criteria`, `definition of done`, and optional labels, priority, and assignee
- Planning: `Implementation Plan` after the task is taken over and before code changes begin
- Execution: `Implementation Notes` while work is in progress, plus any step tracking needed for the active work
- Wrap-up: `Final Summary`, completed checks, and completion metadata at task completion

## Observations
- [template] This note is the canonical task template and blank task note shape.
- [retrieval] Use this note for task template, task note template, or blank task record queries.
- [phase] Creation and execution should stay separated so tasks do not start with hidden implementation detail.
- [format] A fenced markdown block is the easiest way to keep the canonical structure copyable.
- [completion] Wrap-up belongs after verification, not before.

## Relations
- relates_to [[Task Definition]]
- relates_to [[Task Breakdown Guide]]
- relates_to [[Task Implementation Guide]]
- relates_to [[Task]]