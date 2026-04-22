---
title: Spec and PRD roadmap parity audit 2026-04-22
type: note
permalink: video-annotator/notes/spec-and-prd-roadmap-parity-audit-2026-04-22
tags:
- notes
- audit
- roadmap
- prd
- spec
---

# Spec and PRD roadmap parity audit 2026-04-22

Read set:
- `docs/spec.md`
- `docs/product/prd.md`
- current feature notes under `basic-memory/features/`
- current milestone and task notes under `basic-memory/milestones/` and `basic-memory/tasks/`
- shipped frontend and backend code under `frontend/src/` and `backend/app/`

## Shipped now

- route-owned `/` and `/review/:videoId`
- canonical backend exact-frame reads and frame-step flow
- manual box create, edit, reload, and delete
- single-stage live review shell with paused-only mutation rule
- library review-state summary except real `exported`
- annotated-frame and keyframe jumps plus keyboard shortcuts
- SAM2 shell contracts, polling, cancel, and persisted-mask reopen shell

## Missing now

- timeline-first transport and selected-range controls on live review
- selected-object summary UI for bbox, confidence, and counters
- real SAM2 runtime behind prompt and propagation routes
- corrected-mask persistence, refine, cleanup, and object-track delete flows
- export create/download flow, deterministic artifacts, and real `exported` state
- current-pipeline import contract, importer, and import UI
- Docker E2E stack and release hardening flow

## Coverage and routing

- feature-note ownership is whole again: ingest plus library state route through `[[Video Ingest and Exact-Frame Review]]`, inspector and confidence semantics route through `[[SAM2 Shell and Runtime]]`, export-state truth routes through `[[Export]]`, and blocked import truth routes through `[[Import Existing Boxes]]`
- `m-2` covers remaining review-workspace parity only
- `m-3` covers real SAM2 runtime with propagation split into adapter task, job-integration task, checkpoint review, and final review
- `m-4` covers mask correction and cleanup only
- `m-5` covers export workflow and real `exported` state only
- `m-6` stays blocked on import contract truth
- `m-7` covers Docker E2E and release hardening
- stale broad tasks are deleted and replaced by one-iteration tasks with required review checkpoints

## Ralph ordering

Ralph backlog keeps blocked import work after actionable milestones so autonomous runs do not stop early on known external blocker truth.

## Observations
- [status] Current code already ships core review path, not only mockup shell history #status #review
- [coverage] Feature-note ownership now covers the full PRD surface; remaining gaps are implementation or contract work only #coverage #prd
- [gap] Missing scope clusters cleanly into review parity, real SAM2 runtime, mask cleanup, export, import, and hardening #gap #roadmap
- [decision] Roadmap reset replaces stale broad tasks with one-iteration tasks plus review checkpoints every 5 tasks and at milestone end #tasks #roadmap
- [decision] Ralph backlog orders blocked import work after actionable milestones so autonomous execution can keep moving #ralph #blocked

## Relations
- relates_to [[Repo Current State and Feature Matrix]]
- relates_to [[Auditing PRD Feature Coverage]]
- relates_to [[Video Ingest and Exact-Frame Review]]
- relates_to [[SAM2 Shell and Runtime]]
- relates_to [[Mask Editing and Cleanup]]
- relates_to [[Export]]
- relates_to [[Import Existing Boxes]]
- relates_to [[m-2: Review Workspace PRD Parity]]
- relates_to [[m-3: Real SAM2 Runtime]]
- relates_to [[m-4: Mask Editing and Cleanup]]
- relates_to [[m-5: Export Workflow and Exported State]]
- relates_to [[m-6: Import Existing Boxes]]
- relates_to [[m-7: Docker E2E and Release Hardening]]