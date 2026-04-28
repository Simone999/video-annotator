---
title: Import Existing Boxes
type: feature
canonical: true
domain: import
aliases:
- import boxes
- import existing boxes
- pipeline import
status: draft
permalink: video-annotator/features/import-existing-boxes
tags:
- feature
- import
- boxes
- blocked
---

# Import Existing Boxes

This feature owns planned import of existing box annotations from current pipeline format into app's durable object and frame-annotation model.

## Target Behavior

- Import contract is written down first and becomes durable memory.
- Import path translates pipeline rows into stable object identity and canonical frame annotations without inventing semantics.
- User can trigger import from normal review workflow without leaving app-local review flow.
- Imported data reloads through the same read paths as native manual data.
- Current product state is still planned scope, but blocked and unshipped until contract, backend, and frontend pieces all exist.

## Contracts

- Backend contracts:
  - deterministic importer translation from current pipeline rows into existing persistence primitives
  - import API route that exposes that translation through normal app flow
- Frontend contracts:
  - user-visible import entry is required once backend contract exists
- Data or storage contracts:
  - exact field mapping from current pipeline format must exist first as durable contract truth
  - reimport overwrite or reset semantics must be explicit before importer work can claim stable behavior
  - imported rows should use clear source semantics such as `imported`

## Verification Strategy

- Durable evidence today is only prerequisite truth from annotation foundation and product scope.
- Future backend proof must freeze field mapping, overwrite or reset semantics, persistence, and reopen semantics once `[[Import Contract]]` is final.
- Future frontend and browser proof must cover a normal review-flow import, not hidden CLI-only plumbing.
- Manual proof remains blocked until durable contract truth, backend importer plus route, and frontend entry all exist.

## Observations

- [dependency] Import should reuse existing object and frame-annotation persistence primitives instead of inventing parallel storage. #import #data-model
- [status] This feature remains planned product scope, but is blocked by unresolved contract, backend, and frontend chain work rather than dropped scope. #import #prd
- [guardrail] Current-pipeline field mapping must be resolved and written into durable memory before backend importer work becomes executable. #workflow
- [guardrail] Reimport overwrite or reset semantics must be explicit before import route behavior can be considered stable. #workflow
- [dependency] Backend importer translation plus import API route are both still missing, and frontend import entry remains missing after that. #import #backend #frontend
- [workflow] V1 import remains user-facing product scope, but planned rather than shipped and not CLI-only stretch work. #import #prd
- [retrieval] Use this note for import existing boxes, pipeline import, or blocked import workflow queries. #search

## Relations

- relates_to [[Import Contract]]
- relates_to [[Data Model]]
