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

This note is now the overview only. Detailed feature truth lives in the feature notes under `basic-memory/features/`. Use this note to answer which capability areas exist, what their high-level status is, and where their source-of-truth note lives.

## Capability Overview

| Area | Feature Note | Current Status | Routing Summary |
| --- | --- | --- | --- |
| Video ingest and exact-frame review | [[Video Ingest and Exact-Frame Review]] | implemented | Open the feature note for ingest, exact-frame truth, blockers, and evidence summary |
| Annotation foundation and manual box workflow | [[Annotation Foundation and Manual Box Workflow]] | implemented | Open the feature note for object identity, manual box CRUD, blockers, and evidence summary |
| Review workspace ergonomics | [[Review Workspace Ergonomics]] | partial | Open the feature note for missing navigation, timeline, shortcut, and panel ergonomics |
| SAM2 shell and runtime | [[SAM2 Shell and Runtime]] | partial | Open the feature note for shell-vs-runtime split, blockers, and evidence summary |
| Mask editing and cleanup | [[Mask Editing and Cleanup]] | missing | Open the feature note for edit and cleanup blockers and prerequisites |
| Export | [[Export]] | missing | Open the feature note for export blockers and prerequisites |
| Import existing boxes | [[Import Existing Boxes]] | blocked | Open the feature note for unresolved mapping blocker and import scope |

## Current Repo Summary

Repo today supports exact-frame review and saved manual box workflow most strongly. It also has a meaningful SAM2 shell. For the detailed shipped, missing, blocked, and evidence-summary truth, open the feature notes listed above.

## Source-of-Truth Feature Notes

- [[Video Ingest and Exact-Frame Review]]
- [[Annotation Foundation and Manual Box Workflow]]
- [[Review Workspace Ergonomics]]
- [[SAM2 Shell and Runtime]]
- [[Mask Editing and Cleanup]]
- [[Export]]
- [[Import Existing Boxes]]

## Observations
- [status] Repo strongest path is exact-frame review plus persisted manual box CRUD #review #manual-box
- [status] Detailed behavior, evidence summaries, blockers, and linked tasks now live in feature notes under `basic-memory/features/` #features #source-of-truth
- [gap] Real SAM2 runtime remains incomplete behind current adapter boundary #sam2 #runtime
- [gap] Review workspace ergonomics stay partial: no timeline markers, no annotated-frame jumps, no keyframe jumps, no shortcuts, no opacity control #frontend #ux
- [gap] Manual mask refinement and cleanup are not implemented #masks #editing
- [gap] Export is not implemented beyond prerequisite on-disk mask layout and persisted annotation state #export
- [gap] Import is blocked by unresolved pipeline field mapping #import #contract
- [retrieval] Use this note for repo current state overview, shipped baseline by area, or feature-note map queries #status #snapshot

## Relations
- relates_to [[Features Index]]
- relates_to [[Video Ingest and Exact-Frame Review]]
- relates_to [[Annotation Foundation and Manual Box Workflow]]
- relates_to [[Review Workspace Ergonomics]]
- relates_to [[SAM2 Shell and Runtime]]
- relates_to [[Mask Editing and Cleanup]]
- relates_to [[Export]]
- relates_to [[Import Existing Boxes]]
