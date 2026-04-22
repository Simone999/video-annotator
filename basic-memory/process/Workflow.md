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

Canonical staged SOP for implementation work in this repo. Use it when you need to know what belongs in durable memory, what belongs in `archive/`, and what must happen before work is done.

## Durable owners

- `AGENTS.md` is rules and guardrails.
- Feature notes under `features/` own durable capability truth, scope boundaries, contracts, and verification strategy.
- Process notes under `process/` own workflow, templates, and archive conventions.
- Schema notes under `schema/` define note metadata.
- Archive task, plan, milestone, and audit notes hold transient execution truth.
- Testing notes under `tests/` hold durable boundary guidance.
- `docs/` are supporting reference only.

## Stage 1: Request Breakdown Session

Use this stage for substantial multi-step work.

### Steps

1. Read `AGENTS.md` and `[[Workflow]]`.
2. Read relevant durable notes and supporting `docs/`.
3. Explore first, then ask only what cannot be derived.
4. Create one plan note under `archive/plans/` and one or more task notes under `archive/tasks/`.
5. Update durable notes only when long-lived truth changes.
6. Stop after handoff unless the user wants execution to continue.

## Stage 2: Task Implementation Session

Use this stage inside one task session.

### Planning before code

1. Read `AGENTS.md`, `[[Workflow]]`, the archive task note, and the owning feature note.
2. Choose test boundary first from feature truth and `tests/` guidance.
3. Record planned tests and planned implementation in the task note.
4. Update durable feature or contract notes only if planning changes long-lived truth.
5. Only then start code.

## Execution Phase

- Follow TDD and keep changes surgical.
- If a task becomes active, move it into `archive/tasks/in_progress/`.
- Keep changes surgical and inside task scope.
- Keep archive task notes current while work is active.
- Keep durable feature notes current when durable behavior, scope boundaries, contracts, or verification strategy change.

## Wrap-Up Phase

1. Run relevant tests, type checks, and lint.
2. Record exact verification outcomes honestly.
3. Update archive task wrap-up and affected durable notes.
5. Update supporting docs and durable memory when behavior or contracts changed.
4. Do not set task `status: done` until Acceptance Criteria and Definition of Done match reality.
5. Move the task note into the archive folder that matches its final status.

## Search guardrails

- Search canonical leaf notes first.
- Use indexes and templates only for routing.
- Keep routers and templates lean so feature, spec, and test leaves win topical queries.

## Done Checklist

- Relevant tests pass.
- Types and lint pass.
- Archive wrap-up is complete.
- Owning durable notes are updated when relevant.
- Verification truth is recorded honestly.
- Supporting docs and durable memory are updated when contracts or behavior changed.

## Observations

- [workflow] This note is the canonical staged SOP for substantial implementation work. #workflow
- [boundary] Durable notes own long-lived truth; archive notes own concrete execution history. #process
- [testing] Test boundary choice and planned verification happen before code. #testing
- [retrieval] Search canonical leaf notes first and use indexes or templates only for routing. #search

## Relations

- indexed_by [[Memory Index]]
- indexed_by [[Process Index]]
- relates_to [[Plan Template]]
- relates_to [[Features Index]]
- relates_to [[Tasks Index]]
- relates_to [[Plans Index]]
- relates_to [[Milestones Index]]
- relates_to [[Task Template]]
- relates_to [[Testing tools]]
