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

This note is the durable router for task-tracking conventions. Use it to understand task lifecycle, note shape, and where transient task records now live.

Start with `[[Workflow]]` if you need full staged SOP before using task notes. Use transient task notes under `archive/tasks/` during implementation sessions.

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
- [routing] Use this note to route into `[[Workflow]]` and one task guide, not for topical implementation truth. #workflow
- [boundary] Reusable task guidance stays in `basic-memory/process/`; concrete task notes live under `archive/tasks/`. #archive

## Relations
- indexed_by [[Process Index]]
