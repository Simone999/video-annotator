---
title: SAM2 session and job persistence contract
type: note
permalink: video-annotator/engineering/sam2-session-and-job-persistence-contract
tags:
- backend
- sam2
- persistence
---

# SAM2 session and job persistence contract

`sam2_sessions` persists only lifecycle metadata for one video-scoped SAM2 session: `id`, `video_id`, `status`, `created_at`, `last_used_at`, and optional `closed_at`. Live predictor internals do not belong in the database; they stay behind the SAM2 adapter/service boundary.

`jobs` persists background-work metadata for async flows such as `sam2_propagation`. Current row shape includes `id`, `type`, `video_id`, optional `object_id`, `session_id`, `status`, deterministic `progress_current`/`progress_total`, `payload_json`, optional `result_json`, optional `error_message`, and optional lifecycle timestamps for cancel/start/complete.

Useful test pattern: model-level persistence checks can stay cheap with SQLite `Base.metadata.create_all(engine)` plus one SQLAlchemy `Session` round trip to verify datetime and JSON columns without needing API fixtures.

## Observations
- [pattern] Persist SAM2 session lifecycle metadata in `sam2_sessions`, but keep predictor state out of DB and inside adapter memory #backend #sam2 #persistence
- [pattern] Persist async propagation bookkeeping in `jobs` with deterministic counters and JSON payload/result blobs #backend #jobs #persistence
- [gotcha] Repo-local backend pytest command is `uv run --project backend pytest`; bare `uv --project backend pytest` fails in this workspace #tooling #backend

## Relations
- relates_to [[Milestone 3: SAM2 Prompt + Propagation]]
