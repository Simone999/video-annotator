---
title: Plans Index
type: note
permalink: video-annotator/plans/plans-index
tags:
- plan
- memory
- index
---

# Plans Index

This note is the root router for plan memory. Use it to find reference notes at `plans/` root, then open the status-folder index for concrete plan notes.

Start with `[[Workflow]]` if you need the canonical staged SOP before opening a plan note.
Use `[[Plan Template]]` when you need the blank handoff shape.

## Status Meanings

- `draft/`: plan exists but is still being shaped or reviewed.
- `active/`: plan is current execution handoff.
- `done/`: plan is historical but still useful for audit.

```text
plans/
├── Plans Index.md
├── Plan Template.md              # blank plan shape
├── draft/
│   └── Draft Plans Index.md
├── active/
│   └── Active Plans Index.md
└── done/
    └── Done Plans Index.md
```

## Observations
- [navigation] This note is the root router for durable plan memory.
- [scope] Store concrete plan notes in the status folder that matches frontmatter `status`.
- [retrieval] Use this note for plan memory, stored plan, or handoff plan queries.
- [discipline] `Plan Template` stays at `plans/` root because it is reference, not a concrete plan instance.

## Relations
- indexes [[Draft Plans Index]]
- indexes [[Active Plans Index]]
- indexes [[Done Plans Index]]
- indexes [[Plan Template]]
- relates_to [[Plan]]
- relates_to [[Workflow]]
