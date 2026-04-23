---
title: Add export API and client plan
type: plan
status: done
permalink: video-annotator/plans/add-export-api-and-client-plan
tags:
- plan
- export
- api
- frontend
---

# Add export API and client plan

Ship backend export create/download routes on top of existing deterministic artifact builders, then add typed frontend client helpers that later UI work can call without guessing payloads or URLs.

## Summary
- Goal: finish `US-040` with route-level export behavior and typed client support
- Success criteria: backend can create export artifact and download it by `export_id`; frontend parses create response and builds download URL; targeted tests and project quality checks pass
- Audience: stage-2 implementation session for current Ralph iteration

## Current State
- Existing behavior: export payload builder, artifact writer, and exported-state snapshot derivation already exist
- Main gaps: no HTTP route to create export, no download route, no persisted artifact lookup helper, no typed frontend export client
- Constraints: keep backend `frame_idx` and persisted relative `mask_path` truth intact; do not build UI in this slice; avoid touching dirty video-library worktree files unless story requires it

## Assumptions And Open Questions
- Locked assumptions:
  - create route can return stable `export_id` only; artifact stays server-written on local filesystem
  - download route should stream existing zip artifact or fail explicitly when export id is unknown or file missing
  - typed client belongs in `frontend/src/features/video-review/api.ts` because later review export UI will call it first
- Open questions:
  - none after reading current export feature note, route spec, and existing exporter service

## Affected Features
- [[Export]]

## Task Breakdown
1. [[Add export API and client]] — expose backend export workflow and typed frontend contract for later UI work

## Handoff Notes
- Read `[[Workflow]]`, `[[Export]]`, `[[Export API]]`, and `[[Export Format]]` first.
- Tests first: backend route contract plus frontend client parsing.
- Keep export story scoped to route and client only; UI and library-state rendering belong to later tasks.
