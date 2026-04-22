---
title: Process
type: schema
entity: process
version: 2
schema:
  type(enum): [process]
  canonical: boolean
  domain: string
  aliases?(array): string
  tags?(array): string
settings:
  validation: warn
permalink: video-annotator/schema/process
tags:
- schema
- process
---

# Process

Process notes explain durable workflow, not one task run.

## Conventions

- `type` stays `process`.
- `canonical` is `true` for durable workflow guides.
- `domain` is usually `workflow` or another durable operating area.

## Observations

- [schema] Process notes should explain repeatable operating rules, not transient execution history. #workflow
- [schema] Process metadata should use `type: process` so durable SOP notes separate cleanly from templates and archive records. #search

## Relations

- relates_to [[Process Index]]
- relates_to [[Workflow]]
