---
title: Plans Index
type: index
canonical: false
domain: workflow
aliases:
- plan index
- stage 1 plans
- archive plans
permalink: video-annotator/plans/plans-index
tags:
- plan
- memory
- index
---

# Plans Index

This note is the durable router for plan-tracking conventions. Use it to understand what plans are for, which template to use, and where plan notes live now that tasks and milestones moved to Backlog.

## Plan Role

- plans are stage-1 handoffs for substantial work
- durable plan-writing guidance stays in `basic-memory/process/`
- concrete plan notes live under `archive/plans/`
- plan task breakdown should reference Backlog task IDs or titles, not new archive task notes
- use `[[Task]]` for current Backlog section conventions while shaping task breakdown

## Tracking Layout

```text
archive/plans/
├── draft/   # still being shaped or reviewed
├── active/  # current execution handoff
└── done/    # historical plan records
```

## Observations
- [routing] This note routes stage-1 plan conventions and archive storage only. #workflow
- [boundary] Concrete plan notes live in `archive/plans/` folders matching frontmatter `status`. #archive

## Relations
- indexed_by [[Process Index]]
- relates_to [[Plan Template]]
- relates_to [[Task]]
