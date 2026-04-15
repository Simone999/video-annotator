---
title: Startup indexing
type: note
permalink: video-annotator/backend/startup-indexing
tags:
- backend
- startup
- indexing
---

# Startup indexing

This note answers how local videos become review targets without manual
database seeding. Backend startup bootstraps database tables and then scans the
configured local source directory so `/api/videos` can immediately expose real
reviewable media.

The indexing path is local-first. Media files remain on disk, review metadata
is persisted in the database, and repeated scans update the same `Video` rows
instead of generating duplicates. Startup code keeps orchestration close to
`create_app()` but delegates real indexing work to service code.

## Observations
- [behavior] Backend startup bootstraps database tables and then indexes supported files under `data/videos` automatically. #startup #indexing
- [constraint] `Video.id` is derived from source paths relative to the configured source directory so repeated scans update existing rows. #ids #filesystem
- [pattern] Keep startup orchestration near the `create_app()` lifecycle and reuse service modules for the actual indexing work. #fastapi #services
- [pattern] Resolve `VIDEO_SOURCE_DIR` and `extract_video_metadata` at call time instead of binding them in default arguments so tests can monkeypatch them cleanly. #testing #python

## Relations
- relates_to [[Video catalog API]]
- relates_to [[Startup indexing test seam]]
- relates_to [[Local video source setup]]
