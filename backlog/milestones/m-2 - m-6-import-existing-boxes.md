---
id: m-2
title: "m-6: Import Existing Boxes"
---

## Description

### Goal
Import current-pipeline boxes into durable review state without guessing field meaning. Milestone stays blocked until canonical import contract exists, including overwrite or reset semantics for reimport.

### What To Implement
- resolve current-pipeline mapping plus reimport overwrite or reset semantics first
- land importer, route, validation, state transitions, and frontend entry only after contract truth exists
- finish with milestone review once import work is real

### Related Features
- [[Import Existing Boxes]]
- [[Video Ingest and Exact-Frame Review]]
- [[Annotation Foundation and Manual Box Workflow]]

### Ordering And Dependencies
- Resolve the canonical current-pipeline contract before importer translation or any API or UI work.
- Land importer translation before the API route, then finish review-state transitions and frontend entry on top of that path.
- Run the milestone review only after the contract, importer, API, state-transition, and frontend tasks land.

### Historical Source
- Original archive note: `archive/milestones/blocked/m-6 - Import Existing Boxes.md`
- Original archive status: `blocked`
