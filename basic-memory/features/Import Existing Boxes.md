---
title: Import Existing Boxes
type: note
permalink: video-annotator/features/import-existing-boxes
tags:
- feature
- import
- boxes
- blocked
---

# Import Existing Boxes

This feature owns importing existing box annotations from the current pipeline format into the app's durable object and frame-annotation model.

## Summary

- Goal: translate current-pipeline box data into stable objects and frame annotations without guessing field meaning
- Primary users: reviewers migrating existing box work into the local review tool
- Owning task note: [[Define current-pipeline import contract]]

## Scope

- In scope:
  - documented current-pipeline field mapping
  - importer route or service
  - deterministic translation into `ObjectTrack` and `FrameAnnotation` state
  - user-visible import entry in normal review workflow once backend contract exists
- Out of scope:
  - export
  - external-tool adapters beyond the current pipeline format

## Current State

- Shipped behavior: product scope still includes import existing boxes, and annotation foundation already provides stable object and frame-annotation primitives that imported data could target later.
- Known gaps: the current-pipeline field mapping is unresolved, and no import route, service, or UI exists yet.
- Current blockers: unresolved pipeline field mapping blocks implementation.

## Target Behavior

- Import contract is written down first and becomes durable memory.
- Import path translates pipeline rows into stable object identity and canonical frame annotations without inventing semantics.
- User can trigger import from normal review workflow without leaving app-local review flow, even if final placement is still undecided.
- Imported data can be reloaded and reviewed through the same normal read paths as native manual data.

## Contracts and Dependencies

- Backend contracts:
  - future import route or importer service
  - deterministic translation into existing persistence primitives
- Frontend contracts:
  - user-visible import entry is required once backend contract exists, even if exact screen placement is still open
- Data or storage contracts:
  - exact field mapping from current pipeline format must exist first
  - imported rows should use clear source semantics such as `imported`
- External dependencies:
  - [[Import Contract]]
  - annotation foundation and manual box workflow

## Evidence

- Specs:
  - [[Import Contract]]
  - [[Product Requirements]]
  - [[Delivery Plan and Risks]]
- Milestone notes:
  - [[m-6: Import Existing Boxes]]
- Code or test evidence:
  - concrete implementation and verification inventory intentionally lives in task notes and testing guidance, not in this feature note

## Linked Tasks

- [[Define current-pipeline import contract]]
- [[Implement importer translation service]]
- [[Add import API validation]]
- [[Wire import review-state transitions]]
- [[Add frontend import entry]]
- [[Review m-6 parity and drift]]

## Integration Tests

| ID | Surface | Scenario | Real-World Why | Setup/Fixtures | Automation Status | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| INT-001 | backend | Import known current-pipeline box fixture through importer route, persist stable objects plus frame annotations, then reopen imported data through normal read paths | Future backend truth must freeze mapping correctness, persistence, and reopen semantics once the field contract is durable | Real FastAPI app, temp SQLite DB, fixed current-pipeline fixture, and real manifest or annotation read paths | blocked until mapping and route exist | blocked by unresolved `[[Import Contract]]` field mapping and missing import route or service in `backend/app/api/videos.py` |
| INT-002 | frontend | Trigger import from normal review workflow, render imported objects plus frame boxes, and reload them through normal review reads | Future UI must prove import is a normal review workflow instead of hidden CLI-only plumbing | `LiveReviewScreen` or library host with `MSW` once typed client and import controls exist | blocked until mapping and UI exist | no import client in `frontend/src/features/video-review/api.ts` and no import UI in current app |

## E2E Tests

| ID | Scenario | Real-World Workflow | Environment | Automation Status | Evidence |
| --- | --- | --- | --- | --- | --- |
| E2E-001 | Import existing boxes in browser, reopen imported video, and verify imported boxes appear on canonical frames | One real cross-stack migration journey from import trigger to reviewable imported state | local stack with real frontend, FastAPI app, DB, and known pipeline fixture once import ships | blocked | unresolved `[[Import Contract]]` mapping plus missing import route and UI |

## Manual Tests

Use exact execution status values only:
- `✅ Done`
- `⚠️ Partially`
- `❌ Not Done`

| ID | Scenario | Setup | Steps | Expected Result | Execution Status | Execution Notes |
| --- | --- | --- | --- | --- | --- | --- |
| MAN-001 | Compare imported app state against one known pipeline fixture | Run local backend and frontend dev stack after import route and import UI exist; prepare one fixed current-pipeline input with known boxes and frame numbers | Trigger import from normal review workflow, reopen imported video, inspect imported objects and boxes on expected frames, then compare against source fixture | Imported objects and frame annotations match source mapping exactly, reopen through normal read paths, and do not invent missing semantics | ❌ Not Done | Blocked because `[[Import Contract]]` field mapping is unresolved and current app has no import route or UI |

## Observations
- [status] This feature is blocked by unresolved pipeline mapping, not by lack of coding time alone.
- [guardrail] The field mapping must be resolved and written into durable memory before any importer task becomes executable.
- [workflow] V1 import is user-facing product scope, not CLI-only stretch work; exact UI placement can stay open until mapping is known #import #workflow #prd
- [retrieval] Use this note for import existing boxes, pipeline import contract, or blocked import workflow queries.

## Relations
- relates_to [[Repo Current State and Feature Matrix]]
- relates_to [[m-6: Import Existing Boxes]]
- relates_to [[Import Contract]]
- relates_to [[Data Model]]
