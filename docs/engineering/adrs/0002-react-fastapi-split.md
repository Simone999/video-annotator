# ADR 0002: React Frontend and FastAPI Backend Split

- Status: Accepted
- Date: 2026-04-09

## Context

`docs/spec.md` calls for a React + TypeScript + Vite frontend and a FastAPI
backend on Python 3.12. The frontend owns the playback pane, exact-frame
annotation surface, and client interactions. The backend owns frame decoding,
annotation persistence, exports, and API access to the rest of the system.

## Decision

Use a split architecture with a React frontend and a FastAPI backend. The
frontend is responsible for rendering and user interaction, while the backend is
responsible for canonical data, exact frame retrieval, and service endpoints.

## Consequences

- The product remains aligned with the spec’s local-only architecture.
- Canonical frame handling and annotation persistence stay on the backend.
- The frontend does not become a general-purpose annotation platform; it stays
  focused on the two-pane review workflow.
- Do not copy unrelated demo/gallery/auth flows into the core app.
