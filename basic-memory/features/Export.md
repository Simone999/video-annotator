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
- Shipped behavior: persisted annotation metadata and on-disk mask files exist as prerequisites.
- Known gaps: export API routes, generator, library export-state derivation, and download UI are still missing.
- Current blockers: no export workflow can run until create and download paths exist.

## Target Behavior
- Reviewer exports deterministic artifacts after review.
- Video library can show `exported` only when latest export matches current persisted review state.
- Export state is separate from propagation progress and should not reuse progress-bar semantics.

## Observations
- [status] Export remains missing beyond prerequisites #export #status
- [library] `exported` is library state, not propagation state #library #export
- [rule] Export state must not reuse propagation progress bar semantics #progress #export

## Relations
- relates_to [[Repo Current State and Feature Matrix]]
- relates_to [[m-5: Export and Release Hardening]]
- relates_to [[Export Format]]
- relates_to [[API]]
- relates_to [[Test Plan]]