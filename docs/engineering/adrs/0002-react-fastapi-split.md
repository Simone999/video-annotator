# ADR 0002: React Frontend and FastAPI Backend Split

- Status: Accepted
- Date: 2026-04-09

## Context

Current truth lives in `basic-memory/spec/engineering/Architecture.md` and
`basic-memory/spec/product/Product Requirements.md`. Those notes call for a
React + TypeScript frontend and a FastAPI backend on Python 3.12. Frontend owns
playback surface and client interactions. Backend owns frame decoding,
annotation persistence, exports, and service boundaries. Retired repo monolith
now belongs under `archive/docs/spec.md`.

## Decision

Use a split architecture with a React frontend and a FastAPI backend. The
frontend is responsible for rendering and user interaction, while the backend is
responsible for canonical data, exact frame retrieval, and service endpoints.

## Consequences

- The product remains aligned with the spec’s local-only architecture.
- Canonical frame handling and annotation persistence stay on the backend.
- The frontend does not become a general-purpose annotation platform; it stays focused on the single-stage review surface.
- Do not copy unrelated demo/gallery/auth flows into the core app.
