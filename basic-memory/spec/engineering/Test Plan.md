---
title: Test Plan
type: spec
canonical: true
domain: engineering
permalink: video-annotator/spec/engineering/test-plan
tags:
- spec
- engineering
- testing
- verification
---

# Test Plan

This note is the canonical testing strategy for the app and the release test matrix for critical workflows. Goal is simple: prove the backend frame index stays canonical, prove critical review workflows stay deterministic, answer what should we verify before demos or releases, and show how to test video playback without treating browser time as annotation truth.

Unit tests protect small rules that can drift quietly and corrupt later behavior. Keep them fast and narrow around frame index conversions, box normalization, mask serialization, annotation CRUD rules, export generation, and job state transitions. This layer protects math, shape parsing, and state rules before storage, API wiring, or UI timing can hide a defect.

Integration tests protect contracts between decode, persistence, SAM2 services, jobs, and exports. Repeated exact-frame decode for frame `N` should stay byte-stable or checksum-stable, save and reload should preserve annotations, same-frame prompt-box should return a mask on that exact frame, propagation should write the expected frame sequence, and deleting an object should remove dependent frame annotations. This layer answers coverage for critical workflows and the release test matrix because it checks the system behavior users actually depend on.

UI tests protect operator actions and frontend state handling. Verify load sample video, jump to frame, step frame-by-frame, draw box, run SAM2, delete mask, and export flow. Exact-frame correctness needs explicit verification here because browser playback time can drift, round, or race while the product contract says backend-decoded frame index is truth. The UI must only show success when the fetched frame and loaded annotations both match the requested canonical frame index.

Golden tests protect frozen outputs that must not shift across releases. Keep one small fixture video and compare exact frame image hashes, exported JSON, and mask PNG checksums. Release demo checklist should run this acceptance flow end to end: load one sample video, jump to frame 120, draw a box, run SAM2 on that frame, propagate forward 30 frames, erase a region on one propagated frame, then export the result. If any step breaks exact-frame alignment, the release is not acceptable even if the UI still looks plausible.

## Observations
- [goal] Testing strategy proves backend frame index remains canonical across decode, annotation, propagation, and export #verification
- [unit] Unit tests protect local rules such as frame conversions, box normalization, mask serialization, CRUD rules, export generation, and job transitions #testing
- [integration] Integration tests protect exact-frame decode repeatability, persistence reloads, same-frame SAM2 prompting, propagation outputs, and cascade deletion behavior #testing
- [ui] UI tests protect critical operator workflows such as jump, stepping, draw box, delete mask, and export #release
- [golden] Golden tests freeze exact frame images, exported JSON, and mask PNG outputs against one small fixture video #regression
- [acceptance] Release demo flow is load sample video, jump to frame 120, draw box, run SAM2, propagate 30 frames, erase one propagated region, and export #demo
- [risk] Browser video time can drift from canonical frame truth, so exact-frame correctness must be verified explicitly in UI and release checks #frame-index
- [release] A release is not acceptable if exact-frame alignment fails, even when the interface appears visually correct #quality
- [verification] How to test video playback: verify playback helps rough navigation, but exact-frame fetch, annotation reload, and export all stay keyed by backend frame index rather than browser time #playback #frame-index
- [verification] Golden screenshot comparisons should compare approved exact-frame screenshots or image hashes, plus exported JSON and mask PNG checksums, to catch release regressions #golden #release
- [verification] What should we verify before a demo or release: load video, play for context, jump to exact frame, step frames, run same-frame SAM2, propagate, edit one mask, reload persisted annotations, and export #demo #checklist

## Relations
- relates_to [[Frame Indexing Contract]]
- relates_to [[Architecture]]
- relates_to [[Data Model]]
- relates_to [[API]]
- relates_to [[SAM2 Integration]]
- relates_to [[Runbook]]