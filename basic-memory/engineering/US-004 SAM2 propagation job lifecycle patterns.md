---
title: US-004 SAM2 propagation job lifecycle patterns
type: note
permalink: video-annotator/engineering/us-004-sam2-propagation-job-lifecycle-patterns
tags:
- backend
- sam2
- jobs
- testing
---

# US-004 SAM2 propagation job lifecycle patterns

Milestone-03 backend now exposes `POST /api/videos/{video_id}/sam2/propagate`, `GET /api/jobs/{job_id}`, and `POST /api/jobs/{job_id}/cancel` for persisted propagation work. The implementation keeps the POST response deterministic by always returning an initial `queued` job snapshot, then advancing the persisted `jobs` row in a background thread.

The main implementation constraint was SQLAlchemy session ownership. Request-scoped sessions cannot cross thread boundaries safely, especially with SQLite-backed tests, so the propagation worker opens a fresh session from `app.db.session.get_session_factory()` each time it updates job progress or writes propagated annotations. This keeps DB access thread-safe and makes cancel polling deterministic.

The propagation worker also checks `cancel_requested_at` both before and after consuming the next adapter frame result. That extra guard matters when the adapter generator is blocked waiting on model output: a cancel can arrive while the worker is inside `next(...)`, and the post-yield check prevents a late frame from being persisted after cancellation.

## Observations
- [pattern] Background propagation workers should create fresh DB sessions from `get_session_factory()` instead of reusing request sessions #backend #jobs #sqlalchemy
- [pattern] Propagation job progress should count target frames excluding the seed `start_frame_idx`, while `result_json` stores persisted frame indices for deterministic polling #sam2 #jobs #api
- [pattern] Propagated `FrameAnnotation` rows should keep `is_keyframe = false`, clear box fields, and persist only mask-path metadata for the tracked frame/object pair #annotations #sam2
- [gotcha] If the job worker updates the DB row before the POST response serializes, callers can observe `running` too early; return an explicit queued snapshot from the create route/service #api #jobs
- [testing] Async propagation API tests are stable when the fake SAM2 service gates frame yields with thread events and the test polls `GET /api/jobs/{job_id}` until progress or terminal status appears #testing #sam2

## Relations
- extends [[SAM2 session and job persistence contract]]
- extends [[US-003 SAM2 prompt-box persistence patterns]]
- relates_to [[Milestone 3: SAM2 Prompt + Propagation]]