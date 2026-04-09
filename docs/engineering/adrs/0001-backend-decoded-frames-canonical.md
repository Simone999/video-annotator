# Backend-Decoded Frames Are Canonical

Status: Accepted
Date: 2026-04-09

## Context

`docs/spec.md` defines the browser video element as a playback and rough
navigation aid only. The backend-decoded frame image is the source of truth for
exact frame review, and internal frame handling must use zero-based indices.
Annotations also must be bound to an explicit backend frame index.

## Decision

Backend-decoded frames are the canonical frame source for annotation work. The
browser video element must not define canonical annotation frame identity, and
browser time math must not be used to derive annotation frame IDs.

## Consequences

- The app stays local-first and deterministic about frame identity.
- Annotation create, edit, and delete operations must always target an explicit
  backend frame index.
- Browser playback remains useful for watching and rough navigation, but it does
  not control canonical annotation state.
- The implementation must not infer frame identity from `currentTime` or any
  other browser-time conversion.
