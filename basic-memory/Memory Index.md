---
title: Memory Index
type: note
permalink: video-annotator/memory-index
tags:
- memory
- index
- navigation
---

# Memory Index

This is the top-level memory index for the `video-annotator` Basic Memory tree. Use this note when you need the memory index, knowledge base map, or the right folder before opening a more specific note.

```text
basic-memory/
├── Memory Index.md                # top-level memory map
├── Workflow.md                    # step-by-step SOP for feature work
├── decisions/                     # durable project, process, and workflow decisions
├── sam2-demo/                     # sam2 demo notes
├── engineering/                   # evergreen engineering learnings
├── features/                      # source-of-truth feature notes with template verification sections
├── milestones/                    # milestone routers plus status folders
│   ├── planned/
│   ├── in_progress/
│   ├── blocked/
│   └── done/
├── notes/                         # general notes
├── plans/                         # plan routers plus status folders
│   ├── draft/
│   ├── active/
│   └── done/
├── reference/                     # external tool, command, and supporting reference notes
├── schema/                        # note schemas
├── spec/                          # canonical project spec
├── tests/                         # durable testing guides and indexes
└── tasks/                         # task references at root plus state folders for concrete tasks
```

Start with `[[Workflow]]` for day-to-day feature work. Use `[[Spec Index]]` for project spec, `[[Engineering Memory Index]]` for engineering memory, `[[Features Index]]` for source-of-truth feature notes, `[[Milestones Index]]` for milestone routing, `[[Plans Index]]` for plan routing, `[[Tasks Index]]` for task workflow, `[[Tests Index]]` for test guidance, `[[Reference Index]]` for external tool and command guidance, and `[[Schema Index]]` for schema notes.

## Observations
- [navigation] This note is the top-level memory index for the whole project knowledge base.
- [retrieval] Use this note for memory index, knowledge base map, or top-level memory tree queries.
- [workflow] `[[Workflow]]` is the quickest root entrypoint for a new reader who wants the feature-work SOP.
- [structure] Workflow, decisions, spec, engineering memory, feature notes, milestones, plans, tests, tasks, schema, notes, and sam2 demo stay separated so readers can jump directly to the right folder.
- [routing] `plans/` keeps reference notes at the root and concrete plan notes under `draft/`, `active/`, and `done/`.
- [routing] `milestones/` keeps routing at the root and concrete milestone notes under `planned/`, `in_progress/`, `blocked/`, and `done/`.
- [routing] `tasks/` keeps reference notes at the root and concrete task notes under state folders like `todo/`, `blocked/`, `in_progress/`, and `done/`.
- [routing] `reference/` holds cross-cutting external tool and command guides that do not belong under one feature or one test layer.

## Relations
- indexes [[Workflow]]
- indexes [[Decisions Index]]
- indexes [[Spec Index]]
- indexes [[Engineering Memory Index]]
- indexes [[Features Index]]
- indexes [[Tasks Index]]
- indexes [[Tests Index]]
- indexes [[Reference Index]]
- indexes [[Schema Index]]
- indexes [[Notes Index]]
- indexes [[Sam2 Demo Index]]
- indexes [[Plans Index]]
- indexes [[Milestones Index]]
