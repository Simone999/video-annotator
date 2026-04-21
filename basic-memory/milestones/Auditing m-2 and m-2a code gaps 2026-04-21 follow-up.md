---
title: Auditing m-2 and m-2a code gaps 2026-04-21 follow-up
type: note
permalink: video-annotator/milestones/auditing-m-2-and-m-2a-code-gaps-2026-04-21-follow-up
tags:
- milestone
- audit
- backlog
- frontend
- review
---

# Auditing m-2 and m-2a code gaps 2026-04-21 follow-up

This follow-up audit compares current repo code against `[[m-2: Review Workspace Completion]]`, `[[m-2a: Mockup UI Shell]]`, `[[Review Workspace Ergonomics]]`, and `[[Frontend Interaction Spec]]` after the first runtime-fix loop landed.

Scope checked:
- `frontend/src/app/App.tsx`
- `frontend/src/app/live-review-app.tsx`
- `frontend/src/features/ui-shell/*`
- `frontend/src/features/video-review/api.ts`
- `frontend/src/features/video-review/workspace.ts`
- `backend/app/api/videos.py`
- `backend/app/schemas/video.py`
- `backend/app/services/review_summaries.py`

## What Is Good

- `m-2a` shell boundaries still hold. `frontend/src/app/App.tsx` keeps default-host routing isolated, `frontend/src/features/ui-shell/loader.ts` owns live library shaping, and `shell-host` still keeps shell page state local.
- First runtime loop landed real movement. Default host now loads backend-backed library summaries, and live review uses one single-stage surface instead of the old split playback-plus-exact-frame split.
- Review-navigation ergonomics are materially better. Useful landing, annotated or keyframe jumps, paused-only keyboard shortcuts, and local mask-opacity control are real and covered by live frontend integration plus browser smoke.
- Backend summary read model is now the right seam. `backend/app/services/review_summaries.py` owns derived library state and selected-object summary facts instead of pushing partial truth into frontend guesses.

## What Is Missing

- Live frontend still does not call the selected-object summary route. `frontend/src/features/video-review/api.ts` has no client for `GET /api/videos/{video_id}/objects/{object_id}/summary`, `workspace.ts` never loads it, and `live-review-app.tsx` therefore never shows `track_summary.frames`, `track_summary.propagated`, `track_summary.corrected`, or `mask_confidence`.
- Live review still has no selected-range UI. The interaction spec calls for bottom-bar transport plus timeline or thumbnails and range controls, but `live-review-app.tsx` only renders numeric frame loading, step buttons, and frame-jump buttons.

## What Is Wrong

- Raw frame-number entry is still the primary transport control on the live review surface. That contradicts the milestone goal to let reviewers work without raw frame-number entry for core actions.
- The live inspector and object rail still lean on technical ids instead of reviewer-first summary. `live-review-app.tsx` shows `Object id` and object-id chips, but it does not yet replace that emphasis with the shipped selected-object summary contract.

## What Should Improve

1. `[[Add live review timeline and selected range controls]]` should add reviewer-visible timeline and range controls on the live surface, reuse manifest annotated or keyframe markers, and demote raw frame-number entry to non-primary fallback UI.
2. `[[Wire live selected-object summary]]` should add typed frontend client support for the selected-object summary route, fetch summary data from local range plus current-frame state, and render bbox or confidence or selected-range counters in the live inspector.

## Not Chosen In This Audit

- Export truth still stays blocked. Backend summary derivation correctly avoids `exported` without persisted export facts, and no new export task was created here because `[[Export]]` already owns that unshipped feature area.
- `mask_confidence` and `track_summary.corrected` remain honestly nullable until storage can prove them. This follow-up still chooses frontend wiring first because current live UI does not render the route at all.

## Chosen Follow-Up Tasks

- [[Add live review timeline and selected range controls]]
- [[Wire live selected-object summary]]

## Observations

- [status] `m-2a` default-host shell boundaries remain healthy after runtime work landed. #frontend #shell
- [gap] Live review has backend selected-object summary contract but no frontend client or rendering for it yet. #frontend #inspector #api
- [gap] Live review still lacks timeline and selected-range controls, so raw numeric frame entry remains the primary transport affordance. #frontend #ux #navigation
- [guardrail] Existing export state remains blocked on persisted export facts and should stay out of this follow-up backlog split. #export #truth
- [plan] Next review loop should focus on timeline-first transport and frontend summary wiring before reopening another audit cycle. #backlog #tasks

## Relations

- relates_to [[m-2: Review Workspace Completion]]
- relates_to [[m-2a: Mockup UI Shell]]
- relates_to [[Review Workspace Ergonomics]]
- relates_to [[Frontend Interaction Spec]]
- relates_to [[Auditing m-2 and m-2a code gaps 2026-04-21]]
- implements [[Re-review m-2 and m-2a code and grow backlog]]
- relates_to [[Add live review timeline and selected range controls]]
- relates_to [[Wire live selected-object summary]]
