---
title: Index
type: schema
entity: index
version: 2
schema:
  type(enum): [index]
  canonical: boolean
  domain: string
  aliases?(array): string
  tags?(array): string
settings:
  validation: warn
permalink: video-annotator/schema/index
tags:
- schema
- index
---

# Index

Index notes are routers only. They should stay short, low-noise, and easy to skip once the owning leaf note is known.

## Conventions

- `type` stays `index`.
- `canonical` is always `false`.
- `domain` names the folder or routing area.
- `aliases` should cover broad navigation queries only.

## Observations

- [schema] Index notes route readers to owning notes and should never compete with canonical leaf notes on topic queries. #index
- [schema] Keep index notes lean: purpose, child links, 1-2 routing observations, and sparse relations are enough. #search

## Relations

- relates_to [[Memory Index]]
