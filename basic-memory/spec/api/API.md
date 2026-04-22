---
title: API
type: spec
canonical: true
domain: api
aliases:
- backend api
- api routes
- route contracts
permalink: video-annotator/spec/api/api
tags:
- spec
- api
- backend
- routes
---

# API

Route-contract root for backend HTTP API. Use this note for shared API rules, then open one child note for the owning route area.

Base path stays:

`/api`

## Route areas

- [[Videos API]] for video list, detail, source, manifest, exact-frame, and selected-object summary routes
- [[Annotations API]] for frame annotation reads and manual annotation writes
- [[Objects API]] for object-track create, update, and delete routes
- [[SAM2 API]] for SAM2 session, prompt, refine, and propagate routes
- [[Jobs API]] for job polling and cancellation
- [[Export API]] for export creation and artifact download routes

## Shared boundaries

- Route notes own endpoint paths, request or query params, response shapes, errors, and route-local notes.
- Cross-cutting frame truth stays in [[Frame Indexing Contract]].
- Persisted storage and derived read-model semantics stay in [[Data Model]].
- SAM2 runtime and adapter architecture stay in [[SAM2 Integration]].
- Export artifact layout and `annotations.json` semantics stay in [[Export Format]].

## Observations
- [routing] This note is root for HTTP route contracts and should route readers to one route-area note quickly. #api
- [base-path] Backend HTTP base path stays `/api`. #api
- [boundary] Route notes own HTTP contract detail; cross-cutting engineering invariants stay in dedicated spec leaves. #api #spec

## Relations
- indexed_by [[Spec Index]]
- relates_to [[Engineering Index]]
- indexes [[Videos API]]
- indexes [[Annotations API]]
- indexes [[Objects API]]
- indexes [[SAM2 API]]
- indexes [[Jobs API]]
- indexes [[Export API]]
- relates_to [[Frame Indexing Contract]]
- relates_to [[Data Model]]
- relates_to [[SAM2 Integration]]
- relates_to [[Export Format]]
