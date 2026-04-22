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

This note is the root router for task memory. Use it to find task reference notes at `basic-memory/tasks/` root, then open the state-folder index for concrete task notes.

Start with `[[Workflow]]` if you need the full step-by-step SOP before using task notes.
Use `[[Task Breakdown Guide]]` plus `[[Plan Template]]` during stage 1 request breakdown. Use the concrete task notes themselves during stage 2 task sessions.

## Reading Order

1. [[Workflow]]
2. [[Plan Template]]
3. [[Task Definition]]
4. [[Task Template]]
5. [[Task Breakdown Guide]]
6. [[Task Implementation Guide]]
7. [[Task]]
8. [[Todo Tasks Index]]
9. [[In Progress Tasks Index]]
10. [[Blocked Tasks Index]]
11. [[Done Tasks Index]]

## Reference Notes

- [[Task Definition]]
- [[Task Template]]
- [[Task Breakdown Guide]]
- [[Task Implementation Guide]]

## Task State Indexes

- [[Todo Tasks Index]]
- [[In Progress Tasks Index]]
- [[Blocked Tasks Index]]
- [[Done Tasks Index]]

## Folder Tree

```text
tasks/
├── Tasks Index.md
├── Task Definition.md            # what a task is
├── Task Breakdown Guide.md       # how to split work into tasks
├── Task Implementation Guide.md  # how to implement a task
├── Task Template.md              # blank task note shape
├── todo/
│   ├── Todo Tasks Index.md
│   └── ... tasks with status: todo
├── in_progress/
│   ├── In Progress Tasks Index.md
│   └── ... tasks with status: in_progress
├── blocked/
│   ├── Blocked Tasks Index.md
│   └── ... tasks with status: blocked
└── done/
    ├── Done Tasks Index.md
    └── ... tasks with status: done
```

## Observations
- [nav] Use this note as the task-memory root router; open reference notes here or the state-folder indexes for concrete tasks.
- [discipline] Reference notes stay at `tasks/` root and concrete task notes live under state folders that match frontmatter `status`.
- [discipline] Not-yet-started concrete task notes keep only Creation phase filled; later phases stay present but blank until work actually starts.
- [scope] Tasks stay testable and feature-scoped so they can feed directly into source-of-truth feature notes.
- [workflow] `[[Workflow]]` is the staged SOP; concrete task notes are the work-order layer for stage 2.

## Relations
- relates_to [[Workflow]]
- relates_to [[Task Definition]]
- relates_to [[Plan Template]]
- relates_to [[Task Breakdown Guide]]
- relates_to [[Task Implementation Guide]]
- relates_to [[Task Template]]
- relates_to [[Task]]
- indexes [[Todo Tasks Index]]
- indexes [[In Progress Tasks Index]]
- indexes [[Blocked Tasks Index]]
- indexes [[Done Tasks Index]]
