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
- Owning task notes: [[Testing SAM2 shell and runtime]], [[Extract frontend style foundation]], [[Migrate frontend chrome onto style system]], [[Capture no-mockup UI screenshots]], [[Load selected-object summary]], [[Render inspector summary truth]], [[Persist SAM2 confidence metadata]], [[Implement real SAM2 prompt adapter]], [[Integrate prompt runtime persistence]], [[Implement real SAM2 propagation adapter]], [[Integrate propagation job runtime persistence]], and [[Review m-3 runtime parity]]

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
- Shipped behavior: session lifecycle, prompt-box shell, propagation jobs, polling, cancel, and reopen shell exist, and fake-adapter shell trust now has backend API plus live-review frontend integration coverage. Backend persistence now carries nullable `mask_confidence` on untouched `source = "sam2"` rows, clears it on manual rewrites, exposes it on frame reads, and reuses it in selected-object summary reads without inventing values for manual or corrected rows. Live review inspector now renders backend-backed selected-object bbox, confidence, and frame or propagated or corrected counters from selected-object summary truth, while keeping null confidence or corrected values honest as `Unavailable`. Selected-object summary fetch lifecycle ships in frontend controller state with typed API parsing, current object or frame or propagation-range reloads, sync-keyed range derivation, and request-key gating so stale ready summaries do not paint or refetch with old range scopes during selection or frame changes. Shared transport footer now renders manifest markers plus selected-range controls with reviewer-facing range wording, while inspector keeps propagation actions and summary truth plus a visible selected-range label. Default `Sam2Service.prompt_box()` now lazily loads real runtime state on first prompt from `SAM2_CONFIG_PATH` plus `SAM2_CHECKPOINT_PATH`, keeps `POST /sam2/session` lightweight, persists real PNG masks, and returns explicit `503` failures when runtime config, dependencies, checkpoint, or requested device are unavailable.
- Known gaps: real runtime trust still incomplete because default `Sam2Service.propagate()` remains placeholder `NotImplementedError`, and refine path remains missing.
- Current blockers: no honest manual local-runtime proof exists while propagation runtime still stays placeholder.

## Verification Evidence
- Backend: `backend/tests/integration/api/test_sam2_shell_runtime.py` proves session create or reuse, prompt-box persistence, explicit prompt runtime-missing `503` failure, propagation job status reads, cancellation, close or reopen session flow, reopened persisted SAM2 masks, and one real-service lazy prompt-loader path at real FastAPI boundary.
- Frontend: `frontend/tests/integration/video-review/live-review-screen.test.tsx` proves live-review harness can run SAM2, poll propagation, cancel job, and reopen persisted mask overlay with mocked HTTP boundary only.
- Backend read models: `backend/tests/integration/api/test_review_summary_contracts.py`, `backend/tests/integration/api/test_annotation_foundation_manual_box.py`, and backend unit service tests now prove frame reads and selected-object summary expose persisted confidence for untouched SAM2 rows while manual rewrites clear it back to `null`.
- Manual runtime: blocked. Prompt runtime now has real adapter wiring, but default propagation path in `backend/app/services/sam2.py` still raises `NotImplementedError`, so full end-to-end runtime trust stays incomplete.
- Inspector summary truth: `frontend/tests/unit/video-review/api.test.ts` proves typed parsing for `GET /api/videos/{video_id}/objects/{object_id}/summary`, and `frontend/tests/integration/video-review/live-review-screen.test.tsx` now proves live review renders backend summary bbox, confidence, and counters, refreshes them on object or range changes, and ignores stale out-of-order summary responses.
- UI artifacts: `docs/ui/review-route-status-loading.png`, `docs/ui/review-route-status-error.png`, and `docs/ui/exact-frame-canvas.png` now give durable no-mockup references for the shared review chrome and Exact Frame Canvas state after style-system migration.

## Target Behavior
- Reviewer pauses on canonical frame, uses reviewer box as prompt, runs prompt-box, gets same-frame candidate mask, sees nullable confidence, then accepts or corrects result.
- If reviewer corrects mask, confidence clears to `null`.
- Reviewer launches bounded propagation through selected frame range, watches active progress, then sees selected-range summary for propagated and corrected frames.

## Contracts and Dependencies
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

## Integration Tests

| ID | Surface | Scenario | Real-World Why | Setup/Fixtures | Automation Status | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| INT-001 | backend | Persist fake-adapter SAM2 shell work through real routes: session create or reuse, prompt-box, propagation jobs, cancel, close or reopen, and persisted-mask reads | Freezes shell contracts that are actually shipped today without pretending real model runtime already exists | Real FastAPI app, temp SQLite DB, fake `Sam2Service`, temp mask files | automated | `backend/tests/integration/api/test_sam2_shell_runtime.py` |
| INT-002 | frontend | Live review runs SAM2, polls propagation, cancels job, and reopens persisted masks through request-boundary stubs only | Proves visible screen workflow for shipped shell controls while keeping backend runtime fake at HTTP boundary | `LiveReviewScreen` with `MSW` stubs in `frontend/tests/integration/video-review/live-review-screen.test.tsx` | automated | `frontend/tests/integration/video-review/live-review-screen.test.tsx` |

## E2E Tests

| ID | Scenario | Real-World Workflow | Environment | Automation Status | Evidence |
| --- | --- | --- | --- | --- | --- |
| E2E-001 | Draw reviewer box, run SAM2, propagate through selected range, and reopen persisted mask in a real browser | One real browser-visible workflow across frontend, FastAPI app, DB, and local SAM2 runtime | local stack with real frontend, FastAPI app, DB, and non-placeholder SAM2 runtime | blocked | prompt runtime is wired, but `backend/app/services/sam2.py` still raises `NotImplementedError` for default propagation |

## Manual Tests

Use exact execution status values only:
- `✅ Done`
- `⚠️ Partially`
- `❌ Not Done`

| ID | Scenario | Setup | Steps | Expected Result | Execution Status | Execution Notes |
| --- | --- | --- | --- | --- | --- | --- |
| MAN-001 | Run real local-runtime prompt plus propagation flow and reopen persisted mask | Run local backend and frontend dev stack with real SAM2 runtime installed and wired, open one real `/review/:videoId` route, use one indexed video with a reviewer box | Create or select object, draw reviewer box on paused canonical frame, run SAM2, start propagation through selected range, reload one affected frame | Same-frame mask appears, propagation job completes for selected range, and persisted mask reopens after reload without relying on fake adapter | ❌ Not Done | Blocked because default adapter in `backend/app/services/sam2.py` now supports prompt, but still raises `NotImplementedError` for propagation |

## Observations
- [status] SAM2 shell still leads runtime trust in current code #sam2 #status
- [confidence] Untouched SAM2 masks may carry confidence; corrected masks must clear it #confidence #sam2
- [persistence] Frame reads and selected-object summary should expose persisted confidence only when current row is untouched `source = "sam2"` #confidence #backend #api
- [summary] Propagated and corrected counts belong in selected-range summary, not ad-hoc frontend guesses #summary #api
- [rule] Prompt and propagation actions remain bound to paused canonical frame #rule #frames
- [workflow] PRD scope is reviewer-box prompt on one paused frame plus selected-range propagation, not implicit full-video SAM2 work #sam2 #workflow #prd
- [testing] Fake-adapter shell trust and real runtime trust must stay separated in notes and tests; green shell coverage is not model-runtime proof #sam2 #testing
- [ui] Inspector summary now renders backend-backed selected-object truth, and transport footer now lets reviewers scrub or marker-jump canonical frames while propagation keeps reading the same shared selected-range state #sam2 #ui #truth
- [ui] Live review inspector, surface, and transport chrome now sit on the shared frontend style system in `frontend/src/styles/`, so SAM2 shell UI no longer depends on ad-hoc per-component route styling #sam2 #ui #styles
- [fetch] Selected-object summary and propagation now share one explicit selected-range controller state with inclusive canonical frame bounds, sync-keyed boundary derivation, and request-key gating so frame jumps do not issue stale range fetches or paint stale ready summaries #summary #range #frontend
- [runtime] Default prompt runtime now lazily loads real predictor state from env-configured SAM2 assets and returns explicit `503` failures when runtime setup is unavailable #sam2 #runtime #backend
- [blocker] Manual runtime verification stays blocked until default adapter stops raising `NotImplementedError` for propagation #sam2 #runtime

## Relations
- relates_to [[Repo Current State and Feature Matrix]]
- relates_to [[m-3: Real SAM2 Runtime]]
- relates_to [[SAM2 session and job persistence contract]]
- relates_to [[SAM2 Integration]]
- relates_to [[API]]
