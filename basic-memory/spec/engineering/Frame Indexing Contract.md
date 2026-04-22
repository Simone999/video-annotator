---
title: Frame Indexing Contract
type: spec
canonical: true
domain: engineering
permalink: video-annotator/spec/engineering/frame-indexing-contract
tags:
- spec
- engineering
- frames
- contract
---

# Frame Indexing Contract

Backend-decoded frame indices are only canonical source for annotation truth. Internal frame numbers stay zero-based unless an external adapter must convert at boundary.

Review UI may play video continuously on main stage, but browser `currentTime` never becomes annotation identity. Playback may help context. Pause, step, jump, seek, save, delete, and SAM2 actions must resolve through explicit backend `frame_idx`.

Single-stage review surface does not weaken this rule. When video plays, user sees context. When user pauses, app must know exact canonical current frame before any mutating action runs. Inspector bbox, confidence, and range summary all hang off that same backend frame truth.

External one-based tools remain adapter problem only. Convert at ingest or export edges. Do not leak one-based numbering into persisted internal state.

## Observations
- [contract] Backend-decoded zero-based `frame_idx` is canonical review and annotation identity #frames #contract
- [rule] Main-stage playback is contextual only; mutating actions still require explicit backend frame identity #playback #frontend
- [workflow] Pause, step, jump, prompt, propagate, and reopen flows must act on backend `frame_idx` #workflow #api
- [integration] One-based external tools convert only at system boundaries #interop #adapters

## Relations
- relates_to [[Architecture]]
- relates_to [[Data Model]]
- relates_to [[API]]
- relates_to [[Frontend Interaction Spec]]
- relates_to [[SAM2 Integration]]
- relates_to [[Product Requirements]]