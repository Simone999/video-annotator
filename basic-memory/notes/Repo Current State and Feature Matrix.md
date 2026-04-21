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

This note is overview only. Detailed truth lives in feature notes under `basic-memory/features/`.

## Capability Overview

| Area | Feature Note | Current Status | Routing Summary |
| --- | --- | --- | --- |
| Video ingest and exact-frame review | [[Video Ingest and Exact-Frame Review]] | implemented foundation | Local indexing and canonical frame review foundations are real; library-first single-stage UI is documented target |
| Annotation foundation and manual box workflow | [[Annotation Foundation and Manual Box Workflow]] | implemented foundation | Stable object identity and manual box CRUD exist on core path |
| Review workspace ergonomics | [[Review Workspace Ergonomics]] | partial | New mockup-first single-stage UX is agreed, but runtime frontend still lags |
| SAM2 shell and runtime | [[SAM2 Shell and Runtime]] | partial | Shell exists; runtime trust and new confidence or summary contracts are not fully shipped |
| Mask editing and cleanup | [[Mask Editing and Cleanup]] | missing | Cleanup and corrected-mask workflows still need implementation |
| Export | [[Export]] | missing | Export flow and `exported` state derivation still missing |
| Import existing boxes | [[Import Existing Boxes]] | blocked | Import scope still blocked by unresolved mapping |

## Current Repo Summary

Repo strongest shipped path is still canonical frame review plus persisted manual box workflow. Docs and memory now target library-first entry and single-stage review surface, but current runtime frontend has not caught up yet.

## Observations
- [status] Repo strongest shipped path is exact-frame review plus persisted manual box CRUD #review #manual-box
- [status] Current-truth docs now target library-first flow and single-stage review surface #docs #ux
- [gap] Runtime frontend still lags new mockup-first screen model #frontend #gap
- [gap] Real SAM2 runtime remains incomplete behind current adapter boundary #sam2 #runtime
- [gap] Export remains missing beyond prerequisite persisted state and mask layout #export #gap
- [gap] Import remains blocked by unresolved mapping #import #contract
- [retrieval] Use this note for repo overview, high-level feature status, or feature-note map queries #status #snapshot

## Relations
- relates_to [[Features Index]]
- relates_to [[Video Ingest and Exact-Frame Review]]
- relates_to [[Annotation Foundation and Manual Box Workflow]]
- relates_to [[Review Workspace Ergonomics]]
- relates_to [[SAM2 Shell and Runtime]]
- relates_to [[Mask Editing and Cleanup]]
- relates_to [[Export]]
- relates_to [[Import Existing Boxes]]