---
title: US-007 playback pane and metadata panel patterns
type: note
permalink: video-annotator/engineering/us-007-playback-pane-and-metadata-panel-patterns
tags:
- frontend
- backend
- milestone-01
- playback
- testing
---

# US-007 playback pane and metadata panel patterns

Milestone-01 playback now uses a backend-served `GET /api/videos/{video_id}/source` route so the browser can load the selected local video without treating persisted filesystem paths as web URLs. The frontend playback pane stays contextual only, while the canonical review frame continues to come from feature state and exact-frame API calls.

## Observations
- [pattern] Use a backend playback URL helper in the frontend feature API module; `source_path` should remain metadata instead of a browser-facing URL. #frontend #backend #playback
- [pattern] Keep playback UI messaging explicit that browser controls do not own canonical frame selection. #frontend #ux
- [gotcha] Backend API tests that swap `APP_DB_URL` between temp SQLite files must clear cached `app.db.session.get_engine()` and `get_session_factory()` before creating the app, or stale DB state can leak across cases. #backend #testing
- [technique] Playwright browser verification can mock `/api/videos`, `/api/videos/:id`, and `/api/videos/:id/source` together to validate playback UI without a real media fixture pipeline. #playwright #verification

## Relations
- extends [[US-006 frontend video list selection patterns]]
- relates_to [[frontend/src/app/App.tsx]]
- relates_to [[backend/app/api/videos.py]]
- relates_to [[backend/tests/api/test_videos.py]]
- relates_to [[tools/ralph/progress]]