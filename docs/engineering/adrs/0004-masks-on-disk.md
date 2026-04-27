# ADR 0004: Masks Persist on Local Disk

- Status: Accepted
- Date: 2026-04-09

## Context

Current truth lives in `basic-memory/spec/engineering/Data Model.md`,
`basic-memory/spec/engineering/Export Format.md`, and
`basic-memory/spec/product/Product Requirements.md`. Those notes call for
SQLite-backed project metadata with local filesystem storage for masks and
exports. Product scope stays local-first and requires stable save and export
formats. Retired repo monolith now belongs under `archive/docs/spec.md`.

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
