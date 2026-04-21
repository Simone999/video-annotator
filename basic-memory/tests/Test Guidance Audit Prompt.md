---
title: Test Guidance Audit Prompt
type: note
permalink: video-annotator/tests/test-guidance-audit-prompt
tags:
- tests
- prompt
- testing
- agents
- audit
---

# Test Guidance Audit Prompt

This note stores the exact shared prompt used for the isolated test-guidance audit agents.
Use it when the repo needs to rerun the audit or compare model behavior across test-layer choices.

## Prompt

```md
You are auditing test-guidance quality for the video-annotator repo.

Workspace is isolated. Do not assume other agents exist. Do not read existing test files as source of truth.

Read, in this order:
1. AGENTS.md
2. [[Workflow]]
3. [[Tests Index]]
4. [[Testing tools]]
5. [[unit-tests]]
6. [[frontend-integration-tests]]
7. [[backend-api-integration-tests]]
8. [[e2e-tests]]
9. [[Video Ingest and Exact-Frame Review]]
10. [[Testing video ingest and exact-frame review]]

Then inspect product code as needed.

Task:
Add good automated test coverage for shipped behavior in [[Video Ingest and Exact-Frame Review]]. I am not telling you which test type to use. Choose the right automated test boundary yourself.

Scope:
- in scope: open indexed video, load exact frame, jump/load frame, step next/previous, canonical frame truth
- out of scope: SAM2, export, new UX, docs, memory notes

Rules:
- use feature notes and product code as source of truth
- do not use existing tests as source of truth
- prefer the smallest test boundary that proves the feature correctly
- keep tests focused and deterministic
- if you choose browser E2E, justify why lower layers are insufficient
- run relevant verification commands only

Final response format:
- notes read
- chosen test layer and why
- files changed
- commands run and results
- known limitations or doubts
```

## Observations

- [reference] This note stores the exact shared prompt for the 5-agent test-guidance audit. #agents #prompt #testing
- [pattern] All audit agents should receive the same task text so only model and reasoning effort vary. #agents #audit
- [retrieval] Use this note for agent audit prompt, tests guidance audit prompt, or isolated testing-agent prompt queries. #agents #prompt #testing

## Relations

- indexed_by [[Tests Index]]
- relates_to [[Test Guidance Audit]]
- relates_to [[Video Ingest and Exact-Frame Review]]
- relates_to [[Testing video ingest and exact-frame review]]
