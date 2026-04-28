---
title: Task Template
type: template
canonical: false
domain: workflow
permalink: video-annotator/tasks/task-template
tags:
- task
- memory
- template
---

# Task Template

This is the canonical content template for one live Backlog task. Use it when you need a task template, task content shape, or migration target from older archive task notes.

Live tasks belong in Backlog. Durable process notes live in `process/` memory.

```text
Title:
- clear brief title that summarizes task

Status:
- `To Do`, `In Progress`, or `Done`

Labels:
- area tags only when they help retrieval

Milestone:
- set when roadmap grouping matters

Dependencies:
- point to real blocker tasks instead of inventing pseudo-status

Description:
- why task matters
- in-scope and out-of-scope edges
- affected durable feature notes when useful

Acceptance Criteria:
- objective outcome 1
- objective outcome 2

Definition of Done:
- tests pass
- docs or durable memory updated

Implementation Plan:
- concrete planned tests
- concrete implementation steps

Implementation Notes:
- read-first links
- active execution notes
- exact blocker truth when blocked

Final Summary:
- PR-style wrap-up once done
```

## Observations
- [template] This note is canonical blank shape for one live Backlog task.
- [phase] Creation, planning, execution, and wrap-up still need separate content even though storage moved to Backlog.
- [completion] Task is not done until Acceptance Criteria and Definition of Done match reality.
- [storage] Live tasks live in Backlog; reusable process notes stay in `basic-memory/process/`.

## Relations
- indexed_by [[Process Index]]
- relates_to [[Task Definition]]
- relates_to [[Task Breakdown Guide]]
- relates_to [[Task Implementation Guide]]
- relates_to [[Task]]
