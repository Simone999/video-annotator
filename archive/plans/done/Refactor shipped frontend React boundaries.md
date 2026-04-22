---
title: Refactor shipped frontend React boundaries
type: plan
permalink: video-annotator/plans/done/refactor-shipped-frontend-react-boundaries
status: done
tags:
- plan
- frontend
- react
- refactor
---

# Refactor shipped frontend React boundaries

Refactor shipped frontend route code to better follow repo React guidance without changing route behavior or backend contracts.

## Summary
- Goal: split shipped route code by responsibility, keep route pages thin, and reduce logic concentration in live review.
- Success criteria: library route load logic moves behind a hook, live review screen becomes composition-oriented, workspace logic splits into focused hooks, current tests still prove shipped behavior.
- Audience: agents or engineers continuing shipped frontend cleanup.

## Current State
- Existing behavior: `/` and `/review/:videoId` work today and already prove route ownership.
- Main gaps: `LiveReviewScreen` owns too much local state, effects, handlers, and JSX; `useVideoReviewWorkspace` owns too many concerns; `VideoLibraryRoutePage` still owns async load logic; `VideoLibraryScreen` is broad.
- Constraints: keep single-stage review, backend frame index canonical, and current backend contracts unchanged.

## Assumptions And Open Questions
- Locked assumptions: shipped route code first; fixture-only `ui-shell` cleanup is follow-up, not part of this execution pass.
- Open questions: none for current pass.

## Affected Features
- [[Review Workspace Ergonomics]]
- [[Video Ingest and Exact-Frame Review]]

## Task Breakdown
1. [[Split shipped frontend React boundaries]] — implements shipped route refactor and verification.

## Handoff Notes
- Read `AGENTS.md`, `[[Workflow]]`, and `[[React best practices]]` first.
- Keep route behavior, user-visible labels, and backend contracts stable.
- Prefer extraction over redesign; no new feature scope in this pass.

## Outcome
- Completed on 2026-04-21.
- `video-library` route page now delegates data load and default selection to `frontend/src/features/video-library/hooks/use-video-library-route-data.ts`.
- `LiveReviewScreen` now delegates behavior to `frontend/src/features/video-review/hooks/use-live-review-controller.ts` and renders section components for left rail, review surface, transport controls, and inspector.
- `frontend/src/features/video-review/workspace.ts` now composes focused hooks for indexed videos, selection, exact-frame load, and SAM2 workspace behavior without changing exported workspace API.

## Relations
- indexed_by [[Done Plans Index]]
- relates_to [[Workflow]]
- relates_to [[Review Workspace Ergonomics]]
- relates_to [[Video Ingest and Exact-Frame Review]]
