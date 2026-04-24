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
  - persisted `export_records` snapshot truth keyed by `video_id`
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
  - `backend/tests/unit/services/test_review_summaries.py` proves exported versus stale review-state derivation.
  - `backend/tests/integration/api/test_review_summary_contracts.py` proves `ready -> exported -> ready` after later edit.
  - `backend/tests/unit/services/test_exports.py` freezes native `annotations.json` shape, deterministic repeated output, PNG mask artifact copying, and boxes-only mask omission for one persisted video.
  - `backend/tests/integration/api/test_export_api.py` proves route-level export create/download, persisted export-record snapshots, and zipped artifact contents.
  - `backend/tests/unit/models/test_frame_annotation_models.py` freezes relative `mask_path` storage.
  - `backend/tests/integration/api/test_sam2_shell_runtime.py` proves persisted SAM2 mask files reopen and download.
  - `backend/tests/integration/api/test_annotation_foundation_manual_box.py` proves manual rows persist with `mask: null`.
- `frontend/tests/integration/video-review/export-ui-flow.test.tsx` proves review export trigger, download-link construction from stable `export_id`, review-state rendering, and library `ready -> exported -> ready` remount truth after a later edit.
- Manual browser smoke on 2026-04-24 used fresh `backend:bootstrap:e2e`, `backend:seed:e2e:review-navigation`, `backend:dev:e2e`, `frontend:dev:e2e`, and `dev-browser --browser us041-export --headless`; screenshots: `/home/simone/.dev-browser/tmp/us041-exported-review-browser.png` and `/home/simone/.dev-browser/tmp/us041-ready-library-browser.png`.

## Observations
- [frontend] Review export UI should refresh `selectedVideo` from backend after export creation or persisted review edits instead of inferring `ready` or `exported` locally; edits on older frames can leave the latest export fresh. #export #frontend #review-state

- [status] Export now has persisted snapshot truth, backend create/download routes, native `annotations.json` generation, and backend PNG mask artifact or boxes-only package writing; visible export UI still remains unimplemented. #export #status
- [guardrail] Do not treat fixture-shell export chrome as proof of live export behavior. #export #ui-shell
- [guardrail] Exported-state derivation proof is not full export workflow proof; artifact generation and download still need their own tests. #export #testing
- [library] `exported` is library state, not propagation state. #library #export
- [rule] Export state must not reuse propagation progress bar semantics. #progress #export
- [rule] Export freshness should compare the latest persisted export snapshot against the latest non-imported review-output update for that video. #export #state
- [rule] Export create should return stable `export_id` and keep download path construction in frontend client code. #export #api
- [rule] Native JSON export should keep persisted string object ids and relative mask paths, and omit missing box or mask keys instead of exporting `null`. #export #json

## Relations

- relates_to [[Export Format]]
- relates_to [[API]]
- relates_to [[Test Plan]]
- [rule] Boxes-only export must omit both copied mask files and per-frame `mask_path` keys while keeping persisted box or source truth intact. #export #boxes-only
- [rule] PNG artifact export should copy persisted masks into the export root at the same relative `mask_path` locations already stored on annotation rows. #export #masks
