---
title: US-010 startup indexing patterns
type: note
permalink: video-annotator/engineering/us-010-startup-indexing-patterns
tags:
- backend
- milestone-01
- indexing
- startup
- testing
---

# US-010 startup indexing patterns

Milestone-01 backend startup now bootstraps DB tables and then indexes local videos automatically, so `/api/videos` can expose real review targets without manual DB seeding. The startup seam resolves `VIDEO_SOURCE_DIR` and metadata inspection at call time inside `app.main`, which keeps runtime behavior local-first and makes lifespan coverage easy to patch in tests.

## Observations
- [pattern] Keep startup orchestration in a small helper near `create_app()` lifecycle code, while reusing existing service modules for the real indexing work #backend #startup
- [pattern] Resolve startup defaults like `VIDEO_SOURCE_DIR` and `extract_video_metadata` at function call time instead of binding them in default arguments, so tests can monkeypatch them cleanly #testing #python
- [technique] API startup tests can patch `app.main.VIDEO_SOURCE_DIR` and `app.main.extract_video_metadata`, enter `TestClient(create_app())`, and assert `/api/videos` reflects indexed temp files without real media tooling #fastapi #pytest

## Relations
- extends [[Milestone-01 Ralph audit gaps]]
- relates_to [[backend/app/main.py]]
- relates_to [[backend/tests/api/test_videos.py]]
- relates_to [[docs/engineering/architecture.md]]
- relates_to [[docs/runbooks/dev-setup.md]]
- relates_to [[tools/ralph/progress]]