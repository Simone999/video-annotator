---
title: Frame Indexing Contract
type: note
permalink: video-annotator/spec/engineering/frame-indexing-contract
tags:
- spec
- engineering
- frames
- contract
---

# Frame Indexing Contract

This note is the canonical contract for frame truth in the video annotator. It also defines how annotation timing in video review maps back to canonical frame identity, so playback position, review sync, and exact frame requests stay consistent.

Backend-decoded frame indices are the only canonical source for annotation truth. The system treats frame numbers as backend-owned facts, not browser guesses. Internally, frame indices are zero-based, so frame `0` is the first frame and every persisted annotation, exact frame fetch, and propagation step binds to that zero-based index.

Playback position is useful for watching and rough navigation, but browser `currentTime` is never the source of annotation truth. The playback pane may show an approximate position, and the frontend may convert playback time to frame for display or sync review playback, but annotation actions must always resolve through an explicit backend frame index and, when needed, an exact frame request.

The exact frame path is authoritative: jump to frame, previous or next frame, box prompts, saved annotations, and SAM2 operations all act on a concrete backend frame index `N`. When playback moves, the UI can seek roughly to the same moment, but the annotation pane must reload or request `/frame/{frame_idx}` before treating that frame as real annotation state.

External tools may use one-based frame numbers. That is an edge adapter problem, not a storage rule. Convert one-based inputs to zero-based indices at ingest, convert back only when exporting to a one-based consumer, and keep the internal contract unchanged so exact frame fetches and persisted annotations stay consistent.

## Observations
- [contract] Backend-decoded frame indices are canonical for frame truth, annotation truth, and exact frame retrieval #backend #frames
- [contract] Internal frame indices are zero-based everywhere unless an external integration forces edge conversion #indexing #contract
- [constraint] Browser `currentTime` may inform approximate playback position but never defines canonical annotation state #playback #frontend
- [workflow] Jump, step, prompt, propagate, and reopen flows must act on an explicit backend frame index and use exact frame fetches when annotation state is needed #api #sam2 #annotations
- [integration] One-based external tools must convert at the boundary and must not leak one-based numbering into persisted internal state #interop #adapters
- [retrieval] Annotation timing in video review is derived from canonical backend frame identity, not from browser playback time alone #retrieval #timing #video
- [retrieval] Clients may convert playback time to frame or request an exact video frame for review sync, but only backend `frame_idx` defines durable annotation state #retrieval #playback #exact-frame

## Relations
- relates_to [[Architecture]]
- relates_to [[Data Model]]
- relates_to [[API]]
- relates_to [[Frontend Interaction Spec]]
- relates_to [[SAM2 Integration]]
- relates_to [[Product Requirements]]