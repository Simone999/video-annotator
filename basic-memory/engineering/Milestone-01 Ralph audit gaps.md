---
title: Milestone-01 Ralph audit gaps
type: note
permalink: video-annotator/engineering/milestone-01-ralph-audit-gaps
tags:
- milestone-01
- ralph
- review
---

# Milestone-01 Ralph audit gaps

Audited `tools/ralph/prd.json` against `docs/plans/milestone-01-exact-frame-review.md`, current backend/frontend code, and current docs.

Current stories `US-001` through `US-009` map to real code, tests, and docs. Main gap is integration, not feature absence. Backend startup in `backend/app/main.py` only bootstraps DB and never runs indexing service, so real app boot cannot discover local videos without manual DB seeding. Second gap is validation depth: UI browser checks in progress log use intercepted API responses, but milestone plan requires manual validation on at least one real video.

I added two new Ralph stories to cover this:
- `US-010` wire indexing into backend startup
- `US-011` run real-video milestone validation

## Observations
- [decision] Keep `US-001` through `US-009` marked passed because each story's scoped acceptance criteria is implemented in code/tests/docs #ralph
- [gap] Milestone acceptance is still blocked because backend startup never calls indexing service #backend #startup
- [gap] Current browser verification is mocked, so milestone validation still needs one real local-video pass #frontend #validation
- [task] `US-010` should add startup indexing plus test coverage through `create_app()` lifecycle #milestone-01
- [task] `US-011` should prove open video, playback, jump-to-frame, prev/next, and stable repeated frame loads on real input #milestone-01

## Relations
- relates_to [[US-002 backend video indexing service]]
- relates_to [[US-006 frontend video list selection patterns]]
- relates_to [[US-007 playback pane and metadata panel patterns]]
- relates_to [[US-008 exact frame pane and jump input patterns]]
- relates_to [[US-009 previous and next exact frame navigation patterns]]
