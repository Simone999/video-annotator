---
title: Reference
type: schema
entity: reference
version: 2
schema:
  type(enum): [reference]
  canonical: boolean
  domain: string
  aliases?(array): string
  tags?(array): string
settings:
  validation: warn
permalink: video-annotator/schema/reference
tags:
- schema
- reference
---

# Reference

Reference notes hold repo-specific tool usage and house rules. They should not copy long generic vendor docs.

## Conventions

- `type` stays `reference`.
- `canonical` is `true` when the note is the repo's current rule or helper guide.
- `domain` names the tool area, such as `frontend`, `browser`, or `testing`.

## Observations

- [schema] Reference notes should store local deltas, gotchas, and usage rules, not full third-party tutorials. #reference
- [schema] Reference metadata should make repo-specific guides easy to find with `note_types=["reference"]` and broad tool queries. #search

## Relations

- relates_to [[Reference Index]]
