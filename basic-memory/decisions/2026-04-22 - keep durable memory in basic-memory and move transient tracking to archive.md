---
title: 2026-04-22 - keep durable memory in basic-memory and move transient tracking to archive
type: decision
canonical: true
domain: decisions
aliases:
- durable memory archive split
- basic memory archive
- transient tracking archive
permalink: video-annotator/decisions/2026-04-22-keep-durable-memory-in-basic-memory-and-move-transient-tracking-to-archive
tags:
- decision
- memory
- workflow
- archive
---

# 2026-04-22 - keep durable memory in basic-memory and move transient tracking to archive

- Date: 2026-04-22

## Decision

Keep only durable knowledge in `basic-memory/`. Move transient task, plan, milestone, and audit tracking into repo-root `archive/`.

## Why

Transient tracking had become majority of note volume and was polluting search results, indexes, and context assembly. Durable feature, process, schema, reference, and test notes need to stay easy to retrieve without dragging execution history into every search.

## Consequences

- `basic-memory/process/` owns workflow, templates, and tracking conventions.
- `archive/tasks/`, `archive/plans/`, `archive/milestones/`, and `archive/notes/` own transient execution and history.
- Durable feature notes should not list transient tasks or milestones.
- Schemas for `Task`, `Plan`, and `Milestone` remain in `basic-memory/schema/` because they are reusable note contracts, not transient records.

## Links

- Related notes: [[Memory Index]], [[Process Index]], [[Workflow]], [[Schema Index]]
- Related docs: `AGENTS.md`

## Observations
- [decision] Durable knowledge stays in `basic-memory/`; transient tracking moves to repo-root `archive/`. #memory #workflow
- [reason] Search and context quality degrade when execution history dominates note volume. #memory #retrieval
- [consequence] Feature notes should keep durable truth only and stop mirroring transient backlog routing. #features #workflow

## Relations
- part_of [[Decisions Index]]
- relates_to [[Memory Index]]
- relates_to [[Process Index]]
- relates_to [[Workflow]]
