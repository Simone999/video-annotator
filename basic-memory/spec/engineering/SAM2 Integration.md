---
title: SAM2 Integration
type: spec
canonical: true
domain: engineering
permalink: video-annotator/spec/engineering/sam2-integration
tags:
- spec
- engineering
- sam2
- integration
---

# SAM2 Integration

SAM2 is the assistive mask generation layer for interactive video segmentation in this app. User works on backend-decoded exact frames, starts from a box or refinement prompt, and can ask SAM2 to propagate across a frame range. SAM2 helps create masks fast, but it is not the persistence system: durable truth stays in stored annotations and masks, with backend frame index as canonical frame identity.

Keep SAM2 behind one small adapter boundary so raw predictor state, GPU details, and model-specific calls do not leak into API or UI code. Good mental model is: start a SAM2 session for one local video, reuse that live session while user iterates, then close it explicitly when work ends or the app cleans up idle state. Persist only session or job lifecycle metadata in the database; live predictor internals never belong there. Reuse from the demo should stay focused on session lifecycle logic, predictor wrapper, prompt submission flow, propagation flow, and mask serialization helpers. Internal shape can stay as small as:

```python
class Sam2VideoService:
    def create_session(self, video_path: str) -> str: ...
    def close_session(self, session_id: str) -> None: ...
    def prompt_box(self, session_id: str, frame_idx: int, object_id: int, box_xyxy_px: list[int]) -> MaskResult: ...
    def refine(self, session_id: str, frame_idx: int, object_id: int, positive_points: list[list[float]] | None = None, negative_points: list[list[float]] | None = None, seed_mask: bytes | None = None) -> MaskResult: ...
    def propagate(self, session_id: str, start_frame_idx: int, direction: str, end_frame_idx: int | None = None, object_ids: list[int] | None = None): ...
```

Prompt box refinement flow is same-frame first. User draws a box on the paused review stage, frontend keeps temporary draft state, backend creates or reuses session, SAM2 returns one mask for that exact frame, and UI overlays result for review on the same stage. If user wants to refine a segmentation prompt, refinement stays on that same canonical frame: add positive or negative points, optionally use current mask as seed, re-run SAM2, inspect overlay again, then save only the accepted result into persistent annotation storage. That keeps interactive edits fast without confusing temporary model output with saved annotation truth.

Propagation model is asynchronous assistive tracking, not magic persistence. User picks object and range, backend runs frame-wise propagation from the seeded frame, and frontend polls job state while keeping canonical frame navigation separate from job progress. Final propagated masks must be persisted frame by frame before they matter; reopening a frame should reload persisted annotations and masks, not trust old prompt or job memory. To handle propagation failures, surface concise actionable errors for missing model, GPU unavailable, out-of-memory, cancelled work, decode problems, or corrupt mask output, and keep partial runtime state isolated so failed jobs do not redefine saved data.

Session lifecycle cleanup matters because live predictor state is expensive and local resources are finite. Close sessions explicitly, clear model state on session close, and release GPU memory as much as possible. API routes and DB rows only need to track lifecycle and job metadata at a high level; deeper route and storage detail belongs in [[API]] and [[Data Model]]. For architecture, the key rule is simple: SAM2 produces candidate masks, persistence stores accepted masks, and every reopen path returns to backend-decoded frame indices and persisted annotation reads.

Database persistence stays narrow: `Sam2Session` stores session lifecycle metadata only, and `Job` stores async propagation bookkeeping only. Predictor internals, cached model objects, and other live runtime state remain inside the adapter boundary, not in DB rows.

## Observations
- [decision] SAM2 stays behind a narrow internal adapter so predictor internals and GPU concerns do not leak into API or frontend code #architecture #sam2
- [workflow] Start a SAM2 session per local video, reuse it across prompt and refine calls, and close it explicitly when work ends or cleanup runs #sessions #sam2
- [workflow] Prompt-box and refinement flows operate on the same backend-decoded exact frame inside the single review surface, with temporary overlay review before accepted masks are persisted #prompting #refinement
- [decision] SAM2 is assistive mask generation, not annotation truth; durable truth comes from persisted annotations and masks reopened through normal read paths #persistence #sam2
- [workflow] Propagation runs as frame-wise background work that can be cancelled, polled, and persisted incrementally without changing canonical frame identity #jobs #propagation
- [error_handling] Propagation and prompt flows should return concise actionable failures for missing model, GPU issues, out-of-memory, decode errors, corrupt masks, and cancelled work #ux #sam2
- [reuse] Safe reuse from the demo centers on session lifecycle logic, predictor wrapper, prompt flow, propagation flow, and mask serialization helpers, while demo app structure and frontend UX stay reference-only #reuse #sam2

## Relations
- depends_on [[Architecture]]
- depends_on [[Data Model]]
- depends_on [[API]]
- relates_to [[Frame Indexing Contract]]
- relates_to [[Engineering Index]]
- relates_to [[Frontend Interaction Spec]]
