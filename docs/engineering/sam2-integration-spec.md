# Milestone 0 SAM2 Integration Spec

## Purpose

This document records the Milestone 0 SAM2 integration boundary for the local-
first video annotation reviewer.

It is intentionally narrow. SAM2 is treated as an assistive service that sits
behind a separate worker or service boundary, stays local-only, and does not
own canonical project storage.

This spec defines the baseline architecture and approved reuse rules only.
Implementation details for live SAM2 behavior are deferred to later milestones.

## Baseline Architecture

- The core app coordinates SAM2 requests and responses.
- SAM2 execution remains isolated from the UI process and the primary backend
  API process.
- Long-running or GPU-bound work belongs behind the worker or service
  boundary, not inline in the main request path.
- Canonical annotation storage remains separate from SAM2 execution.
- The repository-owned storage paths for project state, masks, and exports are
  still owned by the application, not by SAM2.
- Backend-decoded exact frames remain the source of truth for any future SAM2
  interaction.

These rules come from `docs/spec.md` and ADR 0003, and they apply before any
later milestone adds behavior.

## Approved Reuse Boundaries

The only approved reuse from `~/projects/sam2/demo` is:

- session lifecycle logic
- predictor wrapper logic
- prompt flow logic
- propagation flow logic
- RLE helpers
- multipart streaming patterns

Reuse must stay within those boundaries. The demo may inform implementation,
but it does not define the product architecture for this repository.

## Explicit Non-Reuse Rules

Do not copy or assume any of the following from the demo:

- Flask application structure
- demo auth flows
- demo gallery flows
- generic demo UX
- GraphQL assumptions

Any later implementation must still fit the repository's own FastAPI-based
architecture and local-first product boundaries.

## Milestone 0 Scope

Milestone 0 records the SAM2 boundary, but it does not implement the SAM2
feature set.

Out of scope for Milestone 0:

- model download procedures
- live inference behavior
- GPU or runtime operations
- prompt endpoints
- propagation endpoints
- any implemented SAM2 UX

This milestone only establishes where SAM2 fits in the system and what may be
reused later.

## Deferred Sections

The following sections are reserved for later milestones. Their implementation
details are intentionally deferred here.

### Session Lifecycle

Reserved for future documentation of how SAM2 sessions are created, tracked,
and released.

### Prompt Flow

Reserved for future documentation of prompt submission, prompt validation, and
prompt-to-mask handoff behavior.

### Propagation Flow

Reserved for future documentation of propagation requests, incremental
progress handling, and cancellation semantics.

### Serialization Format

Reserved for future documentation of the on-the-wire and persisted data shape
used by SAM2-related operations.

### Cleanup Behavior

Reserved for future documentation of session teardown, temporary artifact
cleanup, and cache handling.

Until those milestones arrive, no implementation detail should be inferred from
this document beyond the baseline architecture and reuse rules above.
