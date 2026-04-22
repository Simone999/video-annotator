---
title: Remediate docs and memory drift and align route UI to authoritative HTML
type: note
permalink: video-annotator/plans/active/remediate-docs-and-memory-drift-and-align-route-ui-to-authoritative-html
status: active
tags:
- plan
- docs
- memory
- frontend
- ui
---

# Remediate docs and memory drift and align route UI to authoritative HTML

Repair stale supporting docs and memory first, then align route-owned React pages to the authoritative HTML mockups without inventing fake runtime data.

## Summary

- Goal: make docs, tracking notes, and route-owned frontend UI agree on current shipped truth and the next HTML-parity follow-up work.
- Success criteria: current-truth docs stop claiming startup auto-bootstrap or old route structure, route-tracking notes point at shipped feature-owned seams, and route-owned React pages move closer to `docs/ui/video-library.html` plus `docs/ui/video-annotation.html` while keeping missing data honest.
- Audience: future task sessions touching docs, memory, route-owned React pages, and remaining review-workspace gaps.

## Current State

- Shipped route ownership now lives under `frontend/src/features/video-library/` and `frontend/src/features/video-review/`.
- Committed frontend browser proof now lives under `frontend/tests/e2e/`, while shared Playwright harness still stays under repo-root `tests/e2e/`.
- Current gaps are mostly truth drift plus remaining review-workspace UI work: selected-object summary wiring, timeline or selected-range controls, and fuller parity with the authoritative HTML shells.

## Locked Rules

- `docs/ui/video-library.html` and `docs/ui/video-annotation.html` are authoritative for high-level layout, hierarchy, and Tailwind direction.
- Runtime values must stay honest. If mockups show unshipped values such as export state, confidence, or corrected counts, the React UI must keep the visual slot but render truthful placeholders or disabled copy.
- No new backend endpoints or schema changes are part of this plan.
- Canonical frame truth stays backend-owned.

## Affected Features

- [[Video Ingest and Exact-Frame Review]]
- [[SAM2 Shell and Runtime]]

## Task Breakdown

1. [[Repair docs and memory drift after route cleanup]] — fix stale docs, indexes, and current-truth notes
2. [[Align route-owned pages to authoritative HTML]] — bring shipped `/` and `/review/:videoId` closer to the authoritative HTML shells without fake runtime data
3. [[Wire live selected-object summary]] — connect inspector summary fields to shipped backend selected-object summary route
4. [[Add live review timeline and selected range controls]] — add timeline-first transport and selected-range controls to the shipped single-stage review surface

## Handoff Notes

- Read `[[Workflow]]`, `[[Video Ingest and Exact-Frame Review]]`, `[[SAM2 Shell and Runtime]]`, and the authoritative `docs/ui/*.html` files first.
- Update memory and supporting docs when contract or behavior wording changes.
- Keep historical notes historical instead of rewriting them as if old runtime details still ship today.
- If UI parity work needs extra task splits, create those task notes before touching runtime code.

## Observations

- [plan] This plan pairs docs or memory cleanup with HTML-driven route UI follow-on work. #docs #memory #frontend #ui
- [rule] Authoritative HTML controls layout direction, but runtime data must remain honest. #frontend #ui #contracts

## Relations

- indexed_by [[Active Plans Index]]
- relates_to [[Workflow]]
- relates_to [[Video Ingest and Exact-Frame Review]]
- relates_to [[SAM2 Shell and Runtime]]
