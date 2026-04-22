---
title: Decision
type: schema
entity: decision
version: 2
schema:
  type(enum): [decision]
  canonical: boolean
  domain: string
  aliases?(array): string
  status?(enum): [active, historical, superseded]
  tags?(array): string
settings:
  validation: warn
permalink: video-annotator/schema/decision
tags:
- schema
- decision
---

# Decision

Canonical decision metadata lives in frontmatter. Decision notes stay durable and dated.

## Conventions

- `type` stays `decision`.
- `canonical` is `true` for durable decisions.
- `domain` names the decision area, such as `workflow`, `frontend`, or `memory`.
- `status` is optional and only when a decision becomes historical or superseded.

## Observations

- [schema] One decision note should capture one durable choice, not a rolling log. #decision
- [schema] Decision metadata should use `type: decision` so note-type filters separate real decisions from templates and indexes during retrieval. #search

## Relations

- relates_to [[Decisions Index]]
- relates_to [[Decision Template]]
