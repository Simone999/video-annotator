---
title: SAM2 Shell and Runtime
type: feature
canonical: true
domain: sam2
aliases:
- sam2 runtime
- propagation runtime
- mask confidence
status: active
permalink: video-annotator/features/sam2-shell-and-runtime
tags:
- feature
- sam2
- runtime
- propagation
---

# SAM2 Shell and Runtime

This feature owns SAM2 session lifecycle, same-frame prompt behavior, propagation jobs, and runtime truth behind those UI controls.

## Target Behavior

- Reviewer pauses on canonical frame, uses reviewer box as prompt, runs prompt-box, gets same-frame candidate mask, and sees nullable confidence.
- Corrected masks clear confidence back to `null`.
- Reviewer launches bounded propagation through the selected frame range and sees progress plus selected-range summary truth.

## Contracts

- Backend contracts:
  - session lifecycle routes
  - prompt-box route
  - propagation route and job routes
  - selected-object summary route
- Frontend contracts:
  - prompt-box consumes reviewer box on paused canonical frame
  - propagation scope comes from selected frame range, not implicit whole-video default
  - prompt and propagation stay paused-only actions on canonical frame
  - active progress UI means propagation completion only
  - corrected masks clear confidence display

## Verification Strategy

- Durable backend evidence:
  - `backend/tests/integration/api/test_sam2_shell_runtime.py`
  - `backend/tests/unit/services/test_sam2.py`
  - `backend/tests/integration/api/test_review_summary_contracts.py`
- Durable frontend evidence:
  - `frontend/tests/integration/video-review/live-review-screen.test.tsx`
  - `frontend/tests/unit/video-review/use-sam2-workspace.test.tsx`
  - `frontend/tests/unit/video-review/api.test.ts`
- Real-runtime browser proof depends on local SAM2 assets being configured. Concrete local failures belong in archive notes, not as durable blocker state here.

## Observations

- [status] Session, prompt, propagation, persisted masks, confidence, and selected-range summary contracts ship on the review path. #sam2 #status
- [confidence] Untouched SAM2 masks may carry confidence; corrected masks must clear it. #confidence #sam2
- [persistence] Frame reads and selected-object summary should expose persisted confidence only when current row is untouched `source = "sam2"`. #backend #api
- [summary] Propagated and corrected counts belong in selected-range summary, not ad-hoc frontend guesses. #summary #api
- [proof] Real-runtime browser proof depends on local SAM2 assets; archive notes should record any concrete environment block. #sam2 #workflow
- [retrieval] Use this note for prompt-box, propagation, mask confidence, or selected-range summary queries. #search

## Relations

- relates_to [[SAM2 Integration]]
- relates_to [[API]]
