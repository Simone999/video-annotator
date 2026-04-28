---
title: 2026-04-28 - move live task and milestone tracking to backlog
type: decision
canonical: true
domain: decisions
aliases:
- backlog live tracking
- backlog task workflow
- backlog milestone workflow
permalink: video-annotator/decisions/2026-04-28-move-live-task-and-milestone-tracking-to-backlog
tags:
- decision
- backlog
- workflow
- archive
---

# 2026-04-28 - move live task and milestone tracking to backlog

- Date: 2026-04-28

## Decision

Move live task and milestone tracking out of archive markdown and into `backlog.md`. Keep durable truth in `basic-memory/`. Keep `archive/plans/` active for stage-1 handoff notes, and keep old archive task or milestone files as historical snapshots only.

## Why

Archive-based live tracking drifted. Open task and milestone truth split across durable notes, archive routers, and shipped code. Backlog gives one live source for status, dependencies, milestones, and execution notes while leaving durable memory clean.

## Consequences

- New live tasks belong in Backlog, not `archive/tasks/`.
- New live milestones belong in Backlog, not `archive/milestones/`.
- `archive/tasks/` and `archive/milestones/` stay for completed history and frozen pre-Backlog snapshots.
- `archive/plans/` still holds stage-1 plans.
- Durable process and schema notes must describe Backlog-first workflow.
- Live task and milestone field conventions should route through `[[Task]]` and `[[Milestone]]`, not pre-calibration process leaf notes.
- Task and milestone process notes that duplicated Backlog structure may be quarantined under `archive/notes/temp-task-milestone-memory/` instead of staying searchable in durable memory.

## Links

- Related notes: [[Workflow]], [[Process Index]], [[Plans Index]], [[Task]], [[Milestone]]
- Supersedes part of: [[2026-04-22 - keep durable memory in basic-memory and move transient tracking to archive]]
- Related docs: `AGENTS.md`

## Observations
- [decision] Live task and milestone truth now lives in Backlog, not archive markdown. #backlog #workflow
- [boundary] Basic Memory stays durable; archive keeps plans and history. #memory #archive
- [migration] Pre-Backlog open archive task and milestone notes are frozen snapshots after migration. #history #migration
- [calibration] Pre-calibration task and milestone process guides can be quarantined outside `basic-memory/` when they duplicate Backlog structure. #memory #workflow

## Relations
- part_of [[Decisions Index]]
- relates_to [[Workflow]]
- relates_to [[Plans Index]]
- relates_to [[Task]]
- relates_to [[Milestone]]
