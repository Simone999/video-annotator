---
title: 'm-7: Docker E2E and Release Hardening'
type: note
status: planned
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

Containerize E2E stack and finish release-readiness verification without relying on tribal local setup.

## What To Implement

- backend and frontend Docker E2E runtime contracts
- compose stack, Playwright Docker mode, and documented command surface
- checkpoint review after five tasks, release verification task, and final review

## Checklist

- [ ] Docker E2E stack runs through explicit command surface
- [ ] Playwright supports Docker mode without breaking host-run E2E
- [ ] milestone reviews fix docs, index, and UI drift found during hardening pass

## Related Features

- [[Video Ingest and Exact-Frame Review]]
- [[SAM2 Shell and Runtime]]
- [[Mask Editing and Cleanup]]
- [[Export]]

## Related Tasks

- [[Raise frontend Vitest branch coverage to 90]]
- [[Containerize backend E2E bootstrap]]
- [[Containerize frontend E2E app]]
- [[Add Docker Compose E2E stack]]
- [[Support Playwright Docker mode]]
- [[Add Docker E2E commands and docs]]
- [[Review m-7 hardening checkpoint]]
- [[Run release verification workflow]]
- [[Review m-7 parity and drift]]

## Observations

- [status] m-7 keeps blocked import scope out of release-hardening dependency path #m-7 #blocked
- [status] milestone includes checkpoint review after task five and final review after release verification #m-7 #review
