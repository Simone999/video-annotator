---
title: Features Index
type: index
canonical: false
domain: features
aliases:
- feature index
- feature notes
- source of truth features
permalink: video-annotator/features/features-index
tags:
- feature
- memory
- index
---

# Features Index

Use this note only to find the owning feature note. Open one leaf note for the durable feature truth, contracts, and verification strategy.

## Canonical feature notes

- [[Video Ingest and Exact-Frame Review]] for library flow, review route, and canonical frame loading
- [[Annotation Foundation and Manual Box Workflow]] for object identity and manual box CRUD
- [[SAM2 Shell and Runtime]] for prompt, propagation, confidence, and summary truth
- [[Mask Editing and Cleanup]] for refine and cleanup work
- [[Export]] for deterministic artifact creation and exported-state truth
- [[Import Existing Boxes]] for current-pipeline import work

`[[Feature Template]]` is helper scaffolding only.

## Rules

- One leaf note per capability area.
- Feature notes own durable capability truth, scope boundaries, target behavior, contracts, and verification strategy.
- Detailed execution history and evidence logs stay in `archive/`.
- Do not route tasks or milestones from durable feature notes.

## Observations
- [routing] This note routes feature ownership only; leaf notes hold the real feature truth. #feature
- [boundary] Archive notes hold detailed execution history and test runs; feature notes stay durable and compact. #workflow

## Relations
- indexed_by [[Memory Index]]
