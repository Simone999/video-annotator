# Backend Placeholder

This directory started as the Milestone 0 backend scaffold. Current backend
truth lives in `basic-memory/spec/engineering/Architecture.md` and
`basic-memory/spec/engineering/Data Model.md`. Retired repo monolith belongs
under `archive/docs/spec.md` for history only.

The backend now includes a minimal FastAPI app scaffold with the startup
entrypoint, package placeholders, and an empty `/api` router prefix.

The backend now also includes local SQLite bootstrap for a repository-owned
database under `data/`, with the initial `videos` table schema for indexed
video metadata.

Later milestones will add video indexing metadata flow.

The backend still includes only the developer-tooling baseline needed for Ruff,
Pyright, and pre-commit beyond that scaffold.
