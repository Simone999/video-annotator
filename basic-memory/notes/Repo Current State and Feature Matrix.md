---
title: Repo Current State and Feature Matrix
type: note
permalink: video-annotator/notes/repo-current-state-and-feature-matrix
tags:
- status
- snapshot
- features
- roadmap
---

# Repo Current State and Feature Matrix

This note is overview only. Detailed truth lives in feature notes under `basic-memory/features/`. There is no standalone review-workspace ergonomics feature note right now, so current route-workspace truth is intentionally split across `[[Video Ingest and Exact-Frame Review]]`, `[[SAM2 Shell and Runtime]]`, `[[Export]]`, and the current roadmap notes.

## Capability Overview

| Area | Feature Note | Current Status | Routing Summary |
| --- | --- | --- | --- |
| Video ingest and exact-frame review | [[Video Ingest and Exact-Frame Review]] | implemented foundation | Local indexing and canonical frame review foundations are real on shipped route-owned `/` and `/review/:videoId` flows |
| Annotation foundation and manual box workflow | [[Annotation Foundation and Manual Box Workflow]] | implemented foundation | Stable object identity and manual box CRUD exist on core path |
| Review route UX and inspector parity | [[Video Ingest and Exact-Frame Review]], [[SAM2 Shell and Runtime]] | implemented current parity | Route-owned library-first single-stage review now ships timeline-first transport, shared selected range, and backend-backed selected-object inspector truth |
| SAM2 shell and runtime | [[SAM2 Shell and Runtime]] | partial | Prompt and propagation adapters now ship behind current service boundary, while refine flow and final runtime parity review remain open |
| Mask editing and cleanup | [[Mask Editing and Cleanup]] | missing | Cleanup and corrected-mask workflows still need implementation |
| Export | [[Export]] | missing | Export flow and `exported` state derivation still missing |
| Import existing boxes | [[Import Existing Boxes]] | blocked | Import scope still blocked by unresolved mapping |

## Current Repo Summary

Repo strongest shipped path is route-owned library-first exact-frame review plus persisted manual box workflow. Current frontend already ships `/` and `/review/:videoId`, with review-route transport and inspector parity routed through `[[Video Ingest and Exact-Frame Review]]` and `[[SAM2 Shell and Runtime]]`. Remaining roadmap risk now starts at real SAM2 runtime trust, mask cleanup, export, import, and hardening.

## Observations
- [status] Repo strongest shipped path is route-owned library-first exact-frame review plus persisted manual box CRUD #review #manual-box #routing
- [status] Current frontend already ships library-first route ownership and single-stage live review surface #frontend #ux
- [status] Current review route now ships selected-object summary truth and timeline-first transport on canonical backend frames #frontend #review
- [gap] No dedicated review-workspace ergonomics feature note exists now; current route-workspace truth is split across `[[Video Ingest and Exact-Frame Review]]`, `[[SAM2 Shell and Runtime]]`, `[[Export]]`, and the current roadmap notes by design #memory #routing #gap
- [gap] Real SAM2 runtime now has prompt and propagation adapters behind the current boundary, but refine flow and final runtime parity review remain open #sam2 #runtime
- [gap] Export remains missing beyond prerequisite persisted state and mask layout #export #gap
- [gap] Import remains blocked by unresolved mapping #import #contract
- [retrieval] Use this note for repo overview, high-level feature status, or feature-note map queries #status #snapshot

## Relations
- relates_to [[Features Index]]
- relates_to [[Video Ingest and Exact-Frame Review]]
- relates_to [[Annotation Foundation and Manual Box Workflow]]
- relates_to [[SAM2 Shell and Runtime]]
- relates_to [[Mask Editing and Cleanup]]
- relates_to [[Export]]
- relates_to [[Import Existing Boxes]]
