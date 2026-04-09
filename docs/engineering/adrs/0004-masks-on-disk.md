# ADR 0004: Masks Persist on Local Disk

- Status: Accepted
- Date: 2026-04-09

## Context

`docs/spec.md` calls for SQLite-backed project metadata with local filesystem
storage for masks and exports. The product scope is local-first, and the spec
requires stable save and export formats.

## Decision

Persist mask artifacts on the local filesystem rather than in the database. Use
the database for metadata and references, while mask files remain on disk.

## Consequences

- The app stays local-only and does not depend on remote storage.
- Mask persistence remains compatible with deterministic frame handling and
  repeatable exports.
- Annotation operations still need an explicit backend frame index; mask
  storage does not replace frame identity.
- The implementation must not expand into unrelated storage, deployment, or
  collaboration requirements.
