---
title: 2026-04-23 - use docs-ui PNGs for 1920x1080 backlog truth
type: decision
canonical: true
domain: decisions
aliases:
- 1920x1080 backlog truth
- docs ui png truth
- ui backlog screenshots
permalink: video-annotator/decisions/2026-04-23-use-docs-ui-pngs-for-1920x1080-backlog-truth
tags:
- decision
- frontend
- ui
- backlog
- verification
---

# 2026-04-23 - use docs-ui PNGs for 1920x1080 backlog truth

- Date: 2026-04-23

## Decision

Use committed `docs/ui/video-library.png` and `docs/ui/video-review-1920x1080.png` as current 1920x1080 UI truth for backlog work that touches visible library or review UI. Use `docs/ui/video-library.html` and `docs/ui/video-review.html` as supporting guides only, not strict contract.

## Why

Current route-polish tasks already locked live `/` and `/review/:videoId` against committed PNG direction. Open backlog work after that mostly adds behavior inside shipped shells, so those tasks must not silently redesign current 1920x1080 layout while landing new controls. HTML mockups still help placement and density questions, but they are easier to drift and should not override committed route-truth captures.

## Consequences

- UI-touching todo tasks and Ralph stories must reference matching PNG truth and require 1920x1080 browser verification.
- Review or parity tasks must treat PNG drift as actionable even when behavior tests stay green.
- Backend-only, Docker-only, and blocked import tasks do not need UI wording unless they start changing visible route behavior.

## Observations

- [decision] Committed `docs/ui` PNGs own current 1920x1080 library and review UI truth for backlog enforcement. #decision #ui #backlog
- [rule] Matching `docs/ui` HTML files guide layout interpretation but do not override PNG route truth. #ui #mockup
- [scope] Only backlog work that changes visible route UI needs this 1920x1080 enforcement wording. #tasks #ui
- [verification] Browser proof for affected tasks should call out 1920x1080 route checks explicitly. #verification #dev-browser

## Relations

- indexed_by [[Decisions Index]]
- relates_to [[2026-04-21 - follow mockup-first single-stage review UI]]
- relates_to [[Frontend Interaction Spec]]
- relates_to [[Video Ingest and Exact-Frame Review]]
- relates_to [[Using dev-browser for browser smoke verification]]
