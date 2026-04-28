---
title: Close stale m-7 task truth
type: note
permalink: video-annotator/tasks/close-stale-m-7-task-truth
id: task-close-stale-m-7-task-truth
status: done
completed: 2026-04-28 15:36:00 CEST
steps:
- creation
- planning
- execution
- wrap_up
tags:
- task
- review
- docker
- m-7
- docs
- roadmap
---

# Close stale m-7 task truth

## Creation Phase

### Description

Audit whether earlier `m-7` container tasks still represent real unfinished work or only stale tracking truth. If Docker backend or frontend runtime contracts already ship, close or reroute those tasks honestly before more roadmap planning builds on wrong backlog state.

Read first:
- [[Workflow]]
- [[Implementation audit and roadmap 2026-04-28]]
- [[m-7: Docker E2E and Release Hardening]]
- [[Support Playwright Docker mode]]
- `backend/Dockerfile.e2e`
- `backend/scripts/docker_e2e_init.sh`
- `frontend/Dockerfile.e2e`
- `.env.docker-e2e`
- `docker-compose.e2e.yml`
- `backend/tests/unit/tooling/test_docker_e2e_backend.py`
- `backend/tests/unit/tooling/test_docker_e2e_compose.py`
- `frontend/tests/unit/tooling/docker-e2e-frontend.test.ts`

Stage-2 rule: in planning phase, write concrete test plan and implementation plan first. In execution, follow written plan. Before `done`, run own review plus 2 subagent reviews and fix actionable findings.

### Scope

- In scope: audit task truth for backend and frontend container slices, close or reroute stale tasks, and update m-7 routing indexes that depend on them
- Out of scope: new Docker runtime behavior beyond small corrections required to make task truth honest

### Affected Features

- [[Video Ingest and Exact-Frame Review]]

### Acceptance Criteria

- [x] Backlog no longer treats already-shipped backend or frontend container work as unresolved without explanation
- [x] Any real leftover Docker gap becomes explicit follow-up task instead of hiding inside stale task wording
- [x] `m-7` milestone and todo routing stay honest after task-truth cleanup

### Test Intent

- Backend: rerun targeted Docker contract checks that prove backend runtime and compose artifact slices already ship
- Frontend: rerun targeted Docker contract checks that prove frontend runtime artifact slice already ships
- Manual: none

### Definition of Done

- [x] Planning phase records concrete tests and implementation plan before code
- [x] Own review plus 2 subagent reviews are recorded and actionable findings are fixed
- [x] Relevant tests and quality checks pass
- [x] Feature notes, task note, and routing indexes are updated honestly when truth changes

## Planning Phase

### Planned Integration Tests

- Backend:
  - run `backend/tests/unit/tooling/test_docker_e2e_backend.py`
  - run `backend/tests/unit/tooling/test_docker_e2e_compose.py`
- Frontend:
  - run `frontend/tests/unit/tooling/docker-e2e-frontend.test.ts`

### Planned E2E Tests

- none; this slice is archive-truth cleanup only

### Planned Implementation

- prove current backend and frontend Docker artifact contracts already ship
- confirm stale container task notes have no execution history and only active-routing references
- delete those zero-history stubs
- update `m-7` and task indexes so open work starts at Playwright Docker mode, Docker commands or docs, and release verification
- close this cleanup task as historical done note after review

### Feature Matrix Updates

- none; durable feature truth does not change in this slice

## Execution Phase

### Implementation Notes

- Audit proved backend container work already ships in `backend/Dockerfile.e2e`, `backend/scripts/docker_e2e_init.sh`, `.env.docker-e2e`, and `docker-compose.e2e.yml`.
- Audit proved frontend container work already ships in `frontend/Dockerfile.e2e`, `.env.docker-e2e`, and `docker-compose.e2e.yml`.
- Repo tooling tests already cover those artifact contracts directly, so remaining `m-7` gap is not base containerization; it is Playwright Docker execution, repo command surface, release verification, and final review.
- Both older container task notes were creation-only stubs with no execution history. Search found only active-routing references in `Todo Tasks Index`, `m-7`, and this cleanup task, so delete matched the zero-history rule.
- Deleted both stale task stubs and rewrote `m-7` routing around remaining real work.
- Spec review flagged unfinished status flow, so this task now closes as historical `done` with done-index routing.
- Quality review flagged loose evidence wording, so verification now separates pre-delete reference proof from post-delete dead-ref proof.

## Wrap-Up Phase

### Verification

- Commands run:
  - `uv run --project backend pytest backend/tests/unit/tooling/test_docker_e2e_backend.py backend/tests/unit/tooling/test_docker_e2e_compose.py -q`
  - `npm --workspace frontend run test -- tests/unit/tooling/docker-e2e-frontend.test.ts`
  - pre-delete reference scan: `rg -n "Containerize backend E2E bootstrap|containerize-backend-e2e-bootstrap|Containerize frontend E2E app|containerize-frontend-e2e-app" -S archive basic-memory`
  - post-delete dead-ref scan: `rg -n "Containerize backend E2E bootstrap|containerize-backend-e2e-bootstrap|Containerize frontend E2E app|containerize-frontend-e2e-app" -S archive basic-memory`
- Results:
  - backend Docker tooling proofs passed
  - frontend Docker tooling proof passed with repo coverage gate
  - pre-delete scan showed the stale task titles or permalinks only in `Todo Tasks Index`, `m-7`, this cleanup task, and the two task stub files themselves
  - post-delete scan showed only the recorded command string in this cleanup note, with no leftover routing references elsewhere
  - own review plus 2 subagent reviews found 2 medium findings; both were fixed before close

### Final Summary

`m-7` no longer carries two fake-open containerization tasks. Backend and frontend Docker artifact work already ship; active roadmap now starts at Playwright Docker mode, Docker command surface, release verification, and final hardening review.

### Completion Gate

- [x] Acceptance Criteria checkboxes updated to match reality
- [x] Definition of Done checkboxes updated to match reality
- [x] Only now may `status` change to `done`
