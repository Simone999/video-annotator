---
title: Wire export UI and exported state plan
type: plan
status: active
permalink: video-annotator/plans/wire-export-ui-and-exported-state-plan
tags:
- plan
- export
- frontend
- library
- review
---

# Wire export UI and exported state plan

Ship visible review export controls on top of existing export API or client work, keep review-state truth backend-owned, and verify library route reflects `ready` versus `exported` across real navigation.

## Summary
- Goal: finish `US-041` with review export trigger or download affordance plus honest library or review state rendering
- Success criteria: reviewer can export from live review, review UI exposes stable download path, library route shows backend-derived `exported` and later `ready`, targeted tests and browser proof pass
- Audience: current Ralph stage-2 execution session

## Current State
- Existing behavior: backend create or download routes and typed frontend export client already exist
- Main gaps: live review has no export controls, review route drops backend `review_state`, and no frontend proof shows `ready -> exported -> ready`
- Constraints: keep library and review route chrome aligned to committed 1920x1080 PNGs; do not invent client-side library truth that competes with backend derivation; avoid unrelated dirty library shell work

## Assumptions And Open Questions
- Locked assumptions:
  - review export trigger belongs in review inspector area, not topbar chrome
  - library route should stay backend-derived by reloading list data on route mount instead of carrying sticky export ids in global state
  - latest download affordance can be session-local in review after successful export because list payload does not expose latest `export_id`
- Open questions:
  - none after reading export feature note, current API client, and review or library route code

## Affected Features
- [[Export]]
- [[Video Ingest and Exact-Frame Review]]

## Task Breakdown
1. [[Wire export UI and exported state]] — add review export controls, keep route state honest, and prove library exported-state remount behavior

## Handoff Notes
- Read `[[Workflow]]`, `[[Export]]`, `[[Video Ingest and Exact-Frame Review]]`, `docs/ui/video-library.png`, and `docs/ui/video-review-1920x1080.png` first.
- Tests first: focused route integration proving `ready -> exported -> ready`.
- Keep scope surgical: no new export backend fields and no library-shell redesign.
