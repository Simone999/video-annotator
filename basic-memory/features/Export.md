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

- Goal: create deterministic machine-readable export artifacts from persisted review state
- Primary users: downstream pipeline owners and reviewers handing off finished annotation work
- Owning task note: [[Testing export]]

## Scope

- In scope:
  - export create route
  - export download route
  - deterministic `annotations.json`
  - PNG mask export tree
  - `boxes_only` mode
  - release and golden verification for export outputs
- Out of scope:
  - review editing itself
  - import

## Current State

- Shipped behavior: persisted annotation metadata and on-disk mask files already exist as export prerequisites.
- Known gaps: export API routes, export generator, export UI or client, and golden verification are all still missing.
- Current blockers: no export workflow can run until create and download paths exist.

## Target Behavior

- Reviewer can create one export package for a video and download deterministic artifacts later.
- `annotations.json` matches the documented export contract exactly.
- PNG masks are emitted under stable per-video and per-object paths.
- Export verification freezes JSON ordering, naming, and artifact checksums tightly enough for release use.

## Contracts and Dependencies

- Backend contracts:
  - future `POST /api/videos/{video_id}/export`
  - future `GET /api/exports/{export_id}`
- Frontend contracts:
  - future export trigger and download UI
- Data or storage contracts:
  - `annotations.json` format from [[Export Format]]
  - stable on-disk mask filenames and relative paths
- External dependencies:
  - persisted annotations and masks
  - local filesystem export directory

## Evidence

- Specs:
  - [[Export Format]]
  - [[API]]
  - [[Delivery Plan and Risks]]
  - [[Test Plan]]
- Milestone notes:
  - [[m-5: Export and Release Hardening]]
- Code or test evidence:
  - concrete implementation and verification inventory intentionally lives in task notes and testing guidance, not in this feature note

## Linked Tasks

- [[Testing export]]

## Integration Tests

| ID | Surface | Scenario | Real-World Why | Setup/Fixtures | Automation Status | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| INT-001 | backend | Example integration scenario | Why operator or system cares | Fixtures or stack setup | planned | Link or note |
| INT-002 | frontend | Example integration scenario | Why operator or system cares | Fixtures or stack setup | planned | Link or note |

## E2E Tests

| ID | Scenario | Real-World Workflow | Environment | Automation Status | Evidence |
| --- | --- | --- | --- | --- | --- |
| E2E-001 | Example e2e scenario | Real workflow or failure path | Local stack or fixture env | planned | Link or note |

## Manual Tests

Use exact execution status values only:
- `✅ Done`
- `⚠️ Partially`
- `❌ Not Done`

| ID | Scenario | Setup | Steps | Expected Result | Execution Status | Execution Notes |
| --- | --- | --- | --- | --- | --- | --- |
| MAN-001 | Example manual scenario | Required environment | Concrete steps | What operator should see | ❌ Not Done | Write why and what is missing |

## Observations

- [status] Export is not implemented beyond prerequisite persisted state and mask file layout.
- [dependency] Stable on-disk mask naming is already a useful prerequisite and should remain aligned with export contract.
- [release] Export verification is part of release completeness, not optional polish.
- [retrieval] Use this note for export package, deterministic annotations.json, or release export queries.

## Relations

- relates_to [[Repo Current State and Feature Matrix]]
- relates_to [[m-5: Export and Release Hardening]]
- relates_to [[Export Format]]
- relates_to [[API]]
- relates_to [[Test Plan]]
