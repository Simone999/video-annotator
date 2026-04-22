---
title: Auditing PRD Feature Coverage
type: note
permalink: video-annotator/notes/auditing-prd-feature-coverage
tags:
- notes
- prd
- feature
- audit
- drift
---

# Auditing PRD Feature Coverage

Audit date: 2026-04-21.

This audit compares `docs/product/prd.md` against leaf feature notes in `basic-memory/features/`. Goal: check whether feature memory, not only product spec notes, covers PRD surface, then fix drift where feature notes lag product truth.

## Extracted Features

- `[[Video Ingest and Exact-Frame Review]]`
- `[[Annotation Foundation and Manual Box Workflow]]`
- `[[SAM2 Shell and Runtime]]`
- `[[Mask Editing and Cleanup]]`
- `[[Export]]`
- `[[Import Existing Boxes]]`

## Coverage Matrix

| PRD area | Owning note(s) | Coverage after pass | Notes |
| --- | --- | --- | --- |
| open library, choose video, enter review | `[[Video Ingest and Exact-Frame Review]]` | covered | ingest note owns route-owned library entry, direct review routing, and canonical frame truth |
| jump to exact frame and step both directions | `[[Video Ingest and Exact-Frame Review]]` | covered | canonical backend `frame_idx` remains explicit |
| draw, edit, delete box on paused canonical frame | `[[Annotation Foundation and Manual Box Workflow]]` | covered | paused-only rule now explicit in feature note |
| generate mask from reviewer box on one frame | `[[SAM2 Shell and Runtime]]` | covered | prompt now documented as reviewer-box prompt on paused canonical frame |
| propagate through selected frame range | `[[SAM2 Shell and Runtime]]` | covered | selected-range wording now explicit in the SAM2 feature note |
| correct or delete bad masks | `[[Mask Editing and Cleanup]]` | covered | note is honest that runtime is still blocked |
| export final annotations as JSON plus PNG masks | `[[Export]]` | covered | note owns deterministic export and `exported` state semantics |
| import existing boxes as seed review data | `[[Import Existing Boxes]]` | covered | user-visible import path no longer treated as optional |
| library state model, transitions, progress-bar rule, card fields | `[[Video Ingest and Exact-Frame Review]]`, `[[Export]]` | covered | ingest note now owns library card and review-state truth up to `exported`, while export note owns real `exported` derivation |
| selected-object inspector fields, counter meanings, confidence rule | `[[SAM2 Shell and Runtime]]` | covered | SAM2 note now owns inspector summary field set, selected-range counter meaning, and confidence rule, even though implementation still sits in roadmap tasks |
| local-first single-user workflow | `[[Product Requirements]]` | cross-cutting | global product rule, not one leaf feature |
| backend-decoded frame index is annotation truth | `[[Product Requirements]]`, `[[Video Ingest and Exact-Frame Review]]`, `[[Annotation Foundation and Manual Box Workflow]]`, `[[SAM2 Shell and Runtime]]` | covered | global rule reinforced in feature notes where action happens |

## Drift Fixed In This Pass

- `[[Video Ingest and Exact-Frame Review]]` no longer claims live review still opens into split-pane harness.
- `[[Annotation Foundation and Manual Box Workflow]]` now says manual box mutate actions are paused-only on canonical current frame.
- `[[SAM2 Shell and Runtime]]` now says prompt uses reviewer box on paused frame and propagation uses selected frame range.
- `[[Import Existing Boxes]]` now treats user-visible import as required product scope instead of optional future UI.

## Remaining Missing Work

Feature-note ownership is whole again. Remaining work is implementation or contract gap only:

- live review still lacks selected-range controls and selected-object summary wiring
- `mask_confidence` and selected-range summary truth still need real persistence and runtime wiring
- default SAM2 runtime still raises `NotImplementedError` for real prompt and propagation
- mask editing and cleanup workflows remain unshipped
- export create, download, and stale-export derivation remain unshipped
- current-pipeline field mapping still blocks import implementation

## Observations
- [coverage] Leaf feature-note PRD coverage is whole again after routing library semantics to `[[Video Ingest and Exact-Frame Review]]` plus `[[Export]]` and inspector semantics to `[[SAM2 Shell and Runtime]]` #prd #coverage
- [drift] Video ingest note no longer claims stale split-pane live review path #review #ux #drift
- [drift] Import note now treats user-visible import as required product scope #import #prd
- [status] Remaining problems are implementation or contract gaps in live selected-range summary UI, SAM2 runtime, mask editing, export, and import mapping #status #gaps
- [ownership] Local-first single-user workflow and canonical backend frame truth remain cross-cutting product rules; feature notes reinforce them where actions happen #product #frames #ownership

## Relations
- indexed_by [[Notes Index]]
- relates_to [[PRD Completeness Audit]]
- relates_to [[Product Requirements]]
- relates_to [[Frontend Interaction Spec]]
- relates_to [[Video Ingest and Exact-Frame Review]]
- relates_to [[Annotation Foundation and Manual Box Workflow]]
- relates_to [[SAM2 Shell and Runtime]]
- relates_to [[Mask Editing and Cleanup]]
- relates_to [[Export]]
- relates_to [[Import Existing Boxes]]
