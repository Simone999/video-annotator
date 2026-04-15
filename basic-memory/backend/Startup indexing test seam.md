---
title: Startup indexing test seam
type: note
permalink: video-annotator/backend/startup-indexing-test-seam
tags:
- backend
- testing
- startup
---

# Startup indexing test seam

This note answers how to test startup indexing through the real FastAPI
lifespan path. The test target is `create_app()` startup behavior, not just the
indexing service in isolation.

Tests patch the source directory and metadata extractor in `app.main`, start a
real `TestClient(create_app())`, and then assert the indexed videos are visible
through `/api/videos`. That keeps coverage on the same startup path the running
application uses.

## Observations
- [technique] Patch `app.main.VIDEO_SOURCE_DIR` and `app.main.extract_video_metadata`, then enter `TestClient(create_app())` to exercise startup indexing through the real lifespan path. #testing #fastapi
- [pattern] Use temp directories and fake metadata extraction so startup tests do not depend on real media tooling. #pytest #indexing
- [pattern] Assert `/api/videos` after startup instead of testing indexing only through lower-level service calls. #integration #api

## Relations
- depends_on [[Backend API test database seam]]
- relates_to [[Startup indexing]]
- relates_to [[Live video smoke validation]]
