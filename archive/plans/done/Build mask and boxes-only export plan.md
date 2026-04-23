---
title: Build mask and boxes-only export plan
type: plan
status: done
permalink: video-annotator/plans/build-mask-and-boxes-only-export-plan
tags:
- plan
- backend
- export
- artifacts
- m-5
---

# Build mask and boxes-only export plan

Ship deterministic export artifact writing on top of existing native JSON payload builder so later API routes can create one package root without re-deriving mask layout or boxes-only behavior.

## Summary
- Goal: ship backend PNG mask artifact emission and boxes-only export behavior for `US-039`.
- Success criteria: one backend export service writes deterministic `annotations.json`, copies persisted PNG mask files into deterministic relative paths, and omits mask artifacts plus `mask_path` JSON keys in boxes-only mode.
- Audience: agent or engineer implementing export artifact groundwork on `ralph/ui`.

## Current State
- `build_native_json_export_payload` already emits deterministic JSON-ready manifest data for one persisted video.
- Persisted annotation rows already store relative `mask_path` values and on-disk mask PNG files under local masks storage.
- No current service writes `annotations.json` to disk, copies PNG mask artifacts, or strips mask data for boxes-only export.

## Assumptions And Open Questions
- Locked assumptions:
  - This slice stays backend-only. No API routes, `ExportRecord` writes, zip packaging, or frontend UI work.
  - Export package root should be safe to rebuild in place by replacing stale `annotations.json` and `masks/` output under the chosen root.
  - Boxes-only export still writes `annotations.json`; it omits mask files and exported `mask_path` keys while keeping manual or SAM2 box truth intact.
- Open questions:
  - None for this slice; export-format note already freezes mask-tree shape and boxes-only semantics enough to implement service tests.

## Affected Features
- [[Export]]

## Task Breakdown
1. [[Build mask and boxes-only export]] — add failing tests, implement artifact writer, update export docs or memory, and verify backend quality gates.

## Handoff Notes
- Read first: `AGENTS.md`, `[[Workflow]]`, `[[Export]]`, `[[Export Format]]`, `[[Export API]]`, `docs/engineering/export-format.md`, `backend/app/services/exports.py`, and `backend/app/services/frame_annotations.py`.
- Red tests first:
  - write one service test that seeds persisted masks, writes export package with PNG masks enabled, and asserts exact file tree plus JSON `mask_path` entries
  - write one service test that writes boxes-only export and asserts `annotations.json` omits `mask_path` while no `masks/` tree exists
  - keep missing-video behavior wired through existing explicit not-found error
- Keep implementation surgical:
  - extend current export service module instead of inventing route-local helpers
  - add config helper only if export-root resolution needs one reusable entrypoint
  - preserve persisted relative mask paths as export-relative destinations; do not invent alternate filenames
