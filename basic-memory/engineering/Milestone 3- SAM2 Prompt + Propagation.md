---
title: 'Milestone 3: SAM2 Prompt + Propagation'
type: note
permalink: video-annotator/engineering/milestone-3-sam2-prompt-propagation
tags:
- milestone-3
- sam2
- propagation
- review
---

# Milestone 3: SAM2 Prompt + Propagation

This hub is derived from `docs/plans/milestone-03-sam2.md` and the surviving SAM2 engineering notes.

## Goal

Use SAM2 to create an initial mask from a box prompt and propagate that mask across a selected frame range without losing persisted state.

## Scope

The milestone covers session creation or reuse, same-frame prompt results, mask persistence, forward and backward propagation, progress reporting, cancellation, and reopening persisted masks through the exact-frame review flow.

## Constraints

The backend-decoded frame index stays canonical. SAM2 remains behind a dedicated service adapter. Session and job state stay persisted separately from UI state, and propagation must remain deterministic across reloads.

## Acceptance

A user can draw a box on frame `N`, run SAM2, see a mask on frame `N`, propagate across `K` frames, and later reopen any affected frame to inspect the persisted mask overlay.

## Validation

The milestone needs integration coverage for session creation, prompt-box flow, and propagation job lifecycle. Live browser validation should exercise the same flow on a real local video, not just intercepted API responses.

## Observations
- [goal] Deliver the prompt-and-propagate flow as a single milestone with persisted session and job state #sam2 #milestone-3
- [scope] Keep the work limited to session reuse, prompt-box masking, propagation, progress, cancellation, and persisted reopen behavior #sam2 #scope
- [constraint] Never treat browser playback position as annotation truth; backend frame indices remain canonical #backend #frames
- [constraint] Keep SAM2 isolated behind a service adapter so predictor internals do not leak into persistence or UI state #backend #architecture
- [acceptance] A successful run must produce a same-frame mask and then propagate that mask over the chosen range #sam2 #acceptance
- [validation] Integration tests should cover session creation, prompt-box submission, and propagation job lifecycle #testing

## Relations
- relates_to [[SAM2 session and job persistence contract]]
- relates_to [[Exact-frame pane scroll anchoring fix]]