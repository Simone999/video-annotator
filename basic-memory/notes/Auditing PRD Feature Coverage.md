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
- `[[Review Workspace Ergonomics]]`
- `[[Annotation Foundation and Manual Box Workflow]]`
- `[[SAM2 Shell and Runtime]]`
- `[[Mask Editing and Cleanup]]`
- `[[Export]]`
- `[[Import Existing Boxes]]`

## Coverage Matrix

| PRD area | Owning note(s) | Coverage after pass | Notes |
| --- | --- | --- | --- |
| open library, choose video, enter review | `[[Video Ingest and Exact-Frame Review]]`, `[[Review Workspace Ergonomics]]` | covered | ingest note owns backend video selection and exact-frame truth; ergonomics note owns library card and navigation semantics |
| jump to exact frame and step both directions | `[[Video Ingest and Exact-Frame Review]]` | covered | canonical backend `frame_idx` remains explicit |
| draw, edit, delete box on paused canonical frame | `[[Annotation Foundation and Manual Box Workflow]]` | covered | paused-only rule now explicit in feature note |
| generate mask from reviewer box on one frame | `[[SAM2 Shell and Runtime]]` | covered | prompt now documented as reviewer-box prompt on paused canonical frame |
| propagate through selected frame range | `[[SAM2 Shell and Runtime]]`, `[[Review Workspace Ergonomics]]` | covered | selected-range wording now explicit |
| correct or delete bad masks | `[[Mask Editing and Cleanup]]` | covered | note is honest that runtime is still blocked |
| export final annotations as JSON plus PNG masks | `[[Export]]` | covered | note owns deterministic export and `exported` state semantics |
| import existing boxes as seed review data | `[[Import Existing Boxes]]` | covered | user-visible import path no longer treated as optional |
| library state model, transitions, progress-bar rule, card fields | `[[Review Workspace Ergonomics]]` | covered | note now carries full PRD card, state, and inspector detail |
| selected-object inspector fields, counter meanings, confidence rule | `[[Review Workspace Ergonomics]]`, `[[SAM2 Shell and Runtime]]` | covered | ergonomics note owns UI field list; SAM2 note owns prompt and propagation semantics |
| local-first single-user workflow | `[[Product Requirements]]` | cross-cutting | global product rule, not one leaf feature |
| backend-decoded frame index is annotation truth | `[[Product Requirements]]`, `[[Video Ingest and Exact-Frame Review]]`, `[[Annotation Foundation and Manual Box Workflow]]`, `[[SAM2 Shell and Runtime]]` | covered | global rule reinforced in feature notes where action happens |

## Drift Fixed In This Pass

- `[[Video Ingest and Exact-Frame Review]]` no longer claims live review still opens into split-pane harness.
- `[[Review Workspace Ergonomics]]` now carries explicit library card fields, review states, state transitions, progress-bar rule, inspector fields, counter meanings, and confidence rule from PRD.
- `[[Annotation Foundation and Manual Box Workflow]]` now says manual box mutate actions are paused-only on canonical current frame.
- `[[SAM2 Shell and Runtime]]` now says prompt uses reviewer box on paused frame and propagation uses selected frame range.
- `[[Import Existing Boxes]]` now treats user-visible import as required product scope instead of optional future UI.

## Remaining Missing Work

Memory coverage is now complete for PRD feature surface. Missing items below are runtime or contract work, not note-ownership gaps:

- current-pipeline field mapping still blocks import implementation
- live review still lacks selected-range controls and selected-object summary wiring
- `mask_confidence` and `track_summary.corrected` remain partially blocked by missing persistence truth
- default SAM2 runtime still raises `NotImplementedError` for real prompt and propagation
- mask editing and cleanup workflows remain unshipped
- export create, download, and stale-export derivation remain unshipped

## Observations
- [coverage] After this pass, leaf feature notes plus explicit product-owned cross-cutting rules cover full PRD feature surface #prd #coverage
- [drift] Review workspace note now owns library card field set, state model, progress-bar rule, and inspector semantics from PRD #library #inspector #prd
- [drift] Video ingest note no longer claims stale split-pane live review path #review #ux #drift
- [drift] Import note now treats user-visible import as required product scope #import #prd
- [status] Remaining problems are implementation gaps in import mapping, live selected-range summary UI, SAM2 runtime, mask editing, and export, not feature-memory gaps #status #gaps
- [ownership] Local-first single-user workflow and canonical backend frame truth remain cross-cutting product rules; feature notes reinforce them where actions happen #product #frames #ownership

## Relations
- indexed_by [[Notes Index]]
- relates_to [[PRD Completeness Audit]]
- relates_to [[Product Requirements]]
- relates_to [[Frontend Interaction Spec]]
- relates_to [[Video Ingest and Exact-Frame Review]]
- relates_to [[Review Workspace Ergonomics]]
- relates_to [[Annotation Foundation and Manual Box Workflow]]
- relates_to [[SAM2 Shell and Runtime]]
- relates_to [[Mask Editing and Cleanup]]
- relates_to [[Export]]
- relates_to [[Import Existing Boxes]]