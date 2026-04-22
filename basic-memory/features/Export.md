---
title: Export
type: feature
canonical: true
domain: export
aliases:
- export workflow
- exported state
- annotations export
status: draft
permalink: video-annotator/features/export
tags:
- feature
- export
- artifacts
- release
---

# Export

This feature owns deterministic export packaging for reviewed annotations and mask artifacts.

## Target Behavior

- Reviewer exports deterministic artifacts after review.
- Video library shows `exported` only when latest export matches current persisted review state.
- Export state stays separate from propagation progress.

## Contracts

- Backend contracts:
  - `POST /api/videos/{video_id}/export`
  - `GET /api/exports/{export_id}`
  - deterministic export generator for `annotations.json` and PNG mask tree
  - library `exported` state derivation that flips stale exports back to `ready`
- Frontend contracts:
  - live review or library affordance to trigger export
  - visible export status and download workflow
  - library chrome that reflects real derived `exported` state
- Data or storage contracts:
  - `annotations.json` must keep stable video, object, and frame ordering
  - mask paths must stay relative to export root
  - boxes-only export must omit mask artifacts without lying about manual boxes

## Verification Strategy

- Durable evidence today:
  - `backend/tests/unit/models/test_frame_annotation_models.py` freezes relative `mask_path` storage.
  - `backend/tests/integration/api/test_sam2_shell_runtime.py` proves persisted SAM2 mask files reopen and download.
  - `backend/tests/integration/api/test_annotation_foundation_manual_box.py` proves manual rows persist with `mask: null`.
- Future backend proof must freeze deterministic artifact contents and stale-export semantics once routes land.
- Future frontend and browser proof must cover export trigger, download, and library `exported` state.
- Manual proof remains blocked until export routes and UI exist.

## Observations

- [status] Export remains unimplemented beyond persistence prerequisites. #export #status
- [guardrail] Do not treat fixture-shell export chrome as proof of live export behavior. #export #ui-shell
- [guardrail] Prerequisite persistence tests are not export workflow proof. #export #testing
- [library] `exported` is library state, not propagation state. #library #export
- [rule] Export state must not reuse propagation progress bar semantics. #progress #export

## Relations

- relates_to [[Export Format]]
- relates_to [[API]]
- relates_to [[Test Plan]]
