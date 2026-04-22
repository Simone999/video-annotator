---
title: Template
type: schema
entity: template
version: 2
schema:
  type(enum): [template]
  canonical: boolean
  domain: string
  aliases?(array): string
  tags?(array): string
settings:
  validation: warn
permalink: video-annotator/schema/template
tags:
- schema
- template
---

# Template

Templates are helper scaffolds. They should stay short and never compete with canonical leaf notes on topical search.

## Conventions

- `type` stays `template`.
- `canonical` is always `false`.
- `domain` names the area the template supports.

## Observations

- [schema] Template notes should show the smallest useful blank shape and avoid full tutorials or example dumps. #template
- [schema] Template metadata should let retrieval skip scaffolding unless the reader explicitly asks for a template or searches `note_types=["template"]`. #search

## Relations

- relates_to [[Process Index]]
- relates_to [[Features Index]]
