# ADR 0004: Masks Persist on Local Disk

- Status: Accepted
- Date: 2026-04-09

## Context

`docs/spec.md` calls for SQLite-backed project metadata with local filesystem storage for masks and exports. The product scope is local-first, and the spec requires stable save and export formats.

## Decision

Persist mask artifacts on the local filesystem rather than in the database. Use SQLite metadata as the authoritative index for discovery and references, and use the mask files on disk as the authoritative payload source.

## Consequences

- The app stays local-only and does not depend on remote storage.
- Mask persistence remains compatible with deterministic frame handling and
  repeatable exports.
- Annotation operations still need an explicit backend frame index; mask storage does not replace frame identity.
- Create, update, delete, and export flows must keep the SQLite row and the on-disk mask file in sync so the system does not accumulate orphaned files or dangling database references.
- Export and lookup logic should resolve masks through SQLite first, then verify the backing file exists before using it.
- The implementation must not expand into unrelated storage, deployment, or collaboration requirements.
