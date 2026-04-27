---
title: 2026-04-24 - split playback preview from canonical frame and seeded propagation
  range
type: note
permalink: video-annotator/decisions/2026-04-24-split-playback-preview-from-canonical-frame-and-seeded-propagation-range
canonical: true
domain: review
aliases:
- pause snaps back old frame
- propagation seed start end
- review preview frame
- timeline playhead vs range
tags:
- decision
- review
- playback
- frames
- propagation
- sam2
- ui
---

# 2026-04-24 - split playback preview from canonical frame and seeded propagation range

- Date: 2026-04-24

## Decision

Review transport keeps four separate truths.

- `currentFrameIndex`: canonical backend-loaded frame for edit truth.
- `previewFrameIndex`: frame user is currently seeing while playback runs.
- propagation range: explicit `start` and `end`.
- propagation seed: explicit `seed` inside that range.

Playhead is not range bar.
Pause commits previewed frame back through backend exact-frame load.
User-facing review copy should say `exact frame`, not `canonical frame`.

## Why

Old transport mixed current frame, playback preview, and propagation boundary.
That caused bad behavior:
- pause snapped back to old frame
- play resumed from stale frame if backend exact-frame load had not landed yet
- playhead resized propagation range
- range inputs and bar drifted apart
- propagation could start from stale seed `0`

## Consequences

- Timeline playhead follows `previewFrameIndex` only.
- Playback moves thumbnails and indicator, but annotation truth stays on canonical backend frame.
- Pausing or transport jumps load that paused frame as new canonical frame.
- While that paused exact-frame load is pending, preview must stay on the paused frame; do not snap preview back to stale `currentFrameIndex`.
- Start/end inputs and draggable range handles stay synchronized.
- If seed falls outside selected range, frontend snaps it to first annotated frame inside range, else current frame, else range start.
- SAM2 propagation request uses explicit `seed_frame_idx`, `range_start_frame_idx`, `range_end_frame_idx`, and `direction`.
- Selected-object summary uses range-scoped counters:
  - `manual`: distinct frames in range whose persisted source is `manual` or `sam2_edited`
  - `missing`: total frames in range - (`manual` + `propagated`)

## Also locked in same pass

- review thumbnails use real backend frame previews from `GET /api/videos/{video_id}/frame/{frame_idx}?width=...`
- new object dialog owns label plus fixed color palette
- object swatch, box, and mask tint all use same object color
- enabled buttons should show pointer cursor

## Extended in follow-up playback parity pass

- Playback overlays should not disappear just because paused exact-frame data is not loaded for that frame.
- Frontend preloads persisted annotated-frame rows from `GET /api/videos/{video_id}/annotations/annotated-frames` and uses that cache for read-only playback overlays.
- Timeline thumbnails should not issue one request per visible frame slot.
- Frontend uses `/api/videos/{video_id}/thumbnails/sprite` windows and preloads current plus adjacent windows.
- Export create should trigger artifact download immediately from stable `export_id` and still keep fallback link visible.
- Playback video and paused exact frame must share one geometry box so zoom and overlay alignment do not drift.
- Playback video must stay mounted even while paused exact frame is shown, else play loses media ref and does nothing.
- When paused exact-frame load starts for a newer frame, keep old exact frame visible until the newer response wins; ignore stale older responses that resolve later.

## Observations

- [rule] Browser playback time may drive preview UI, but never annotation truth. #frames #playback
- [rule] Propagation seed, range, and playhead are separate controls. #sam2 #propagation #ui
- [rule] Review UI text should say `exact frame`; keep `canonical` as implementation truth only. #ui #wording
- [rule] Selected-object `missing` means total range frames not covered by manual or propagated annotations. #summary #review
- [bug] If pause snaps back or propagation starts from frame `0`, check seed/range coupling first. #debugging #review
- [ui] Bottom thumbnails should track preview frame while playing and canonical frame while paused. #timeline #review
- [rule] Playback overlays come from persisted annotated-frame cache; paused edit overlays still come from exact-frame load. #overlay #review
- [rule] Shared stage geometry matters more than whether visible base media is `<video>` or exact PNG; zoom must move both the same way. #ui #zoom
- [rule] Export create should auto-download from stable `export_id`, not wait for manual fallback click. #export #download
- [rule] Mounted hidden playback video is required for reliable resume-from-pause behavior on review route. #playback #ui
- [bug] If paused frame load flashes video, check exact-frame stale-response guard and hold-old-frame render rule first. #debugging #review

## Relations

- indexed_by [[Decisions Index]]
- relates_to [[2026-04-21 - follow mockup-first single-stage review UI]]
- relates_to [[2026-04-24 - treat advanced review states as separate mockup work]]
- relates_to [[Video Ingest and Exact-Frame Review]]
- relates_to [[SAM2 Shell and Runtime]]
