# Video Annotator

This repository is currently at Milestone 0 scaffold stage for the local-first
video annotation reviewer defined in [docs/spec.md](docs/spec.md).

The scaffold exists to make the planned architecture and documentation layout
explicit without implying unimplemented behavior.

## Repository layout

- `frontend/`: Placeholder for the React + TypeScript + Vite client.
- `backend/`: Placeholder for the FastAPI service and local persistence code.
- `data/`: Local-only runtime project data and future SQLite files.
- `exports/`: Local-only exported annotation outputs.
- `masks/`: Local-only mask image storage.
- `docs/product/`: Product-facing requirements and workflow docs.
- `docs/engineering/`: Engineering specs, ADRs, runbook, and test planning.
- `docs/delivery/`: Milestone tracker, task breakdown, progress log, and
  blockers register.

For the authoritative product and architecture requirements, use
`docs/spec.md`.
