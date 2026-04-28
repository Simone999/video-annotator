---
title: Review m-7 parity and drift
type: note
permalink: video-annotator/tasks/review-m-7-parity-and-drift
id: task-review-m-7-parity-and-drift
status: done
completed: 2026-04-28 18:39:00 CEST
steps:
- creation
- planning
- execution
- wrap_up
tags:
- task
- review
- tests
- release
- m-7
- docs
---

# Review m-7 parity and drift

## Creation Phase

### Description

Review full m-7 code, docs, memory routing, and UI after hardening plus release verification land. Fix actionable drift in same task.
Treat committed `docs/ui/video-library.png` and `docs/ui/video-review-1920x1080.png` as current 1920x1080 route truth during final review. Use matching HTML mockups as guides only, not strict contract.

Read first:
- [[Workflow]]
- [[Spec and PRD roadmap parity audit 2026-04-22]]
- `basic-memory/tests/e2e-tests.md`
- `docs/ui/video-library.png`
- `docs/ui/video-library.html`
- `docs/ui/video-review-1920x1080.png`
- `docs/ui/video-review.html`
- all linked m-7 task notes

Stage-2 rule: in planning phase, write concrete test plan and implementation plan first. In execution, follow written plan. Before `done`, run own review plus 2 subagent reviews and fix actionable findings.

### Scope

- In scope: final hardening review, docs or memory drift, stale links, and residual 1920x1080 library/review UI mismatches found after release verification
- Out of scope: new post-m-7 feature scope or redesigning current library/review shells

### Affected Features

- [[Video Ingest and Exact-Frame Review]]
- [[SAM2 Shell and Runtime]]
- [[Mask Editing and Cleanup]]
- [[Export]]

### Acceptance Criteria

- [x] Run own review plus 2 subagent reviews and fix actionable findings before close
- [x] Feature notes, milestone notes, and task indexes match final hardening truth
- [x] Final m-7 review confirms current library and review UI still match committed 1920x1080 PNG direction; matching HTML files stay guides only
- [x] Verification evidence records final release-readiness status honestly, including any blocked import tail

### Test Intent

- Backend: rerun targeted final backend verification after review fixes
- Frontend: rerun targeted final frontend or browser verification after review fixes
- Manual: run final browser or Docker E2E smoke at 1920x1080 if review changes release path

### Definition of Done

- [x] Planning phase records concrete tests and implementation plan before code
- [x] Own review plus 2 subagent reviews are recorded and actionable findings are fixed
- [x] Relevant tests and quality checks pass
- [x] Feature notes, task note, and routing indexes are updated honestly when truth changes

## Planning Phase

### Planned Integration Tests

- rerun only checks touched by final review fixes
- if routing-only fixes land, no product test rerun is required beyond readback and grep verification

### Planned E2E Tests

- rerun final host browser smoke only if final review changes route-facing code or release-readiness claims
- rerun final docker command only if final review changes Docker workflow wording or command surface

### Planned Implementation

- Step 1: normalize task scope away from Ralph and gather final `m-7` truth from milestone note, done task history, release verification note, durable E2E testing memory, and current UI evidence
- Step 2: run own final parity review for milestone closeout truth, routing drift, stale links, and any mismatch between release evidence and current `m-7` wording
- Step 3: run one spec-review subagent and one quality-review subagent on the same final review scope
- Step 4: fix only actionable parity drift and set final `m-7` status honestly
- Step 5: rerun touched checks if needed, then close this task and route the next archive-cleanup tasks

### Feature Matrix Updates

- none expected unless final review changes active milestone or roadmap-routing truth

## Execution Phase

### Implementation Notes

- Own final review found live closeout drift, not new product defects.
  - todo routing still talked like release verification was queued, not already shipped
  - this task still said `release-ready` UI even though overall Docker release-path signoff is still blocked
  - `m-7` milestone wording still implied final review was the remaining open work instead of unresolved Docker signoff
- Spec review found the dated implementation audit note had become stale enough to misroute readers after shipped hardening work. Added a superseded update at the top of that audit note.
- Quality review found release-verification wording that was too green about the Docker path. Tightened that task note so it now says Docker blocker evidence exists, not Docker proof is green.
- Final milestone truth after fixes:
  - current library and review UI still match committed `docs/ui` PNG direction, backed by fresh clean-env screenshots in the release-verification task history
  - import remains blocked and out of verified release scope
  - host-verified release surface is green
  - canonical Docker release-path signoff is still unresolved in this workspace, so `m-7` stays `in_progress` with one unchecked checklist item instead of being marked done
- Updated active routing to match that truth.
  - `m-7` now says the only remaining open item is unresolved canonical Docker release-path proof in the release-signoff environment
  - todo routing now points queued backlog behind the active `m-7` closeout state instead of pretending more `m-7` task slices remain
  - this review task removes the stale Ralph reference from its own acceptance text and closes as done history

## Wrap-Up Phase

### Verification

- Commands run:
- `sed -n '1,220p' archive/milestones/in_progress/m-7 - Docker E2E and Release Hardening.md`
- `sed -n '1,220p' archive/tasks/done/Run release verification workflow.md`
- `sed -n '1,220p' archive/notes/Implementation audit and roadmap 2026-04-28.md`
- `rg -n "release-ready library|checkpoint review, release verification, and final review|canonical Docker release-path proof|host-verified v1 surface" archive`
- Results:
- final review was routing-only after release verification, so no product test rerun was needed
- readback confirmed current library and review route parity evidence already exists in the done release-verification task, including clean-env 1920x1080 screenshots
- readback confirmed `m-7` no longer reads as fully complete; milestone keeps unresolved canonical Docker release-path proof explicit
- readback confirmed the dated implementation audit now self-routes as historical context instead of live remaining-work truth
- own review plus 2 subagent reviews ran for this task
  - one spec reviewer found the dated audit note stale after shipped hardening work
  - one quality reviewer found release-verification wording too green about the Docker path

### Final Summary

Final `m-7` parity review found no new feature gaps. Library and review UI direction still match the committed 1920x1080 PNGs, host release evidence is green, blocked import stays honest, and the only remaining open `m-7` item is canonical Docker release-path signoff in the target release environment. Because that proof is still unresolved here, `m-7` remains `in_progress` instead of closing as done.

### Completion Gate

- [x] Acceptance Criteria checkboxes updated to match reality
- [x] Definition of Done checkboxes updated to match reality
- [x] Only now may `status` change to `done`
