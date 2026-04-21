---
title: Testing toolchain alignment plan
type: plan
status: done
permalink: video-annotator/plans/testing-toolchain-alignment-plan
tags:
- plan
- testing
- tooling
---

# Testing toolchain alignment plan

Align repo manifests, shared test setup, and docs with durable `[[Testing tools]]` guidance so named tools are actually installable and usable.

## Summary
- Goal: install missing testing tools and add minimum wiring so future tasks can use them without one-off setup
- Success criteria: missing tooling from `[[Testing tools]]` is declared in manifests, shared setup exists for frontend and backend helpers, Storybook builds, and docs plus memory match repo truth
- Audience: agents and developers adding frontend integration, backend persistence, and UI-isolation tests

## Current State
- Existing behavior: repo already runs `pytest`, `Vitest`, and `Playwright`; frontend has no shared Vitest setup file, no MSW server scaffold, no Storybook config, and backend has no factory helpers
- Main gaps: `@testing-library/user-event`, `@testing-library/jest-dom`, `msw`, `storybook`, `@storybook/react-vite`, and `factory-boy` are named in memory but missing from declared project dependencies
- Constraints: backend-decoded frame index stays canonical, changes must stay local-first, and tooling work must not silently rewrite unrelated feature behavior

## Assumptions And Open Questions
- Locked assumptions:
  - `all testing tools` means guidance-set scope from `[[Testing tools]]`, not only already-installed runners
  - minimum usable setup is enough; no Chromatic, no visual-regression service, no Storybook addon sprawl, and no MSW Storybook addon in this slice
  - root `package-lock.json` remains canonical for npm workspace installs
- Open questions:
  - none

## Affected Features
- [[Testing tools]]

## Task Breakdown
1. [[Installing testing tools]] — aligns manifests, shared setup, Storybook scaffold, docs, and durable testing notes

## Handoff Notes
- Read `[[Workflow]]`, `[[Testing tools]]`, and `docs/runbooks/dev-setup.md` before changing manifests or docs
- Follow red-green cycles for new tooling smoke tests before touching production config
- Keep Storybook scope to one smoke story around an existing component instead of inventing new UI
