---
title: Task
type: schema
entity: Task
version: 1
schema:
  status(enum): [todo, in_progress, blocked, done]
  assigned_to?: string
  current_step?: integer
  completed?: string
  steps(array): string
  tags?(array): string
settings:
  validation: warn
permalink: video-annotator/schema/task
tags:
- schema
- task
---

# Task

Canonical task schema lives in frontmatter. Keep task note metadata aligned with that `schema:` block.

## Conventions

- `status` is task lifecycle enum.
- `assigned_to` identifies active owner.
- `current_step` points at active item in ordered `steps` list.
- `completed` stores completion metadata as string when task finishes.
- `steps` keeps ordered work breakdown.
- `tags` keeps searchable labels.
- body sections carry the staged lifecycle details: creation, planning, execution, and wrap-up.

## Observations
- [schema] Task notes need a small, explicit lifecycle model instead of free-form progress text #schema
- [schema] `steps` should stay ordered so progress can be tracked without ambiguity #tasks
- [schema] `completed` is a completion date, not a status synonym #workflow
- [schema] Stage details live in the task note body, so frontmatter stays minimal unless a real tracking need appears #workflow

## Relations
- relates_to [[Task Definition]]
- relates_to [[Task Template]]
- relates_to [[Task Implementation Guide]]
- relates_to [[Task Breakdown Guide]]
- relates_to [[Data Model]]
