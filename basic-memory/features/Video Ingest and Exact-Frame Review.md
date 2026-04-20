---
title: Video Ingest and Exact-Frame Review
type: note
permalink: video-annotator/features/video-ingest-and-exact-frame-review
tags:
- feature
- video
- exact-frame
- review
---

# Video Ingest and Exact-Frame Review

This feature owns the baseline review loop: discover local videos, open one indexed video, use playback for context, and use backend-decoded exact frames as the canonical review surface.

## Summary

- Goal: make local video review deterministic from backend-owned frame indices
- Primary users: ML engineers and technical annotators reviewing local videos
- Owning task note: [[Testing video ingest and exact-frame review]]

## Scope

- In scope:
  - startup indexing from `data/videos`
  - video list and one-video metadata reads
  - playback source route for contextual watching
  - backend exact-frame fetch
  - jump to frame
  - previous or next exact-frame stepping
  - zero-based backend `frame_idx` as annotation truth
- Out of scope:
  - object creation and manual box CRUD
  - review ergonomics like timeline markers and shortcuts
  - SAM2 prompting and propagation

## Current State

- Shipped behavior: startup indexing, list and detail reads, playback source, exact-frame fetch, jump, and step all ship on the happy path.
- Known gaps: exact-frame decode failures are not yet translated into clear user-facing JSON errors, and exact-frame reload still couples frame image and annotation fetches.
- Current blockers: none beyond the existing decode and reload error-handling gaps.

## Target Behavior

- Opening a video should expose playback plus exact-frame review without any browser-time ambiguity.
- A reviewer should be able to jump to frame `N`, step backward and forward, and repeatedly receive stable exact-frame content for the same canonical frame index.
- Failure states for decode or invalid frame requests should be concise and diagnosable.
- Playback remains contextual only and must never become annotation truth.

## Contracts and Dependencies

- Backend contracts:
  - `GET /api/videos`
  - `GET /api/videos/{video_id}`
  - `GET /api/videos/{video_id}/source`
  - `GET /api/videos/{video_id}/frame/{frame_idx}`
- Frontend contracts:
  - selected video state stays separate from exact-frame request state
  - canonical `currentFrameIndex` updates only after successful backend exact-frame load
- Data or storage contracts:
  - startup indexing scans `data/videos`
  - `Video.id` remains deterministic per relative source path
- External dependencies:
  - local media under `data/videos`
  - metadata inspection and exact-frame decode services

## Evidence

- Specs:
  - [[Product Requirements]]
  - [[Architecture]]
  - [[API]]
  - [[Data Model]]
- Milestone notes:
  - [[Milestones Index]]
  - [[m-1: Annotation Foundation]]
- Code or test evidence:
  - concrete implementation and verification inventory intentionally lives in task notes and testing guidance, not in this feature note

## Linked Tasks

- [[Testing video ingest and exact-frame review]]

## Integration Tests

| ID | Surface | Scenario | Real-World Why | Setup/Fixtures | Automation Status | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| INT-001 | backend | Example integration scenario | Why operator or system cares | Fixtures or stack setup | planned | Link or note |
| INT-002 | frontend | Example integration scenario | Why operator or system cares | Fixtures or stack setup | planned | Link or note |

## E2E Tests

| ID | Scenario | Real-World Workflow | Environment | Automation Status | Evidence |
| --- | --- | --- | --- | --- | --- |
| E2E-001 | Example e2e scenario | Real workflow or failure path | Local stack or fixture env | planned | Link or note |

## Manual Tests

Use exact execution status values only:
- `✅ Done`
- `⚠️ Partially`
- `❌ Not Done`

| ID | Scenario | Setup | Steps | Expected Result | Execution Status | Execution Notes |
| --- | --- | --- | --- | --- | --- | --- |
| MAN-001 | Example manual scenario | Required environment | Concrete steps | What operator should see | ❌ Not Done | Write why and what is missing |

## Observations

- [status] Startup indexing, list or detail reads, playback source, exact-frame fetch, jump, and step ship on the happy path.
- [risk] Exact-frame failure UX and exact-frame reload error isolation remain weaker than ideal.
- [guardrail] Browser playback must stay contextual only; backend `frame_idx` remains annotation truth.
- [retrieval] Use this note for video ingest, exact-frame review, startup indexing, or canonical frame workflow queries.

## Relations

- relates_to [[Repo Current State and Feature Matrix]]
- relates_to [[Product Requirements]]
- relates_to [[Architecture]]
- relates_to [[API]]
- relates_to [[Data Model]]
