---
title: 'm-7: Docker E2E and Release Hardening'
type: note
status: in_progress
permalink: video-annotator/milestones/m-7-docker-e2e-and-release-hardening
tags:
- milestone
- roadmap
- docker
- tests
- release
---

# m-7: Docker E2E and Release Hardening

## Goal

Finish release-readiness verification for the shipped Docker E2E path without relying on tribal local setup.

## What To Implement

- resolve or explicitly accept the unresolved canonical Docker release-path blocker in the release-signoff environment

## Checklist

- [x] Docker E2E stack runs through explicit command surface
- [x] Playwright supports Docker mode without breaking host-run E2E
- [x] milestone reviews fix docs, index, and UI drift found during hardening pass
- [x] release verification captures fresh host evidence and fresh honest Docker blocker evidence
- [ ] canonical Docker release path runs cleanly in the release-signoff environment

## Related Features

- [[Video Ingest and Exact-Frame Review]]
- [[SAM2 Shell and Runtime]]
- [[Mask Editing and Cleanup]]
- [[Export]]

## Related Tasks

- [[Raise frontend Vitest branch coverage to 90]]
- [[Stabilize frontend Vitest media environment and clean per-test teardown]]
- [[Add Docker Compose E2E stack]]
- [[Close stale m-7 task truth]]
- [[Support Playwright Docker mode]]
- [[Add Docker E2E commands and docs]]
- [[Review m-7 hardening checkpoint]]
- [[Run release verification workflow]]
- [[Review m-7 parity and drift]]

## Observations

- [status] m-7 keeps blocked import scope out of release-hardening dependency path #m-7 #blocked
- [status] backend and frontend Docker runtime contracts plus compose stack already ship, and Playwright Docker mode plus documented command surface now ship; fresh host verification and fresh Docker-daemon blocker evidence now exist in task history, and the only remaining open item is unresolved canonical Docker release-path proof in the release-signoff environment #m-7 #status
- [status] milestone includes checkpoint review after the first shipped hardening slice and final review after release verification #m-7 #review
