---
title: Build native JSON exporter plan
type: plan
status: done
permalink: video-annotator/plans/build-native-json-exporter-plan
tags:
- plan
- backend
- export
- artifacts
- m-5
---

# Build native JSON exporter plan

Persist one deterministic JSON-export slice so later mask artifact and API work can reuse one typed manifest builder instead of inventing route-local serialization.

## Summary
- Goal: ship backend native `annotations.json` generation for `US-038`.
- Success criteria: one export service builds manifest shape from persisted videos, objects, and frame annotations; ordering stays deterministic across repeated runs; focused backend tests freeze exact output.
- Audience: agent or engineer implementing export artifact groundwork on `ralph/ui`.

## Current State
- `ExportRecord` persistence now exists for exported-state freshness, but no artifact generator exists.
- Export format note already freezes root shape, relative mask paths, normalized boxes, and deterministic ordering requirements.
- Later stories need this slice as stable backend primitive for PNG artifact emission and API routes.

## Locked Decisions
- This slice builds native JSON manifest only. No PNG copy, zip packaging, route handlers, or frontend work.
- Manifest ordering must be deterministic from persisted ids and canonical frame indices, not incidental DB row order.
- Exporter should preserve persisted truth: frame keys stay strings, `box_xywh_norm` stays omitted when row has no box, and `mask_path` stays omitted when row has no mask.

## Task Breakdown
1. [[Build native JSON exporter]] — add typed export service, deterministic manifest query, focused tests, and tracker updates.

## Handoff Notes
- Read first: `AGENTS.md`, `[[Workflow]]`, `[[Export]]`, `[[Export API]]`, `[[Export Format]]`, `docs/spec.md`, `backend/app/db/models.py`, `backend/app/services/frame_annotations.py`, and `backend/app/services/review_summaries.py`.
- Red tests first:
  - unit coverage for exact native manifest JSON shape with mixed manual, propagated, corrected, and mask-less rows
  - determinism coverage proving repeated builds return identical payload with sorted object and frame ordering
  - optional missing-video guard if service returns explicit not-found error
- Keep implementation surgical:
  - add one export service module
  - export typed manifest dataclasses or TypedDict-friendly payload builders only as needed
  - wire service through `app.services.__init__`
  - no route or file-writing shell yet
