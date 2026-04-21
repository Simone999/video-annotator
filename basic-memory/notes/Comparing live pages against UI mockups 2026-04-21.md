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

Compared current local app pages against the shipped mockup PNGs. Mockup assets are under `docs/ui/`, not `data/ui/`.

## Setup
- Mockups inspected: `docs/ui/video-library-mockup.png` and `docs/ui/video-annotation-mockup.png`
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
- Review page is not visually comparable to the mockup in current local state:
  - opening review routes into `LiveReviewApp`, not the older mockup shell
  - live page lands on an empty chooser layout instead of the populated annotation workspace shown in the mockup
  - selecting a video still fails to load manifest-backed review state because `GET /api/videos/{video_id}/manifest` returns `500 Internal Server Error`
  - backend error comes from object-track validation expecting string `id` and string `color`, while current DB data provides integer `id` and `null` `color`

## Evidence links
- Library shell source: `frontend/src/features/ui-shell/library-page.tsx`
- Library live-data shaping: `frontend/src/features/ui-shell/loader.ts`
- Review host handoff: `frontend/src/features/ui-shell/shell-host.tsx`
- Live review layout: `frontend/src/app/live-review-app.tsx`
- Failing manifest route: `backend/app/api/videos.py`

## Observations
- [audit] Current live library shell stays in mockup direction but drifts in icon delivery, typography scale, summary-strip shape, preview imagery, and path copy. #ui #mockup #library
- [bug] Current local live review cannot reach a mockup-comparable loaded state because `/api/videos/{video_id}/manifest` throws `500 Internal Server Error` against repo default DB contents. #live-review #manifest #Internal Server Error
- [data-shape] Manifest bootstrap currently assumes object-track fields already satisfy `ObjectTrackSummary`, but repo DB can still contain integer ids and null colors. #backend #validation #data-shape

## Relations
- relates_to [[Review Workspace Ergonomics]]
- relates_to [[Repo Current State and Feature Matrix]]
- relates_to [[2026-04-21 - follow mockup-first single-stage review UI]]