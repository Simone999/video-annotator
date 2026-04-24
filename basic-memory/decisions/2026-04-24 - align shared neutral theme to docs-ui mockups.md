---
title: 2026-04-24 - align shared neutral theme to docs-ui mockups
type: decision
permalink: video-annotator/decisions/2026-04-24-align-shared-neutral-theme-to-docs-ui-mockups
canonical: true
domain: frontend
aliases:
- shared theme color drift
- review library neutral palette
- docs ui theme alignment
tags:
- decision
- frontend
- theme
- ui
- review
- library
---

# 2026-04-24 - align shared neutral theme to docs-ui mockups

- Date: 2026-04-24

## Decision

Use `docs/ui/video-library.html` and `docs/ui/video-review-1920x1080.png` as source of truth for shared neutral theme tokens. Shared dark surfaces should use the cooler blue-gray mockup palette, not the older warm brown-neutral palette.

## Why

Color drift was not isolated to `video-library`. `video-review` showed the same warm cast because shared frontend tokens in `frontend/src/styles/tokens.css` and body background in `frontend/src/styles/base.css` were warmer than the mockups. Fixing only library-local classes would leave review wrong.

## Consequences

- Shared neutral tokens in frontend should stay aligned to the mockup palette.
- Body and shell background should not add extra warm gradients on top of those tokens.
- Review and library can still use page-specific accent behavior on top of the same neutral base.
- Library state colors remain explicit route-owned mappings and are not part of the shared neutral theme decision.

## Observations

- [decision] Shared neutral surfaces for review and library come from docs-ui mockups, not older warm app tokens. #theme #ui
- [lesson] Brown color drift came mostly from shared surface tokens and body background, not from state accents. #drift #theme
- [boundary] Keep neutral base shared, but keep library state accents route-specific. #library #states

## Relations

- indexed_by [[Decisions Index]]
- relates_to [[2026-04-23 - use docs-ui PNGs for 1920x1080 backlog truth]]
- relates_to [[2026-04-24 - keep library state colors on generic card classes]]
