---
title: Spec
type: schema
entity: spec
version: 2
schema:
  type(enum): [spec]
  canonical: boolean
  domain: string
  aliases?(array): string
  status?(enum): [active, draft, historical]
  tags?(array): string
settings:
  validation: warn
permalink: video-annotator/schema/spec
tags:
- schema
- spec
---

# Spec

Spec notes own stable contracts and requirements. They should not repeat task history or oversized verification logs.

## Conventions

- `type` stays `spec`.
- `canonical` is `true` for current product and engineering contracts.
- `domain` names the spec area, such as `product`, `engineering`, `operations`, or `planning`.
- `status` is optional and only for draft or historical spec notes.

## Observations

- [schema] Spec notes should hold stable requirements and contracts that many features depend on. #spec
- [schema] Spec metadata should use `type: spec` so contract notes separate cleanly from routers and support material during retrieval. #search

## Relations

- relates_to [[Spec Index]]
