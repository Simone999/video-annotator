---
title: Milestone
type: schema
entity: Milestone
version: 1
schema:
  status(enum): [planned, in_progress, blocked, done]
  completed?: string
  tags?(array): string
settings:
  validation: warn
permalink: video-annotator/schema/milestone
tags:
- schema
- milestone
---

# Milestone

Canonical milestone schema lives in frontmatter. Keep milestone note metadata aligned with that `schema:` block.

## Conventions

- `status` is the milestone lifecycle enum.
- `completed` stores completion metadata when a milestone is finished.
- `tags` keeps searchable labels.
- milestone body should describe milestone intent, implementation checklist, and related tasks or features, not drifting code-history notes.

## Observations
- [schema] Milestones need explicit roadmap state so planned, active, blocked, and done work route cleanly.
- [schema] Milestones should describe what the milestone is and what it still requires, not mixed audit logs.
- [schema] Concrete milestones should live in the status folder that matches frontmatter `status` once the folder structure exists.

## Relations
- relates_to [[Milestones Index]]
- relates_to [[Workflow]]
