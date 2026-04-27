---
title: 2026-04-24 - keep library state colors on generic card classes
type: decision
permalink: video-annotator/decisions/2026-04-24-keep-library-state-colors-on-generic-card-classes
canonical: true
domain: frontend
aliases:
- library state color classes
- video card accent badge classes
- library palette rule
tags:
- decision
- frontend
- ui
- library
- styles
- theme
---

# 2026-04-24 - keep library state colors on generic card classes

- Date: 2026-04-24

## Decision

Keep library state color mapping on generic card primitives such as `video-card-accent` and `video-card-badge`. Do not encode library state styling through shared tone names like `primary`, `secondary`, or `tertiary` in the component API. Current shipped library states are `not_started`, `in_progress`, `ready`, and `exported`; planned blocked import work may add `started` later.

## Why

Library and review routes share shell language but do not share the same state palette. Generic card primitives keep reusable markup stable, while library route CSS can map `data-state` to its own palette without leaking route-specific color semantics into component props or state helpers. `Total Videos` in the summary strip is not a state and should stay neutral text, so the summary model also needs explicit state-or-neutral handling instead of generic tones.

## Consequences

- Library cards expose `data-state` and generic card class hooks.
- Library route CSS owns the mapping from current shipped states `not_started`, `in_progress`, `ready`, and `exported` to library-specific colors.
- Shared helpers such as `stateful-card`, `state-color`, `state-fill`, and `state-border` stay generic, while the route selects its palette with `data-state-palette="library"`.
- Summary tiles use the same explicit state names for colored counts, while `Total Videos` remains neutral.
- Screenshot parity still requires library components to use exact mockup class stacks for layout and spacing; shared helper classes alone were not enough.
- Review route can keep base design ownership without forcing library state names to reuse review color terms.
- Planned blocked import work may add `started` styling later, but current shipped truth does not rely on it.

## Observations
- [decision] Library state styling should stay route-owned even when card primitives are shared. #library #styles
- [rule] Use generic classes like `video-card-accent` and `video-card-badge`, then map colors from `data-state` in route CSS. #css #frontend
- [pattern] Reusable state helpers should stay generic and palette selection should happen at a route wrapper, not in component class names. #theme #css
- [rule] `not_started` is an explicit neutral state, not an accidental fallback. #library #states
- [rule] `Total Videos` is neutral summary text and not part of the state palette. #summary #ui
- [lesson] Library drift came from shared helper CSS plus missing `.state-context`, not from colors alone. #mockup #css #drift
- [boundary] Do not expose review-theme tone names as library state API. #theme #ui

## Relations
- indexed_by [[Decisions Index]]
- relates_to [[2026-04-23 - use docs-ui PNGs for 1920x1080 backlog truth]]
- relates_to [[Video Ingest and Exact-Frame Review]]
