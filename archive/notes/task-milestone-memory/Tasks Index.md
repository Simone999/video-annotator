---
title: Tasks Index
type: index
canonical: false
domain: workflow
aliases:
- task index
- task routing
- archive tasks
permalink: video-annotator/tasks/index
tags:
- task
- memory
- index
---

# Tasks Index

This note is the durable router for task-tracking conventions. Use it to understand Backlog task lifecycle, note shape, and where legacy archive task snapshots live.

Start with `[[Workflow]]` if you need full staged SOP before using live tasks. Use Backlog for active work and `archive/tasks/` only for historical snapshots.

## Reading Order

1. [[Workflow]]
2. [[Process Index]]
3. [[Task Definition]]
4. [[Task Template]]
5. [[Task Breakdown Guide]]
6. [[Task Implementation Guide]]
7. [[Task]]

## Tracking Layout

```text
Backlog task statuses:
- To Do
- In Progress
- Done

Blocked work:
- model real blockers with dependencies and explicit blocker notes inside Backlog task content

Legacy snapshots:
- archive/tasks/todo/
- archive/tasks/in_progress/
- archive/tasks/blocked/
- archive/tasks/done/
```

## Observations
- [routing] Use this note to route into `[[Workflow]]` and one task guide, not for topical implementation truth. #workflow
- [boundary] Reusable task guidance stays in `basic-memory/process/`; live task records live in Backlog; `archive/tasks/` is legacy history only. #archive

## Relations
- indexed_by [[Process Index]]
