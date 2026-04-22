---
title: Comparing live pages against UI mockups 2026-04-21
type: note
permalink: video-annotator/notes/comparing-live-pages-against-ui-mockups-2026-04-21
tags:
- ui
- mockup
- visual-audit
- library
- live-review
- manifest
- Internal Server Error
---

# Comparing live pages against UI mockups 2026-04-21

Historical audit captured before route-owned library and review cleanup finished. Mockup assets are under `docs/ui/`, not `data/ui/`. The old ergonomics feature note was later deleted, so current shipped truth is now split across `frontend/src/features/video-library/`, `frontend/src/features/video-review/`, [[Video Ingest and Exact-Frame Review]], and [[SAM2 Shell and Runtime]].

## Setup
- Mockups inspected: `docs/ui/video-library.png` and `docs/ui/video-review.png`
- Actual pages captured from local dev stack at `http://127.0.0.1:5173`
- Backend source during audit: repo default `data/video_annotator.db`
- Artifacts: `/tmp/video-library-actual.png`, `/tmp/video-review-actual.png`, `/tmp/video-review-loaded-actual.png`

## Findings
- Library page is structurally related to the mockup, but it drifted in several visible ways:
  - top bar and page heading render larger and looser than the mockup
  - Material Symbols fall back to literal icon names such as `search`, `settings`, and `expand_more` during local render, so chrome does not match mockup iconography
  - summary strip now renders five metrics because live loader adds `Ready for Review`; mockup PNG shows four summary blocks
  - cards use generated preview placeholders rather than photographic or frame-like imagery from the mockup
  - card context line uses full local directory paths, which reads more like debug data than UI chrome
  - live data makes the screen feel sparser than the mockup because only three videos exist in local DB and none are `in_progress`
- At audit time, review page was not visually comparable to the mockup:
  - review routing still entered the old app-owned live review seam instead of the later feature-owned page
  - live page still landed on chooser-first bootstrap instead of the later single-stage review workspace
  - one local DB state produced `GET /api/videos/{video_id}/manifest` `500 Internal Server Error`
  - that backend error came from object-track validation expecting string `id` and string `color`, while audit DB data provided integer `id` and `null` `color`

## Evidence links
- Historical library shell source during audit: `frontend/src/features/ui-shell/library-page.tsx`
- Historical library live-data shaping during audit: `frontend/src/features/ui-shell/loader.ts`
- Historical review host handoff during audit: `frontend/src/features/ui-shell/shell-host.tsx`
- Current live review layout owner: `frontend/src/features/video-review/components/live-review-screen.tsx`
- Failing manifest route: `backend/app/api/videos.py`

## Observations
- [audit] This note captures the 2026-04-21 pre-cleanup visual gap audit, not current route-owned runtime truth. #ui #mockup #history
- [bug] Audit-time local review could not reach a mockup-comparable loaded state because one repo DB state made `/api/videos/{video_id}/manifest` throw `500 Internal Server Error`. #live-review #manifest #Internal Server Error #history
- [data-shape] Audit-time manifest bootstrap assumed object-track fields already satisfied `ObjectTrackSummary`, but the inspected DB still contained integer ids and null colors. #backend #validation #data-shape #history

## Relations
- relates_to [[Video Ingest and Exact-Frame Review]]
- relates_to [[SAM2 Shell and Runtime]]
- relates_to [[Repo Current State and Feature Matrix]]
- relates_to [[2026-04-21 - follow mockup-first single-stage review UI]]
