# Test Plan

## Purpose

This document is the Milestone 0 test-plan foundation for the local-first video
annotation reviewer. It records the current verification baseline and the
minimum testing direction already defined in `docs/spec.md` without claiming
later-milestone coverage.

Milestone 0 is still scaffolding-focused. The testing plan here is limited to
placeholders and immediate verification expectations for repository setup and
docs work.

## Milestone 0 Verification Baseline

The following commands are the verified baseline for Milestone 0:

- `make format-check`
- `make lint`
- `make typecheck`

No verified startup, build, or product test commands exist yet. For docs-only
work, the equivalent scoped verification is to run the verified root checks
above against the documentation changes and confirm they still pass.

## Testing Categories

The spec defines four eventual testing categories. Milestone 0 only establishes
their placeholders here.

### Unit Tests

Placeholder for future unit coverage.

Detailed cases, fixtures, and assertions are deferred to later milestones.

### Integration Tests

Placeholder for future integration coverage.

Detailed cases, fixtures, and environment wiring are deferred to later
milestones.

### UI Tests

Placeholder for future UI automation coverage.

Detailed flows, browser automation, and interaction fixtures are deferred to
later milestones.

### Golden Tests

Placeholder for future golden-test coverage.

Detailed frozen outputs, fixture videos, and checksum baselines are deferred to
later milestones.

## Out Of Scope For Milestone 0

The following are explicitly out of scope for this milestone:

- feature-level automated tests
- video fixtures
- UI automation flows
- golden exports or masks

These items belong to later milestones once the corresponding application and
storage behavior exists.
