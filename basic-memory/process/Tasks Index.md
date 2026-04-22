---
title: Tasks Index
type: note
permalink: video-annotator/tasks/index
tags:
- task
- memory
- index
---

# Tasks Index

This note is the durable router for task-tracking conventions. Use it to understand task lifecycle, note shape, and where transient task records now live.

Start with `[[Workflow]]` if you need full staged SOP before using task notes. Use transient task notes under `archive/tasks/` during stage 2 task sessions.

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
archive/tasks/
├── todo/         # not started
├── in_progress/  # active execution
├── blocked/      # waiting on external truth
└── done/         # historical task records
```

## Observations
- [nav] Use this note as durable router for task process and archive storage.
- [discipline] Reusable task guidance stays in `basic-memory/process/`; concrete task notes live under `archive/tasks/`.
- [discipline] Not-yet-started task notes keep only Creation phase filled; later phases stay blank until work actually starts.
- [scope] Tasks stay testable and feature-scoped, but durable feature notes should not list them.
- [workflow] `[[Workflow]]` is staged SOP; archive task notes are work-order layer for stage 2.

## Relations
- indexed_by [[Process Index]]
- relates_to [[Workflow]]
- relates_to [[Process Index]]
- relates_to [[Task Definition]]
- relates_to [[Plan Template]]
- relates_to [[Task Breakdown Guide]]
- relates_to [[Task Implementation Guide]]
- relates_to [[Task Template]]
- relates_to [[Task]]
