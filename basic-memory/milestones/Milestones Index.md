---
title: Milestones Index
type: note
permalink: video-annotator/milestones/milestones-index
tags:
- milestone
- memory
- index
- roadmap
---

# Milestones Index

This note is the root router for milestone memory. Use it to find roadmap status folders and the milestone note that matches the current slice.

## Status Meanings

- `planned/`: milestone is queued but not yet active.
- `in_progress/`: milestone is current roadmap focus.
- `blocked/`: milestone cannot move until an external dependency or contract is resolved.
- `done/`: milestone is finished and kept for roadmap history.

```text
milestones/
├── Milestones Index.md
├── planned/
│   └── Planned Milestones Index.md
├── in_progress/
│   └── In Progress Milestones Index.md
├── blocked/
│   └── Blocked Milestones Index.md
└── done/
    └── Done Milestones Index.md
```

## Observations
- [navigation] This note is the root router for milestone roadmap memory.
- [scope] Concrete milestone notes live in the status folder that matches frontmatter `status`.
- [scope] Root `milestones/` can also hold milestone audit notes that compare roadmap notes against current repo truth.
- [retrieval] Use this note for milestone roadmap, milestone sequencing, or current roadmap focus queries.

## Relations
- indexes [[Memory Index]]
- indexes [[Planned Milestones Index]]
- indexes [[In Progress Milestones Index]]
- indexes [[Blocked Milestones Index]]
- indexes [[Done Milestones Index]]
- indexes [[Auditing m-2 and m-2a code gaps 2026-04-21]]
- relates_to [[Milestone]]
- relates_to [[Workflow]]
