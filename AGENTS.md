# AGENTS.md

- Use `$caveman full` before any other action.
- Use basic-memory for durable notes and context lookup.
- Make no assumptions. If docs do not answer, ask user.

## Basic-Memory

- Use project: `video-annotator`
- Before any nontrivial task, check memory first for prior decisions, context, and notes.
- If docs unclear, missing, or you get stuck, search memory before guessing.
- When durable technical decision lands, user corrects you, or you solve hard problem worth keeping, save or update memory note.

## Backlog Workflow

Project uses Backlog.md MCP for task and project management.

- Read `backlog://workflow/overview` first.
- If request fails, call `backlog.get_workflow_overview()`.
- First time here: read overview immediately.
- If already familiar: keep cached `## Backlog.md Overview (MCP)`.
- Read overview before creating tasks and whenever tracking decision unclear.
- Do not skip overview. Full workflow lives there.

## Current State

- Repo still scaffolding stage.
- Only authoritative product source: `docs/spec.md`.
- No verified startup, build, or product test commands yet.
- Use only verified formatting, linting, and typechecking commands backed by repo config.
- When config exists, prefer root `make` targets over ad-hoc commands.
- Before manual lint or format fixes, run `make format` and `make lint-fix`.

## Product Invariants

- Product is narrow local-first video annotation reviewer with SAM2 assist. Not general annotation platform.
- Backend-decoded frames are canonical.
- Browser video element is playback and rough navigation only.
- Use zero-based frame indices internally unless converting at external boundary.
- Never derive canonical annotation frame IDs from browser `currentTime`.
- Every annotation create, edit, delete must bind to explicit backend frame index.

## Planned Architecture

- Keep spec split: React + TypeScript + Vite frontend, FastAPI backend on Python 3.12, SQLite for v1, local filesystem storage for `masks/` and `exports/`, separate SAM2 worker/service for long-running or GPU-bound work.
- Reuse from `~/projects/sam2/demo` only where spec allows:
- `session lifecycle`
- `predictor wrapper`
- `prompt flow`
- `propagation flow`
- `RLE helpers`
- `multipart streaming patterns`
- Do not copy demo-specific Flask structure, auth flows, gallery flows, or generic demo UX into core app.

## Python Conventions

- Use `uv` for Python workflows.
- Use Ruff for formatting and linting.
- Use Pyright strict mode for typechecking.
- Do not add `from __future__ import annotations` unless strictly necessary.
- Use modern typing syntax, including PEP 695 type parameters.
- Avoid legacy typing forms like `TypeVar`, `Generic`, `Optional`, `Dict`.
- When you create or change class or function, update Google-style docstring and include types.
- Use `is` for enum member identity checks, including `StrEnum`, use `==` only for value comparison.
- Prefer `Sequence[T]` over `tuple[T, ...]`.

## UI And API Constraints

- Keep spec two-pane center workflow: playback pane for watching, exact-frame pane for annotation.
- Keep shortcuts aligned with `docs/spec.md`: `Space`, `←`, `→`, `Shift+→`, `Shift+←`, `g`, `b`, `m`, `e`, `Delete`, `s`.
- Keep endpoint paths and payload shapes aligned with `docs/spec.md`.
- No other API source is verified yet.
- Propagation must support incremental progress updates and cancellation.
- UI must stay usable while propagation runs.

## Delivery Priorities

- Start at Milestone 0 in `docs/spec.md`.
- Scaffold repo and required docs before deeper features.
- Follow spec implementation order unless later documented decision changes it: exact-frame review -> manual annotation -> masks -> SAM2 prompt -> propagation -> export -> tests/polish.
- Optimize for correctness, deterministic frame handling, and stable save/export formats over breadth or premature abstraction.
- Keep v1 local-only: localhost default, no telemetry, local persistence for project state, masks, and exports.

## Docs To Maintain

- As repo grows, create and keep current docs required by `docs/spec.md`:
- product requirements
- ADRs
- API spec
- data model spec
- frontend interaction spec
- SAM2 integration spec
- export spec
- test plan
- runbook

## Git Workflow

- Use feature branches for tasks, for example `tasks/task-123-feature-name`.
- Commit format: `TASK-123 - Title of task`
- PR title format: `{taskId} - {taskTitle}`
- Use `gh` whenever possible for PRs and issues.
