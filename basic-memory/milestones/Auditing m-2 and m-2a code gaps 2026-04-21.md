---
title: Auditing m-2 and m-2a code gaps 2026-04-21
type: note
permalink: video-annotator/milestones/auditing-m-2-and-m-2a-code-gaps-2026-04-21
tags:
- milestone
- audit
- backlog
- frontend
- backend
- review
---

# Auditing m-2 and m-2a code gaps 2026-04-21

This audit compares current repo code against `[[m-2: Review Workspace Completion]]`, `[[m-2a: Mockup UI Shell]]`, `[[Review Workspace Ergonomics]]`, and `[[Frontend Interaction Spec]]`.

Scope checked:
- `frontend/src/app/App.tsx`
- `frontend/src/features/ui-shell/*`
- `frontend/src/app/live-review-app.tsx`
- `frontend/src/features/video-review/*`
- `backend/app/api/videos.py`
- `backend/app/schemas/video.py`

## What Is Good

- `m-2a` landed cleanly. `frontend/src/app/App.tsx` defaults to shell host, `frontend/src/features/ui-shell/loader.ts` keeps shell data isolated, and `frontend/src/features/ui-shell/shell-host.tsx` owns page and selected-object state without router coupling.
- Fixture shell proof is durable. `frontend/src/app/App.test.tsx` and `frontend/src/features/ui-shell/shell-host.test.tsx` cover library render, review render, object switching, and local navigation.
- Live review foundations are real even though UX is behind spec. `frontend/src/features/video-review/workspace.ts` already loads indexed videos, manifests, exact frames, manual annotations, and SAM2 jobs through typed API boundaries.
- Backend already exposes reusable frame-navigation inputs. `backend/app/api/videos.py` and `backend/app/schemas/video.py` return `annotated_frames` and `keyframes` in the manifest, which is enough to drive useful-frame landing and frame-jump controls without inventing another source of truth.

## What Is Missing

- Live library state is still missing from default app path. `frontend/src/features/ui-shell/loader.ts` always clones static fixtures, so default app still cannot open real indexed videos or show honest derived review state.
- Backend summary contracts are too thin for target library and inspector UX. `backend/app/schemas/video.py` exposes raw video metadata and manifest basics, but not derived library-card status, last-reviewed frame, review detail line, or selected-range inspector counters.
- Live review surface still does not match single-stage target. `frontend/src/app/live-review-app.tsx` renders separate `Playback pane` and `Exact-frame pane` sections instead of one review stage with transport, timeline, and inspector around it.
- `m-2` review controls are still absent. Current live path has frame number entry and +/- frame stepping, but no useful default frame landing, no annotated-frame or keyframe jumps, no keyboard shortcuts, and no mask-opacity control.

## What Is Wrong

- Default app host can be mistaken for live product progress even though it is fixture-only. `frontend/src/app/App.tsx` opens shell by default, but shell loader never crosses backend boundary, so running app normally does not prove current repo can satisfy `m-2` reviewer workflow.
- Current live review harness keeps old two-pane mental model alive. Extending `frontend/src/app/live-review-app.tsx` as-is would push more effort into a layout that contradicts `[[Frontend Interaction Spec]]`.
- Fixture shell currently shows states such as `exported` from hardcoded data. That is correct for mockup proof, but wrong as runtime truth until backend-derived state replaces fixtures on live path.

## What Should Improve

1. `[[Ship review summary contracts]]` should add backend-derived library and inspector summary payloads first, because live shell and live review both need honest persisted facts.
2. `[[Wire live library shell]]` should replace default shell fixtures with backend-backed loading while preserving current shell-host boundaries.
3. `[[Build live single-stage review]]` should migrate real workspace behavior into one review surface instead of growing the split-pane harness.
4. `[[Add review navigation controls]]` should finish `m-2` ergonomics by reusing manifest frame lists for useful landing, jumps, keyboard controls, and mask opacity.

## Chosen Follow-Up Tasks

- [[Ship review summary contracts]]
- [[Wire live library shell]]
- [[Build live single-stage review]]
- [[Add review navigation controls]]

## Observations

- [status] `m-2a` shell boundaries are healthy: default host, shell loader, and shell host are separated cleanly. #frontend #shell
- [gap] Default app still boots static fixtures first, so `m-2` live review ergonomics remain unshipped on normal app path. #frontend #gap
- [gap] Backend video schemas do not yet expose derived library or inspector summaries needed by current product spec. #backend #api #gap
- [gap] Live review UI still uses split playback plus exact-frame panes instead of one single-stage review surface. #frontend #ux #gap
- [technique] Reuse manifest `annotated_frames` and `keyframes` before adding new frame-navigation contracts. #backend #frontend #frames
- [plan] Follow-up work now splits into summary contracts, live library wiring, single-stage live review, and review controls. #backlog #tasks

## Relations

- relates_to [[m-2: Review Workspace Completion]]
- relates_to [[m-2a: Mockup UI Shell]]
- relates_to [[Review Workspace Ergonomics]]
- relates_to [[Frontend Interaction Spec]]
- relates_to [[Repo Current State and Feature Matrix]]
- implements [[Review m-2 and m-2a code and grow backlog]]
- relates_to [[Ship review summary contracts]]
- relates_to [[Wire live library shell]]
- relates_to [[Build live single-stage review]]
- relates_to [[Add review navigation controls]]
