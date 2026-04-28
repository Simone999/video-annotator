---
title: Task
type: schema
entity: Task
version: 2
schema:
  status(enum): ["To Do", "In Progress", "Done"]
  assignee(array): string
  labels?(array): string
  milestone?: string
  dependencies?(array): string
  acceptance_criteria(array): string
  definition_of_done(array): string
settings:
  validation: warn
permalink: video-annotator/schema/task
tags:
- schema
- task
---

# Task

Canonical live task schema now follows Backlog fields. Keep new live task metadata aligned with that `schema:` block.

## Conventions

- `status` is Backlog lifecycle enum.
- `assignee` stores zero or more owners.
- `labels` keeps searchable task tags.
- `milestone` links task into one active Backlog milestone when needed.
- `dependencies` points at real blocker tasks.
- task should stay small enough for one focused delivery pass or one PR.
- task should include enough context that a dumb subagent can continue without hidden chat history.
- live task body sections must appear in this exact top-level order: `Description`, `References`, `Acceptance Criteria`, `Implementation Plan`, `Implementation Notes`, `Definition of Done`, `Final Summary`.
- `Description` owns summary, scope, affected features, prerequisites, and dependency or historical context.
- `References` owns note links, file paths, original archive task paths, and read-first material.
- `Implementation Plan` owns planned work and planned verification only, with `Planned Tests` and `Implementation Steps` subsections.
- `Implementation Notes` owns execution-only truth such as blockers, verification results, and review findings.
- `Final Summary` owns PR-style wrap-up only after real work lands.
- generic staged-workflow boilerplate should stay out of individual tasks.
- old archive task frontmatter remains legacy snapshot format only.

## Observations
- [schema] Live task truth now uses Backlog task fields instead of archive note frontmatter. #schema
- [schema] Dependencies should model real blockers instead of reviving archive-only blocked status. #tasks
- [schema] Task section order and section ownership are reusable body rules that Backlog does not validate for us. #workflow
- [shape] Task should stay atomic enough for one focused delivery pass and should not depend on hidden chat context. #workflow
- [schema] Old archive task notes remain valid history, not current contract. #workflow

## Relations
- relates_to [[Workflow]]
- relates_to [[Plan Template]]
- relates_to [[Data Model]]
