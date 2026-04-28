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

Keep only durable knowledge in `basic-memory/`. Move transient tracking out of durable memory. Live tasks and milestones now live in Backlog, while repo-root `archive/` keeps plans, audits, retired docs, and legacy task or milestone snapshots.

## Why

Transient tracking had become majority of note volume and was polluting search results, indexes, and context assembly. Durable feature, process, schema, reference, and test notes need to stay easy to retrieve without dragging execution history into every search.

## Consequences

- `basic-memory/process/` owns workflow, templates, and tracking conventions.
- Backlog owns live task and milestone execution truth.
- `archive/plans/` and `archive/notes/` own transient plan and audit history.
- `archive/tasks/` and `archive/milestones/` keep completed history plus frozen pre-Backlog snapshots.
- Durable feature notes should not list transient tasks or milestones.
- Schemas for `Task`, `Plan`, and `Milestone` remain in `basic-memory/schema/` because they are reusable note contracts, not transient records.

## Links

- Related notes: [[Memory Index]], [[Process Index]], [[Workflow]], [[Schema Index]]
- Related docs: `AGENTS.md`

## Observations
- [decision] Durable knowledge stays in `basic-memory/`; transient tracking moves to repo-root `archive/`. #memory #workflow
- [reason] Search and context quality degrade when execution history dominates note volume. #memory #retrieval
- [consequence] Feature notes should keep durable truth only and stop mirroring transient backlog routing. #features #workflow
- [superseded] Live task and milestone storage moved again on 2026-04-28 from archive markdown into Backlog. #backlog #history

## Relations
- part_of [[Decisions Index]]
- relates_to [[Memory Index]]
- relates_to [[Process Index]]
- relates_to [[Workflow]]
