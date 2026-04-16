---
title: Architecture
type: note
permalink: video-annotator/spec/engineering/architecture
tags:
- spec
- engineering
- architecture
- system-design
---

# Architecture

This note is the canonical system architecture overview for the video annotator. The system is local-first and keeps the backend-decoded frame index as the source of truth for review and annotation state, while the browser playback pane remains contextual UI rather than annotation truth.

The runtime is split into a React + TypeScript frontend, a FastAPI backend, local storage, and a SAM2 worker boundary. The frontend owns review workflow presentation: playback pane, exact-frame canvas, timeline markers, object list, shortcuts, and feature state for the selected video, current frame, tools, and in-flight SAM2 UI. The backend owns the authoritative operations: video indexing, exact frame decode, annotation persistence, export orchestration, SAM2 session management, and translation between app payloads and the predictor API.

Service boundaries stay small and typed. Frame handling sits behind a dedicated frame service that decodes exact frame `N`, serves image bytes efficiently, and can cache recent frames. Annotation logic stays in a separate service that validates boxes, upserts per-frame object annotations, and persists masks on disk while leaving entity details to [[Data Model]]. Long-running propagation and optional exports run outside the request path in a worker role that isolates GPU-bound inference and uses fresh database sessions for async work instead of request-scoped state.

Storage is intentionally simple for v1: SQLite for metadata, local filesystem directories for masks and exports, and local video files as the review source. Recommended stack choices are React, TypeScript, Vite, typed frontend state and data-fetching layers, FastAPI, Python 3.12, Pydantic, SQLAlchemy, and TorchCodec for exact frame decode, with optional ffmpeg utilities around thumbnails or transcoding. In development the frontend dev server, backend, SQLite database, masks/exports folders, and local GPU SAM2 worker all run on one machine; a production-like local mode keeps the backend as one process with static frontend assets served by the backend or a reverse proxy, while the SAM2 worker remains a separate process.

SAM2 reuse is intentionally narrow. The app should reuse or lightly adapt the demo backend's session lifecycle logic, predictor wrapper, prompt submission flow, propagation flow, RLE helpers, and multipart streaming pattern. The demo's GraphQL schema, gallery or upload flows, and demo-specific frontend layout are reference material only, not architectural dependencies. Core app boundaries remain app-owned: React frontend, FastAPI API surface, local-first persistence, and dedicated adapter/service modules around SAM2. Integration-specific behavior stays summarized in [[SAM2 Integration]], while this note keeps the high-level runtime boundary and ownership model self-contained.

## Observations
- [architecture] The system is a local-first split between a React frontend, FastAPI backend, local metadata storage, filesystem artifact storage, and a separate SAM2 worker boundary #system-design
- [decision] The backend-decoded frame index is canonical, so browser playback time never becomes annotation truth #frames #backend
- [boundary] Frontend owns presentation and interaction state, while backend owns indexing, exact-frame decode, persistence, exports, and SAM2 orchestration #frontend #backend
- [boundary] Long-running propagation and GPU-bound inference belong in worker execution paths, not synchronous request handlers #worker #sam2
- [storage] SQLite stores metadata, while masks and exports live on the local filesystem beside local video sources #storage #local-first
- [reuse] SAM2 demo backend flows are reusable at the adapter boundary, but demo frontend UX and GraphQL surfaces are reference-only #sam2 #reuse
- [deployment] Both supported runtime modes are local: a multi-process dev stack and a local production-like split with backend plus separate SAM2 worker #runtime #deployment

## Relations
- depends_on [[Frame Indexing Contract]]
- relates_to [[Data Model]]
- relates_to [[API]]
- relates_to [[SAM2 Integration]]
- relates_to [[Runbook]]
- relates_to [[Engineering Index]]
