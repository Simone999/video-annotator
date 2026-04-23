---
title: Persist export records plan
type: plan
status: done
permalink: video-annotator/plans/persist-export-records-plan
tags:
- plan
- backend
- export
- data-model
- m-5
---

# Persist export records plan

Persist one export-record truth slice so backend can tell fresh exported state from stale ready state without shipping artifact routes or UI yet.

## Summary
- Goal: add backend export-record storage and review-state derivation for `US-037`.
- Success criteria: latest export flips ready videos to `exported`, later review edits make that export stale, and tests prove both transitions.
- Audience: agent or engineer implementing export backend groundwork on `ralph/ui`.

## Current State
- `review_state` schema already allows `exported`, but derivation never emits it.
- No export persistence exists in DB or migrations.
- Library and manifest responses already read one shared review-summary service, so one backend derivation change can cover both.

## Locked Decisions
- Export freshness will compare the latest export snapshot against current persisted review-output freshness, not artifact file mtimes.
- This slice stays backend-only. No export route, file generation, or frontend work.
- Active propagation still wins over exported state.

## Task Breakdown
1. [[Persist export records]] — add DB table, migration, review-summary derivation, tests, and tracker updates.

## Handoff Notes
- Read first: `AGENTS.md`, `[[Workflow]]`, `[[Export]]`, `[[Export API]]`, `[[Data Model]]`, `docs/spec.md`, `backend/app/db/models.py`, `backend/app/services/review_summaries.py`, and `backend/tests/integration/api/test_review_summary_contracts.py`.
- Red tests first:
  - unit coverage for exported vs stale derivation
  - integration coverage for list/detail review-state flip to exported and back to ready after later edit
  - migration or prepare path only if schema work needs direct proof
- Keep implementation surgical: one export-record model, one migration, one derivation path, no route shell yet.
