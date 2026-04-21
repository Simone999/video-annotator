---
title: Plan
type: schema
entity: Plan
version: 1
schema:
  status(enum): [draft, active, done]
  completed?: string
  tags?(array): string
settings:
  validation: warn
permalink: video-annotator/schema/plan
tags:
- schema
- plan
---

# Plan

Canonical plan schema lives in frontmatter. Keep plan note metadata aligned with that `schema:` block.

## Conventions

- `status` is the plan lifecycle enum.
- `completed` stores completion metadata when a plan is finished.
- `tags` keeps searchable labels.
- plan body carries the implementation handoff, task breakdown, and execution notes when relevant.

## Observations
- [schema] Plan notes need a small lifecycle model so draft, active, and completed plans route cleanly.
- [schema] Template and index notes are reference notes, not concrete plan instances.
- [schema] Concrete plans should live in the status folder that matches frontmatter `status` once the folder structure exists.

## Relations
- relates_to [[Plan Template]]
- relates_to [[Plans Index]]
- relates_to [[Workflow]]
