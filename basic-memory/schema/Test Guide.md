---
title: Test Guide
type: schema
entity: test_guide
version: 2
schema:
  type(enum): [test_guide]
  canonical: boolean
  domain: string
  aliases?(array): string
  tags?(array): string
settings:
  validation: warn
permalink: video-annotator/schema/test-guide
tags:
- schema
- testing
---

# Test Guide

Test-guide notes route readers to the right boundary and record repo-specific testing rules.

## Conventions

- `type` stays `test_guide`.
- `canonical` is `true` for durable testing guides.
- `domain` is usually `testing`.
- `aliases` should cover the boundary name and likely synonyms.

## Observations

- [schema] Test-guide notes should explain when to use one boundary, not embed giant example libraries. #testing
- [schema] Testing metadata should help search land on one boundary guide through `type: test_guide`, tags, and alias recall instead of a generic index. #search

## Relations

- relates_to [[Tests Index]]
