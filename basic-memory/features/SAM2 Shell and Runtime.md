---
title: SAM2 Shell and Runtime
type: note
permalink: video-annotator/features/sam2-shell-and-runtime
tags:
- feature
- sam2
- runtime
- propagation
---

# SAM2 Shell and Runtime

This feature owns SAM2 session lifecycle, same-frame prompt behavior, propagation jobs, and runtime truth behind those UI controls.

## Summary
- Goal: let reviewer use SAM2 on canonical backend frames inside single-stage review screen.
- Primary users: reviewers who want same-frame mask generation and bounded propagation.
- Owning task note: [[Testing SAM2 shell and runtime]]

## Scope
- In scope:
  - session create, reuse, close
  - prompt-box request path on one frame
  - propagation job start, poll, cancel, reopen
  - mask confidence on untouched SAM2 results
  - corrected-mask confidence reset rule
- Out of scope:
  - manual brush editing details
  - export packaging
  - import

## Current State
- Shipped behavior: session lifecycle, prompt-box shell, propagation jobs, polling, cancel, and reopen shell exist, and fake-adapter shell trust now has backend API plus live-review frontend integration coverage.
- Known gaps: real runtime trust still incomplete because default `Sam2Service.prompt_box()` and `Sam2Service.propagate()` remain placeholder `NotImplementedError` paths; refine path remains missing; new confidence and inspector-summary contracts are documented target, not shipped runtime truth yet.
- Current blockers: no honest manual local-runtime proof exists while default adapter stays placeholder.

## Verification Evidence
- Backend: `backend/tests/api/test_sam2_shell_runtime.py` proves session create or reuse, prompt-box persistence, propagation job status reads, cancellation, close or reopen session flow, and reopened persisted SAM2 masks at real FastAPI boundary with fake adapter only.
- Frontend: `frontend/src/app/live-review-app.test.tsx` proves live-review harness can run SAM2, poll propagation, cancel job, and reopen persisted mask overlay with mocked HTTP boundary only.
- Manual runtime: blocked. Default adapter in `backend/app/services/sam2.py` still raises `NotImplementedError` for prompt and propagation, so this feature has shell trust only, not real model-runtime trust.

## Target Behavior
- Reviewer pauses on canonical frame, runs prompt-box, gets same-frame candidate mask, sees nullable confidence, then accepts or corrects result.
- If reviewer corrects mask, confidence clears to `null`.
- Reviewer launches bounded propagation, watches active progress, then sees selected-range summary for propagated and corrected frames.

## Contracts and Dependencies
- Backend contracts:
  - session lifecycle routes
  - prompt-box route
  - propagation route and job routes
  - selected-object summary route
- Frontend contracts:
  - prompt and propagation stay paused-only actions on canonical frame
  - active progress UI means propagation completion only
  - corrected masks clear confidence display

## Observations
- [status] SAM2 shell still leads runtime trust in current code #sam2 #status
- [confidence] Untouched SAM2 masks may carry confidence; corrected masks must clear it #confidence #sam2
- [summary] Propagated and corrected counts belong in selected-range summary, not ad-hoc frontend guesses #summary #api
- [rule] Prompt and propagation actions remain bound to paused canonical frame #rule #frames
- [testing] Fake-adapter shell trust and real runtime trust must stay separated in notes and tests; green shell coverage is not model-runtime proof #sam2 #testing
- [blocker] Manual runtime verification stays blocked until default adapter stops raising `NotImplementedError` for prompt and propagation #sam2 #runtime

## Relations
- relates_to [[Repo Current State and Feature Matrix]]
- relates_to [[m-3: SAM2 Runtime and Refinement]]
- relates_to [[SAM2 session and job persistence contract]]
- relates_to [[SAM2 Integration]]
- relates_to [[API]]
