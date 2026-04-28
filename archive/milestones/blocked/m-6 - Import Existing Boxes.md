---
title: 'm-6: Import Existing Boxes'
type: note
status: blocked
permalink: video-annotator/milestones/m-6-import-existing-boxes
tags:
- milestone
- roadmap
- import
- blocked
---

# m-6: Import Existing Boxes

## Goal

Import current-pipeline boxes into durable review state without guessing field meaning. Milestone stays blocked until canonical import contract exists, including overwrite or reset semantics for reimport.

## What To Implement

- resolve current-pipeline mapping plus reimport overwrite or reset semantics first
- land importer, route, validation, state transitions, and frontend entry only after contract truth exists
- finish with milestone review once import work is real

## Checklist

- [ ] canonical import contract exists before importer code starts
- [ ] import writes map deterministically into object and frame annotation storage
- [ ] reimport over reviewed or exported work resets state per contract rules
- [ ] milestone review fixes docs, index, and UI drift after import scope lands

## Related Features

- [[Import Existing Boxes]]
- [[Video Ingest and Exact-Frame Review]]
- [[Annotation Foundation and Manual Box Workflow]]

## Related Tasks

- [[Define current-pipeline import contract]]
- [[Implement importer translation service]]
- [[Add import API and validation]]
- [[Wire import review-state transitions]]
- [[Add frontend import entry]]
- [[Review m-6 parity and drift]]

## Observations

- [status] m-6 remains blocked on external import-contract truth, not on coding effort alone #m-6 #blocked
- [status] downstream import tasks stay blocked until contract task lands durable mapping plus reimport-reset note #m-6 #contract
