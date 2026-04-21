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

This feature owns baseline flow: discover local videos, pick one from library, open review screen, and bind review state to canonical backend frames.

## Summary
- Goal: make local video selection and frame review deterministic from backend-owned frame indices.
- Primary users: ML engineers and technical annotators reviewing local videos.
- Owning task note: [[Testing video ingest and exact-frame review]]

## Scope
- In scope:
  - startup indexing from `data/videos`
  - video library selection flow
  - video list and detail metadata reads
  - backend exact-frame fetch
  - jump and step
  - zero-based backend `frame_idx` as truth
- Out of scope:
  - manual box CRUD details
  - richer workspace ergonomics
  - SAM2 runtime details

## Current State
- Shipped behavior: startup indexing, list and detail reads, playback source, exact-frame fetch, jump, and step exist on core path.
- Known gaps: current frontend shell still reflects older separate-surface model; library-derived state and single-stage review UI are documented target, not shipped runtime truth yet.
- Current blockers: none for baseline ingest and frame fetch; blockers live in later UI implementation.

## Target Behavior
- User starts in video library, picks one indexed video, lands in single review surface, and still works on canonical backend frames.
- Playback may run on main stage for context, but pause, jump, and step resolve to explicit backend frame identity.
- Invalid frame or decode failures stay concise and diagnosable.

## Contracts and Dependencies
- Backend contracts:
  - `GET /api/videos`
  - `GET /api/videos/{video_id}`
  - `GET /api/videos/{video_id}/source`
  - `GET /api/videos/{video_id}/frame/{frame_idx}`
- Frontend contracts:
  - library selection state stays separate from canonical current frame state
  - canonical `currentFrameIndex` updates only after successful backend resolution
- Data or storage contracts:
  - startup indexing scans `data/videos`
  - `Video.id` stays deterministic per relative source path

## Observations
- [status] Ingest and exact-frame foundations ship; library-first single-stage UI is next presentation layer #review #video
- [truth] Playback may exist in UI, but backend `frame_idx` stays annotation truth #frames #frontend
- [gap] Docs now target library-first review flow before runtime UI catches up #docs #ux
- [retrieval] Use this note for video library selection, ingest, or canonical frame workflow queries #retrieval

## Relations
- relates_to [[Repo Current State and Feature Matrix]]
- relates_to [[Product Requirements]]
- relates_to [[Architecture]]
- relates_to [[API]]
- relates_to [[Data Model]]