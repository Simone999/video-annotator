# Runbook

## Purpose and Current Scope

This runbook captures the current Milestone 0 operating expectations for the
local-first video annotation reviewer.

There are still no verified startup, build, or product test commands yet.
The repository now has a verified developer-tooling baseline for formatting,
linting, and typechecking. Only the commands listed in this runbook should be
treated as verified.

Current scope is limited to the scaffolded repository, baseline documentation,
and local-only storage conventions. Later milestone behavior is intentionally
not operationalized here.

## Repository Layout

The repository is organized to match the spec’s split architecture and local
storage boundaries:

- `frontend/` for the React + TypeScript + Vite client
- `backend/` for the FastAPI service and related Python modules
- `docs/product/` for product-level requirements and scope notes
- `docs/engineering/` for ADRs, specs, and operational references
- `data/` for local project metadata and other repository-owned state
- `masks/` for local mask artifacts
- `exports/` for local export outputs

This layout is intentionally narrow. It does not imply a broader platform,
multi-user workflow, or cloud-backed deployment model.

## Local Startup Expectations

The Milestone 0 baseline does not yet provide a verified local startup path.
There are no confirmed service launch commands, no validated development server
workflow, and no endorsed smoke-test sequence at this stage.

The only safe expectation is that later milestones will define startup behavior
after the repository has the necessary application and environment config in
place.

## Verified Developer Commands

Install the current tooling baseline with:

- `make backend-install`
- `make frontend-install`
- `make precommit-install`

Use the verified root commands for day-to-day developer checks:

- `make format`
- `make format-check`
- `make lint`
- `make lint-fix`
- `make typecheck`
- `make check`

Autofix comes before manual cleanup. Run `make format` and `make lint-fix`
before editing files by hand to resolve style or lint violations.

The root `Makefile` delegates to:

- `uv`-managed backend tooling under `backend/`
- `npm`-managed frontend tooling under `frontend/`
- root `.pre-commit-config.yaml` hooks that call the same make targets

## Storage Locations

Local persistence is expected to stay on disk within the repository-owned
paths:

- `data/` stores local project state and metadata
- `masks/` stores local mask artifacts
- `exports/` stores local export outputs

These paths are local-only. They are not placeholders for remote storage,
shared team storage, or browser-only state.

## Model Download Placeholder

SAM2 model download steps are deferred until SAM2 integration exists.

Do not treat this repository as having a current model acquisition workflow,
model version policy, or operational download procedure. Those details belong
with the SAM2 integration milestone, not the Milestone 0 baseline.

## Cache Cleanup Placeholder

Cache cleanup operations are deferred until SAM2 integration exists.

There is no verified cache maintenance workflow yet, and no operational
instructions should be inferred for model caches, worker caches, or related
temporary artifacts until the SAM2 service boundary is implemented.

## Common Failure Recovery

If documentation or config is missing, first confirm whether the required file
belongs to the current milestone or a deferred milestone. Missing baseline docs
or missing repository config should be treated as incomplete setup, not as a
signal to invent an operational workaround.

If local data looks stale, assume the issue is in the repository-owned
`data/`, `masks/`, or `exports/` state until the relevant milestone documents
define an explicit reset or migration procedure. Do not guess at cleanup steps
that have not been verified.

If expectations are misaligned with unsupported milestone behavior, fall back
to the milestone scope in `docs/spec.md` and the delivery task docs. Features
such as verified startup commands, SAM2 operations, or export flows should not
be assumed to exist before their milestone documents say they do.

## Deferred Until Later Milestones

The following are explicitly out of scope for this runbook baseline:

- verified startup, build, and product test commands
- SAM2 model download and cache maintenance procedures
- worker/service operational procedures for long-running or GPU-bound work
- export execution steps
- recovery playbooks for behavior that is not yet implemented

These topics should be documented only when the corresponding product and
engineering milestones have established them.
