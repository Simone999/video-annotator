---
title: Feature
type: schema
entity: feature
version: 2
schema:
  type(enum): [feature]
  canonical: boolean
  domain: string
  aliases?(array): string
  status?(enum): [active, draft, historical]
  tags?(array): string
settings:
  validation: warn
permalink: video-annotator/schema/feature
tags:
- schema
- feature
---

# Feature

Canonical feature-note metadata lives in frontmatter. Feature notes stay small and own only durable product truth.

## Conventions

- `type` stays `feature`.
- `canonical` is `true` for the owning feature note.
- `domain` names the capability area, such as `review`, `sam2`, `export`, or `import`.
- `aliases` holds likely query variants.
- `status` is optional and only for draft or historical feature notes.
- Feature body should keep durable capability truth, scope boundaries, target behavior, contracts, and verification strategy.
- Transient blockers, environment failures, and execution history belong in `archive/`.

## Observations

- [schema] Feature notes should own durable capability truth, scope boundaries, target behavior, contracts, and verification strategy without task history. #feature
- [schema] Feature metadata should make canonical leaf notes easy to filter with `note_types=["feature"]` away from indexes and templates. #search

## Relations

- relates_to [[Features Index]]
- relates_to [[Feature Template]]
