---
title: Make PRD standalone
type: task
permalink: video-annotator/tasks/done/make-prd-standalone
id: task-make-prd-standalone
status: done
completed: 2026-04-21
steps:
- creation
- execution
- wrap_up
tags:
- task
- prd
- docs
- memory
- requirements
---

## Creation Phase

### Description

Make product-facing PRD docs and product-memory notes stand alone so a cold implementer can understand requirements without engineering docs.

### Acceptance Criteria

- [x] repo PRD includes import scope, product state meanings, library card minimum fields, and selected-range counter meanings
- [x] product-memory notes match the same requirements
- [x] downstream spec or engineering copies no longer contradict product state meanings
- [x] verification evidence is recorded honestly

## Execution Phase

### Notes

- Work started on 2026-04-21 after user clarified import scope, `started` meaning, and `ready -> in_progress -> ready` propagation flow.

## Wrap-Up Phase

### Verification

- Commands run:
  - `git diff --check`
  - `rg -n 'first save happened|reviewer has saved at least one annotation edit|enough metadata to choose work|selected-range counters without defining|import of existing boxes|import existing boxes from the current pipeline format|state detail line|Counter meanings:|State transitions:' docs basic-memory`
  - cold-read pass of `docs/product/prd.md`, `basic-memory/spec/product/Product Requirements.md`, and `basic-memory/spec/product/Frontend Interaction Spec.md`
- Results:
  - `git diff --check` returned clean output.
  - Grep showed the expected new wording for import scope, state transitions, library card field requirements, and counter meanings, with no stale product-facing `started = first save happened` wording left.
  - Product-facing repo docs and product-memory notes now stand alone for cold requirement reading.
