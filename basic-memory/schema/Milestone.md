---
title: Milestone
type: schema
entity: Milestone
version: 2
schema:
  state(enum): [active, archived]
  title: string
  description: string
settings:
  validation: warn
permalink: video-annotator/schema/milestone
tags:
- schema
- milestone
---

# Milestone

Canonical live milestone schema now follows Backlog milestone fields. Keep new live milestone metadata aligned with that `schema:` block.

## Conventions

- live milestones stay active in Backlog until archived.
- live milestone body keeps one top-level `Description` section only.
- that `Description` section must use these subsections in order: `Goal`, `What To Implement`, `Related Features`, `Ordering And Dependencies`, `Historical Source`.
- milestone should describe ordering truth and related feature context without turning into mixed audit log.
- `Historical Source` owns archive note paths and archive status only.
- durable product or roadmap truth still belongs in feature notes and live Backlog tasks, not in milestone history text.
- old `planned`, `in_progress`, `blocked`, and `done` archive milestone notes remain legacy snapshots only.

## Observations
- [schema] Live milestone truth now uses Backlog active or archived state rather than archive folder status. #schema
- [schema] Milestones should describe what the milestone is and what it still requires, not mixed audit logs. #workflow
- [schema] Milestone subsection order is a reusable body contract that Backlog does not validate for us. #workflow
- [schema] Archive milestone files remain history, not live roadmap contract. #archive

## Relations
- relates_to [[Workflow]]
