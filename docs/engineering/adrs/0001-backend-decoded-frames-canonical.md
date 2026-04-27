# ADR 0001: Backend-Decoded Frames Are Canonical

- Status: Accepted
- Date: 2026-04-09

## Context

Current truth lives in `basic-memory/spec/engineering/Frame Indexing
Contract.md` and `basic-memory/spec/product/Product Requirements.md`. Those
notes define browser video as playback and rough navigation aid only.
Backend-decoded frame image is source of truth for exact-frame review, internal
frame handling must stay zero-based, and annotations must bind to explicit
backend frame index. Retired repo monolith now belongs under
`archive/docs/spec.md`.

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
