---
title: 'm-3: SAM2 Runtime and Refinement'
type: note
permalink: video-annotator/milestones/m-3-sam2-runtime-and-refinement
tags:
- milestone
- roadmap
- sam2
- refinement
---

# m-3: SAM2 Runtime and Refinement

This milestone makes SAM2 real. Some shell pieces already shipped early, but live runtime behavior is still incomplete.

## Status
Partial.

## Goal
Same-frame prompt, same-frame refine, and range propagation run against the real SAM2 runtime and persist accepted results on canonical backend frames.

## Current Code Already Has
- Backend persists `Sam2Session`, `Job`, and SAM2-produced `FrameAnnotation` rows.
- Backend exposes session lifecycle, prompt-box, propagation, job status, and job cancel routes.
- Frontend exposes `Run SAM2`, propagation controls, polling, cancel, and reopen of persisted propagated masks.
- Test coverage exists for session lifecycle, prompt-box contract, propagation jobs, and frontend polling state.

## Missing
- Real runtime implementation behind `Sam2Service`.
- Same-frame refine-mask API and frontend flow.
- Incremental runtime status feed beyond simple polling.
- Clear live error handling for missing model, GPU issues, out-of-memory, decode failure, and cancelled work.

## Acceptance Gate
- `Sam2Service.prompt_box()` and `Sam2Service.propagate()` do real runtime work instead of raising `NotImplementedError`.
- `POST /api/videos/{video_id}/sam2/refine-mask` exists and returns refined same-frame result.
- Prompt, refine, and propagate persist results on canonical backend frame indices.
- Frontend shows prompt, refine, propagation, and runtime failure states clearly.

## Evidence
- `backend/app/services/sam2.py` defines placeholder adapter methods that raise `NotImplementedError` for prompt and propagation.
- API tests use fake adapter injection, which proves contract shape but not live runtime behavior.
- Frontend `frontend/src/features/video-review/api.ts`, `state.ts`, and `workspace.ts` have no refine-mask flow yet.

## Dumb Subagent Check
One context-poor subagent can implement one m-3 task if it reads `[[SAM2 Integration]]`, `[[API]]`, `[[Data Model]]`, `[[Architecture]]`, `[[Test Plan]]`, and this note first. Do not combine runtime adapter wiring, refine API, and streaming updates into one task.

## Observations
- [status] m-3 is partial because storage and UI shell landed before live runtime did.
- [dependency] m-3 should not be treated as done while `NotImplementedError` still blocks live prompt or propagation.
- [guardrail] m-3 tasks must separate runtime adapter work, refine API work, and frontend integration work.

## Relations
- part_of [[Milestones Index]]
- depends_on [[m-1: Annotation Foundation]]
- depends_on [[SAM2 Integration]]
- depends_on [[API]]
- depends_on [[Data Model]]
- depends_on [[Architecture]]
- depends_on [[Test Plan]]
- relates_to [[Task Breakdown Guide]]
