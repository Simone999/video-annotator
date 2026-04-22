---
title: Implement importer translation service
type: note
permalink: video-annotator/tasks/implement-importer-translation-service
id: task-implement-importer-translation-service
status: blocked
completed:
steps:
- creation
- planning
- execution
- wrap_up
tags:
- task
- blocked
- backend
- import
- m-6
---

# Implement importer translation service

## Creation Phase

### Description

Implement deterministic importer translation from current-pipeline records into ObjectTrack and FrameAnnotation primitives. Blocked until `[[Define current-pipeline import contract]]` lands real mapping truth.

Read first:
- [[Workflow]]
- [[Import Existing Boxes]]
- [[Import Contract]]
- [[Annotation Foundation and Manual Box Workflow]]
- `backend/app/services/object_tracks.py`
- `backend/app/services/manual_frame_annotations.py`

Stage-2 rule: in planning phase, write concrete test plan and implementation plan first. In execution, follow written plan. Before `done`, run own review plus 2 subagent reviews and fix actionable findings.

### Scope

- In scope: translation service only, with deterministic object/frame mapping from canonical import contract
- Out of scope: API route, UI, or guessed field semantics

### Affected Features

- [[Import Existing Boxes]]
- [[Annotation Foundation and Manual Box Workflow]]

### Acceptance Criteria

- [ ] Importer service translates mapped source fields into stable object and frame annotation primitives
- [ ] Translation is deterministic for repeated identical input
- [ ] Task stays blocked until contract note exists and is linked in planning

### Test Intent

- Backend: integration coverage for translation correctness once contract unblocks
- Frontend: none
- Manual: none

### Definition of Done

- [ ] Planning phase records concrete tests and implementation plan before code
- [ ] Own review plus 2 subagent reviews are recorded and actionable findings are fixed
- [ ] Relevant tests and quality checks pass
- [ ] Feature notes, task note, and routing indexes are updated honestly when truth changes

## Planning Phase

### Planned Integration Tests

### Planned E2E Tests

### Planned Implementation

### Feature Matrix Updates

## Execution Phase

### Implementation Notes

## Wrap-Up Phase

### Verification

- Commands run:
- Results:

### Final Summary

### Completion Gate

- [ ] Acceptance Criteria checkboxes updated to match reality
- [ ] Definition of Done checkboxes updated to match reality
- [ ] Only now may `status` change to `done`
