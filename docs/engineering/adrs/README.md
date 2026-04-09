# Architecture Decision Records

This directory stores the architecture decisions required by `docs/spec.md`.
Each ADR captures one decision that needs to remain explicit for this project’s
local-first reviewer workflow and Milestone 0 baseline.

## Conventions

- Use zero-padded, monotonically increasing filenames: `0001-<slug>.md`.
- Keep the slug short, lowercase, and hyphenated.
- Treat ADRs as durable records. If a decision changes, add a new ADR instead of
  rewriting the old one.
- Keep the structure lightweight and consistent:
  - `# ADR 000X: <title>`
  - `- Status: Accepted`
  - `- Date: 2026-04-09`
  - `## Context`
  - `## Decision`
  - `## Consequences`

## Initial ADRs

- [0001-backend-decoded-frames-canonical.md](./0001-backend-decoded-frames-canonical.md)
- [0002-react-fastapi-split.md](./0002-react-fastapi-split.md)
- [0003-sam2-isolated-service.md](./0003-sam2-isolated-service.md)
- [0004-masks-on-disk.md](./0004-masks-on-disk.md)
