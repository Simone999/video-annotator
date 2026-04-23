---
title: Define corrected-mask contract plan
type: plan
status: active
permalink: video-annotator/plans/define-corrected-mask-contract-plan
tags:
- plan
- backend
- sam2
- masks
- m-4
---

# Define corrected-mask contract plan

Freeze corrected-mask persistence, selected-summary reset, and refine-route contract before m-4 backend or frontend work starts.

## Summary
- Goal: define one reusable corrected-mask contract for storage, summary reads, and planned refine route so later m-4 tasks do not guess semantics.
- Success criteria: durable notes and supporting docs name corrected source semantics, selected-object summary reset rules, and refine-route shape; backend tests lock summary behavior around corrected rows.
- Audience: engineers implementing m-4 backend refine and frontend brush-edit work.

## Current State
- Existing behavior: `FrameAnnotation.source` already allows `sam2_edited` in docs and summary helpers, but shipped backend summary still returns `track_summary.corrected = null` and no note defines when to write `sam2_edited`.
- Main gaps: no explicit rule for when corrected rows use `sam2_edited`, whether corrected keyframes count toward `track_summary.corrected`, or what `POST /api/videos/{video_id}/sam2/refine-mask` should accept and return.
- Constraints: backend-decoded frame index stays canonical; corrected rows must keep `mask_confidence = null`; this task must not implement full refine backend or brush UI.

## Assumptions And Open Questions
- Locked assumptions:
  - corrected mask persistence will reuse `FrameAnnotation.source = "sam2_edited"` instead of inventing a new field.
  - only corrected propagated rows count toward `track_summary.corrected`, so corrected keyframes do not increment that counter.
  - refine route can stay same-frame and return the same persisted annotation shape as prompt-box follow-up work.
- Open questions:
  - none current

## Affected Features
- [[Mask Editing and Cleanup]]
- [[SAM2 Shell and Runtime]]

## Task Breakdown
1. [[Define corrected-mask contract]] — locks durable contract, supporting docs, and backend summary behavior for corrected rows.
2. [[Implement refine-mask backend]] — uses this contract to ship persisted refine route behavior without re-deriving storage rules.
3. [[Build paused mask refine UI]] — consumes refine-route and summary contract from review surface controls.

## Handoff Notes
- Read first: `AGENTS.md`, `[[Workflow]]`, `[[Mask Editing and Cleanup]]`, `[[SAM2 Shell and Runtime]]`, `[[SAM2 API]]`, `[[Data Model]]`, `docs/spec.md`, `backend/app/services/review_summaries.py`, and `backend/tests/integration/api/test_review_summary_contracts.py`.
- Write red tests before backend summary changes.
- Do not invent cleanup-route semantics here; leave one-frame and whole-object cleanup for later m-4 tasks.
- Keep docs explicit that corrected rows clear confidence, preserve reopen behavior, and count in summary only when they replace a propagated non-keyframe row.
