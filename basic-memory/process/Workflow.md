---
title: Workflow
type: process
canonical: true
domain: workflow
aliases:
- repo workflow
- staged workflow
- implementation workflow
permalink: video-annotator/workflow
tags:
- workflow
---

# Workflow

Canonical staged SOP for implementation work in this repo. Use it when you need to know what belongs in durable memory, what belongs in Backlog versus `archive/`, and what must happen before work is done.

## Durable owners

- `AGENTS.md` is rules and guardrails.
- Feature notes under `features/` own durable capability truth, scope boundaries, contracts, and verification strategy.
- Process notes under `process/` own workflow, plan templates, and archive conventions.
- Schema notes under `schema/` define note metadata and live task or milestone field conventions.
- Backlog tasks and milestones hold live execution truth.
- Archive plan and audit notes plus quarantined pre-calibration process notes and legacy task or milestone snapshots hold history.
- Testing notes under `tests/` hold durable boundary guidance.
- `docs/` are supporting reference only.

## Stage 1: Request Breakdown Session

Use this stage for substantial multi-step work.

### Steps

1. Read `AGENTS.md` and `[[Workflow]]`.
2. Read relevant durable notes and supporting `docs/`.
3. Explore first, then ask only what cannot be derived.
4. Create one plan note under `archive/plans/` and search or create one or more Backlog tasks.
5. Split tasks in dependency order and keep each task small enough for one focused delivery pass.
6. Put enough context in task `Description` and `References` that later execution does not depend on hidden chat history.
7. Create or reuse live Backlog milestones when roadmap grouping matters.
8. Update durable notes only when long-lived truth changes.
9. Stop after handoff unless the user wants execution to continue.

## Stage 2: Task Implementation Session

Use this stage inside one task session.

### Planning before code

1. Read `AGENTS.md`, `[[Workflow]]`, active Backlog task, `[[Task]]`, and owning feature note.
2. Keep prerequisites, scope edges, and why under Backlog `Description`.
3. Keep links, file paths, notes, and read-first material under Backlog `References`.
4. Choose test boundary first from feature truth and `tests/` guidance.
5. Record planning-only tests under Backlog `Implementation Plan > Planned Tests`.
6. Record planned implementation steps under Backlog `Implementation Plan > Implementation Steps`.
7. Keep execution-only updates, blockers, and verification notes under Backlog `Implementation Notes`.
8. Leave PR-style wrap-up under Backlog `Final Summary`.
9. Update durable feature or contract notes only if planning changes long-lived truth.
10. Only then start code.

## Execution Phase

- Follow TDD and keep changes surgical.
- If a task becomes active, set it to `In Progress` in Backlog.
- Keep changes surgical and inside task scope.
- Keep `Implementation Notes` current while work is active.
- Keep durable feature notes current when durable behavior, scope boundaries, contracts, or verification strategy change.

## Wrap-Up Phase

1. Run relevant tests, type checks, and lint.
2. Record exact verification outcomes honestly.
3. Update Backlog task `Final Summary` and affected durable notes.
5. Update supporting docs and durable memory when behavior or contracts changed.
4. Do not mark task done until Acceptance Criteria and Definition of Done match reality.
5. Leave archive task or milestone files untouched unless you are explicitly updating legacy history.

## Search guardrails

- Search canonical leaf notes first.
- Use indexes and templates only for routing.
- Keep routers and templates lean so feature, spec, and test leaves win topical queries.

## Done Checklist

- Relevant tests pass.
- Types and lint pass.
- Backlog wrap-up is complete.
- Owning durable notes are updated when relevant.
- Verification truth is recorded honestly.
- Supporting docs and durable memory are updated when contracts or behavior changed.

## Observations

- [workflow] This note is the canonical staged SOP for substantial implementation work. #workflow
- [boundary] Durable notes own long-lived truth; Backlog owns live task or milestone truth; archive keeps historical snapshots. #process
- [testing] Test boundary choice and planned verification happen before code. #testing
- [retrieval] Search canonical leaf notes first and use indexes or templates only for routing. #search

## Relations

- indexed_by [[Memory Index]]
- indexed_by [[Process Index]]
- relates_to [[Plan Template]]
- relates_to [[Features Index]]
- relates_to [[Plans Index]]
- relates_to [[Task]]
- relates_to [[Milestone]]
- relates_to [[Testing tools]]
