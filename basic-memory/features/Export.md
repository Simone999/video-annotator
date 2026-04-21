---
title: Export
type: note
permalink: video-annotator/features/export
tags:
- feature
- export
- artifacts
- release
---

# Export

This feature owns deterministic export packaging for reviewed annotations and mask artifacts.

## Summary
- Goal: create deterministic machine-readable export artifacts from persisted review state.
- Primary users: downstream pipeline owners and reviewers handing off finished work.
- Owning task note: [[Testing export]]

## Scope
- In scope:
  - export create route
  - export download route
  - deterministic `annotations.json`
  - PNG mask export tree
  - `boxes_only` mode
  - library `exported` state when latest export is current
- Out of scope:
  - review editing itself
  - import

## Current State
- Shipped behavior: persisted annotation metadata, relative mask paths, on-disk mask files, and manual rows with `mask: null` exist as prerequisites only.
- Known gaps: export API routes, export generator, exported-artifact storage, library export-state derivation, and live download UI are still missing.
- Current blockers: no export workflow can run until create and download paths plus deterministic artifact generation exist.

## Verification Evidence
- Backend prerequisite: `backend/tests/unit/models/test_frame_annotation_models.py` freezes persisted `mask_path` storage as relative `masks/<video>/<object>/frame_<idx>.png`.
- Backend prerequisite: `backend/tests/integration/api/test_sam2_shell_runtime.py` proves persisted SAM2 masks reopen and download through real API routes with stable relative mask paths.
- Backend prerequisite: `backend/tests/integration/api/test_annotation_foundation_manual_box.py` proves manual rows persist with `mask: null`, which later export must keep honest for boxes-only or mixed outputs.
- Related non-goal evidence: deleted fixture-shell export chrome never counted as live export proof; current repo still has no frontend export automation because no live export UI exists.
- Manual execution: blocked. Current app has no export create route, no download route, no artifact generator, and no live export UI to run honestly.

## Target Behavior
- Reviewer exports deterministic artifacts after review.
- Video library can show `exported` only when latest export matches current persisted review state.
- Export state is separate from propagation progress and should not reuse progress-bar semantics.

## Contracts and Dependencies
- Backend contracts:
  - future `POST /api/videos/{video_id}/export`
  - future `GET /api/exports/{export_id}`
  - deterministic export generator for `annotations.json` and PNG mask tree
  - library `exported` state derivation that flips stale exports back to `ready`
- Frontend contracts:
  - live review or library affordance to trigger export
  - visible export status and download workflow
  - library chrome that reflects real derived `exported` state, not fixture copy
- Data or storage contracts:
  - `annotations.json` must keep stable video or object or frame ordering
  - mask paths must stay relative to export root
  - boxes-only export must omit mask artifacts without lying about manual boxes
- External dependencies:
  - annotation persistence
  - mask storage on disk
  - export output directory management

## Evidence
- Specs:
  - [[Product Requirements]]
  - [[Export Format]]
  - [[API]]
  - [[Data Model]]
- Milestone notes:
  - [[m-5: Export and Release Hardening]]
- Code or test evidence:
  - concrete implementation and verification inventory intentionally lives in task notes and testing guidance, not in this feature note

## Linked Tasks
- [[Testing export]]

## Integration Tests

| ID | Surface | Scenario | Real-World Why | Setup/Fixtures | Automation Status | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| INT-001 | backend | Reopen and download persisted SAM2 mask files through real annotation routes | Proves current system already stores stable relative paths and can resolve them back to real PNG artifacts before export packaging exists | Real FastAPI app, temp SQLite DB, fake `Sam2Service`, temp mask files | automated | `backend/tests/api/test_sam2_shell_runtime.py` |
| INT-002 | backend | Persist manual annotation rows with `mask: null` and reload them cleanly | Freezes prerequisite mixed-state truth so later boxes-only export can represent manual boxes without invented mask files | Real FastAPI app, temp SQLite DB, manual annotation routes | automated | `backend/tests/api/test_annotation_foundation_manual_box.py` |
| INT-003 | backend | Create export, download artifact, compare repeated outputs for deterministic JSON ordering or mask tree or boxes-only behavior, then derive `exported` vs stale state honestly | Future backend truth must freeze artifact contents and stale-export semantics once routes land | Real FastAPI app, temp SQLite DB, temp masks and exports dirs, fixture videos with saved manual and SAM2 rows | blocked until routes and generator exist | missing `POST /api/videos/{video_id}/export`, missing `GET /api/exports/{export_id}`, missing export generator, and missing export-state derivation |
| INT-004 | frontend | Trigger export from live UI, show status, download artifact, and reflect stale or current export state in library | Future UI must prove reviewer handoff flow without relying on fixture-shell chrome | `LiveReviewScreen` or real library screen with `MSW` once typed client and controls exist | blocked until UI exists | no live export button, no status UI, no download affordance, and no typed export client |

## E2E Tests

| ID | Scenario | Real-World Workflow | Environment | Automation Status | Evidence |
| --- | --- | --- | --- | --- | --- |
| E2E-001 | Trigger export, wait for completion, download artifact, and reopen library state in a real browser | One real cross-stack reviewer handoff from finished review to exported artifact and back to library status | local stack with real frontend, FastAPI app, DB, and artifact output dirs once export ships | blocked | missing export routes, artifact generator, live export UI, and persisted export-state derivation |

## Manual Tests

Use exact execution status values only:
- `✅ Done`
- `⚠️ Partially`
- `❌ Not Done`

| ID | Scenario | Setup | Steps | Expected Result | Execution Status | Execution Notes |
| --- | --- | --- | --- | --- | --- | --- |
| MAN-001 | Create full export twice and compare artifacts for determinism | Run local backend and frontend dev stack after export create or download flow exists; use one video with saved manual and SAM2 annotations | Trigger export twice without changing review state, download both artifacts, unpack them, diff `annotations.json`, compare PNG tree names and contents, compare archive or folder ordering | Outputs match exactly or differ only in allowed metadata if spec defines any; object or frame ordering and file names stay stable | ❌ Not Done | Blocked because no export route, no download route, and no artifact generator exist in current app |
| MAN-002 | Create boxes-only export and inspect artifact shape | Run local backend and frontend dev stack after export mode selection exists | Trigger boxes-only export, download artifact, inspect `annotations.json`, verify no PNG mask tree is emitted, and confirm box-only annotations stay present | Export contains deterministic JSON with boxes only, no invented mask files, and manual or mixed rows remain truthful | ❌ Not Done | Blocked because no export mode UI or backend mode contract exists |
| MAN-003 | Edit exported review state and verify library falls back from `exported` to `ready` until next export | Run local backend and frontend dev stack after export plus library derivation exist | Export one reviewed video, confirm library shows `exported`, change manual annotation or SAM2-backed state, reopen library, then export again | Library shows `ready` after edit, then returns to `exported` only after new export matches current saved state | ❌ Not Done | Blocked because no export-state derivation or live export workflow exists; current shell `Exported` badge is fixture-only |

## Observations
- [status] Export remains missing beyond prerequisites #export #status
- [guardrail] Do not treat fixture-shell export chrome as proof of live export behavior #export #ui-shell
- [guardrail] `backend/tests/models/test_frame_annotation_models.py` stays prerequisite unit evidence for export path shape, not an integration-table row under router guidance #export #testing #unit
- [library] `exported` is library state, not propagation state #library #export
- [rule] Export state must not reuse propagation progress bar semantics #progress #export

## Relations
- relates_to [[Repo Current State and Feature Matrix]]
- relates_to [[m-5: Export and Release Hardening]]
- relates_to [[Export Format]]
- relates_to [[API]]
- relates_to [[Test Plan]]
- relates_to [[backend-api-integration-tests]]
- relates_to [[frontend-integration-tests]]
- relates_to [[e2e-tests]]
