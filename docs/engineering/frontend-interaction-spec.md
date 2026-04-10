# Milestone 0 Frontend Interaction Spec

## Purpose

This document defines the Milestone 0 interaction contract for the empty frontend shell.
It preserves the product's two-pane center workflow while deferring all real annotation
behavior to later milestone documents.

## Scope

Milestone 0 may render an empty shell with visible placeholder regions only.
The shell must not imply that selection logic, annotation tools, object management,
timeline mechanics, or save/export interactions are already implemented.

The canonical annotation rule still applies: backend-decoded exact-frame views are the
place where annotation work belongs. Browser playback is preview and navigation only.

## Layout

The shell may expose up to four visible regions:

- Left sidebar placeholder
- Center top playback pane
- Center bottom exact-frame work area
- Right sidebar placeholder

The center area must preserve the spec's two-pane workflow:

- playback on top
- exact-frame work below

If the side regions are rendered, they are placeholders only and should be labeled as
such. They do not need behavior beyond being visibly present.

## Placeholder Labels

The minimum Milestone 0 shell should make the regions understandable to a human reader:

- playback pane placeholder
- exact-frame work area placeholder
- left sidebar placeholder, if shown
- right sidebar placeholder, if shown

These labels are informational only. They do not introduce interaction semantics.

## Reserved Keyboard Shortcuts

Milestone 0 reserves the exact shortcut list from `docs/spec.md`:

- `Space`
- `<`
- `>`
- `Shift+ >`
- `Shift+ <`
- `g`
- `b`
- `m`
- `e`
- `Delete`
- `s`

These bindings are reserved only. Milestone 0 does not imply that the later shortcut
behavior, tool activation, or annotation actions are implemented yet.

## Explicit Deferrals

The following behavior is intentionally deferred to later milestone docs:

- selection rules
- annotation tools
- object panel behavior
- timeline behavior beyond placeholder regions
- marker semantics
- any annotation editing flow

## Interaction Rule

The browser playback pane must never be treated as the canonical source of annotation
identity. Any future annotation interaction must remain bound to backend-driven
exact-frame views and explicit frame indices.
