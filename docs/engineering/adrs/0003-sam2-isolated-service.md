# SAM2 Isolated Behind a Separate Service Boundary

Status: Accepted
Date: 2026-04-09

## Context

`docs/spec.md` treats SAM2 as an assistive engine for prompts and propagation
and explicitly separates long-running or GPU-bound work into a worker/service
boundary. The core app must remain responsive while propagation runs.

## Decision

Run SAM2 behind a separate worker or service boundary rather than embedding it
directly in the main application process. The core backend coordinates requests
and responses, but SAM2 execution is isolated from the UI and primary API
process.

## Consequences

- The local-only app can keep responding while propagation or other long-running
  SAM2 work is active.
- Progress updates and cancellation remain part of the workflow boundary rather
  than the UI blocking on inference.
- GPU-bound or otherwise heavy SAM2 work does not dictate the structure of the
  main app.
- Do not import unrelated demo Flask, gallery, or auth flows when wiring the
  SAM2 boundary.
