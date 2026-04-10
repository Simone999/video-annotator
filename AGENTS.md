# AGENTS.md

- Use $caveman full before any other action.
- Use basic-memory for durable notes and context lookup before you rely on memory.
- Never make assumptions. If something is not clear or is not found in the documents, ask the user.

## Basic-Memory rules
- Use project: `video-annotator`
- Before any nontrivial task, check basic-memory first for prior decisions, relevant context, or existing notes.
- If something is unclear, missing from docs, or you are stuck, search memory before making assumptions.
- When you make a durable technical decision, get corrected by the user, or solve a hard problem worth preserving, save or update a memory note.

## BACKLOG WORKFLOW INSTRUCTIONS

This project uses Backlog.md MCP for all task and project management activities.

**CRITICAL GUIDANCE**

- If your client supports MCP resources, read `backlog://workflow/overview` to understand when and how to use Backlog for this project.
- If your client only supports tools or the above request fails, call `backlog.get_workflow_overview()` tool to load the tool-oriented overview (it lists the matching guide tools).

- **First time working here?** Read the overview resource IMMEDIATELY to learn the workflow
- **Already familiar?** You should have the overview cached ("## Backlog.md Overview (MCP)")
- **When to read it**: BEFORE creating tasks, or when you're unsure whether to track work

These guides cover:
- Decision framework for when to create tasks
- Search-first workflow to avoid duplicates
- Links to detailed guides for task creation, execution, and finalization
- MCP tools reference

You MUST read the overview resource to understand the complete workflow. The information is NOT summarized here.

## Current State
- The repo is still at scaffolding stage. The only authoritative product source is `docs/spec.md`.
- There are no verified startup, build, or product test commands yet. Use only the verified formatting, linting, and typechecking commands that have corresponding repo config.
- When tool configs exist, prefer the verified root `make` targets over ad-hoc tool invocations.
- Before fixing lint or formatting issues manually, run the available autofix commands first: `make format` and `make lint-fix`.

## Product Invariants
- This project is a narrow local-first video annotation reviewer with SAM2 assistance, not a general annotation platform.
- Backend-decoded frames are canonical. The browser video element is only for playback and rough navigation.
- Use zero-based frame indices internally everywhere unless converting at an external boundary.
- Never derive canonical annotation frame IDs from browser `currentTime`.
- Any annotation create/edit/delete operation must be bound to an explicit backend frame index.

## Planned Architecture
- Keep the spec's split: React + TypeScript + Vite frontend, FastAPI backend on Python 3.12, SQLite for v1, local filesystem storage for `masks/` and `exports/`, and a separate SAM2 worker/service for long-running or GPU-bound work.
- Reuse from `~/projects/sam2/demo` only where the spec explicitly says to: session lifecycle, predictor wrapper, prompt flow, propagation flow, RLE helpers, and multipart streaming patterns.
- Do not copy demo-specific Flask structure, auth/gallery flows, or generic demo UX into the core app.

## Python Conventions
- Use `uv` for Python workflows.
- Use Ruff for Python formatting and linting and Pyright strict mode for Python typechecking.
- Do not add `from __future__ import annotations` unless it is strictly necessary.
- Use modern typing syntax, including PEP 695 type parameters. Avoid legacy typing forms such as `TypeVar`, `Generic`, `Optional`, and `Dict`.
- When you create or change a class or function, update its docstring in Google style and include types.
- Use `is` for enum member comparisons when identity is intended, including `StrEnum`; use `==` only for deliberate value-level comparisons.
- Prefer `Sequence[T]` to `tuple[T, ...]`.

## UI And API Constraints
- Preserve the two-pane center workflow from the spec: playback pane for watching, exact-frame pane for annotation.
- Keep the product keyboard shortcuts aligned with `docs/spec.md`: `Space`, `<`, `>`, `Shift+>`, `Shift+<`, `g`, `b`, `m`, `e`, `Delete`, `s`.
- Keep endpoint paths and payload shapes aligned with `docs/spec.md`; this repo does not have other verified API sources yet.
- Propagation must support incremental progress updates and cancellation, and the UI must remain usable while propagation is running.

## Delivery Priorities
- Start from Milestone 0 in `docs/spec.md`: scaffold the repo and required docs before adding deeper features.
- Follow the spec's implementation order unless a later change documents a different decision: exact-frame review -> manual annotation -> masks -> SAM2 prompt -> propagation -> export -> tests/polish.
- Optimize for correctness, deterministic frame handling, and stable save/export formats over breadth or premature abstraction.
- Keep v1 local-only: localhost by default, no telemetry, and local persistence for project state, masks, and exports.

## Docs To Maintain
- As the repo grows, create and keep current the docs required by `docs/spec.md`: product requirements, ADRs, API spec, data model spec, frontend interaction spec, SAM2 integration spec, export spec, test plan, and runbook.


## Git Workflow

- **Branching**: Use feature branches when working on tasks (e.g. `tasks/task-123-feature-name`)
- **Committing**: Use the following format: `TASK-123 - Title of the task`
- **PR titles**: Use `{taskId} - {taskTitle}` (e.g. `TASK-123 - Title of the task`)
- **Github CLI**: Use `gh` whenever possible for PRs and issues
