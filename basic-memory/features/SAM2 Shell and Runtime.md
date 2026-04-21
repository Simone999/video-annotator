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
- Shipped behavior: session lifecycle, prompt-box shell, propagation jobs, polling, cancel, and reopen shell exist.
- Known gaps: real runtime trust still incomplete; refine path remains missing; new confidence and inspector-summary contracts are documented target, not shipped runtime truth yet.
- Current blockers: live runtime trust still depends on unfinished adapter behavior.

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

## Relations
- relates_to [[Repo Current State and Feature Matrix]]
- relates_to [[m-3: SAM2 Runtime and Refinement]]
- relates_to [[SAM2 session and job persistence contract]]
- relates_to [[SAM2 Integration]]
- relates_to [[API]]