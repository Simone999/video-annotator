---
title: Product Requirements
type: note
permalink: video-annotator/spec/product/product-requirements
tags:
- spec
- product
- requirements
- scope
---

# Product Requirements

This product is a local-first video annotation reviewer for technical annotators and ML engineers who need exact frame control without the weight and mismatch of generic labeling platforms. The core problem is simple: long-video review gets slow and error-prone when playback time, annotation state, and export data drift apart. The main user pain points are slow navigation to the exact frame, uncertainty about which frame is truly canonical, tedious mask cleanup, and brittle exports from generic tools. This tool narrows the workflow to one job: review sparse annotations, correct them at exact frames, use SAM2 as assistive segmentation, and export deterministic results for downstream pipelines.

The primary user journey is: open a local video, inspect metadata and existing annotations, use playback for rough navigation, jump to an exact frame, step frame by frame, create or adjust a box, generate a SAM2 mask from that frame, correct the mask manually, propagate it across a bounded range, review propagated results, delete bad masks or whole tracks, and export the final project state. Exact-frame review matters because annotation quality depends on stable frame identity; the browser player is only for rough motion context, while the annotation surface must stay tied to backend frame truth. Deep contract details live in [[Frame Indexing Contract]].

V1 scope is intentionally narrow. It includes single-user local deployment, backend exact-frame retrieval, video playback plus a separate exact-frame annotation pane, box CRUD, mask viewing and brush editing, object and mask deletion, SAM2 prompt-box flow, bounded propagation with progress and cancellation, local persistence, JSON export, PNG mask export, and import of existing boxes from the current pipeline format. V1 does not include collaboration, comments, auth, audit logs, cloud deployment, large-scale dataset management, advanced polygon editing, or automatic labeling without user prompt.

Functional requirements center on five areas: video browsing, annotation visualization, box editing, mask editing, and SAM2-assisted review. This section is the functional requirements checklist for the v1 video review workflow. The app must list videos, open one, show metadata, play and pause, scrub, jump to frame number, step one frame at a time, and jump across annotated frames or keyframes. It must render boxes, masks, object labels, and object selection state on the current frame. It must let users create, move, resize, label, and delete boxes; view, create, refine, erase, and delete masks; mark manual correction keyframes; start and close SAM2 sessions; prompt and refine on a specific frame; propagate forward, backward, or both; cancel jobs; and observe incremental progress. Persistence must keep object ids, labels, frame annotations, masks, keyframes, and exportable local state.

Nonfunctional requirements and definition of done set the delivery bar. The app must stay local-first, keep deterministic frame indexing and a stable save format, remain responsive on long videos, return local cached frames quickly, stream propagation progress, stay usable during background work, offer predictable keyboard control, and expose clear failure states for missing models, GPU issues, and corrupt media. V1 is done when a user can open a video, jump to an exact frame, step frame by frame, draw or edit a box, generate a SAM2 mask, correct it manually, propagate across a selected range, delete bad masks or tracks, and export JSON plus PNG masks.

## Observations
- [goal] The product exists to make exact-frame annotation review reliable for sparse long-video workflows.
- [problem] Generic annotation tools are too broad or too imprecise for this review task.
- [user] The primary user is a technical annotator or ML engineer reviewing video annotations.
- [pain_point] User pain points are slow exact-frame navigation, uncertain frame truth, tedious mask cleanup, and brittle export handoff.
- [journey] The primary user journey is open local video, inspect annotations, jump to exact frame, edit box or mask, run SAM2, review propagation, and export results.
- [workflow] Playback gives rough context, but exact-frame inspection drives annotation decisions.
- [requirement] The annotation surface must use backend-decoded frames as truth.
- [scope] V1 is single-user and local-first.
- [scope] V1 includes box and mask review, editing, deletion, persistence, and export.
- [scope] V1 includes SAM2 prompt and bounded propagation as assistive tools, not autonomous labeling.
- [checklist] The functional requirements checklist covers browse, inspect, exact-frame navigation, box editing, mask editing, SAM2 prompting, propagation review, persistence, and export.
- [limit] V1 excludes collaboration, auth, comments, audit logs, cloud deployment, and broad annotation-management features.
- [nonfunctional] The product must stay usable while propagation jobs run and report progress incrementally.
- [done] V1 is complete only when the end-to-end review flow finishes with deterministic JSON and PNG mask export.

## Relations
- relates_to [[Frontend Interaction Spec]]
- relates_to [[Architecture]]
- relates_to [[Delivery Plan and Risks]]
- depends_on [[Frame Indexing Contract]]