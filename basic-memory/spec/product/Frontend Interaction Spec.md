---
title: Frontend Interaction Spec
type: note
permalink: video-annotator/spec/product/frontend-interaction-spec
tags:
- spec
- product
- frontend
- ux
---

# Frontend Interaction Spec

This note defines the frontend interaction contract for the video review interface. It covers the annotation workspace layout, the playback timeline experience, and the rules that keep exact-frame annotation separate from contextual playback.

The workspace uses a three-column layout. The left column holds video selection and the object panel so the user can switch context and manage annotation targets without losing the current review state. The center column is the working area: playback on top for watching motion and scene context, exact-frame review below for precise frame-by-frame work. The right column holds inspector details, controls, and timeline detail so editing actions stay visible without crowding the frame surface.

This is intentionally a two-pane review model. Playback is for watching, scrubbing, and keeping spatial context. Exact-frame review is where annotation truth lives, because all create, edit, and delete actions attach to a backend-decoded frame index rather than browser playback time. Opening a video should load playback plus the annotation pane together, with exact-frame review starting at frame 0 or the first annotated frame if one already exists.

The timeline must show both kinds of position at once: current playback position for watching and current exact frame index for editing. It also carries annotated-frame markers, keyframe markers, and propagation range selection so the user can jump between frames, see where work already exists, and understand where automated propagation starts or ends. Jump-to-frame works by entering a frame number, loading that exact frame from the backend, and then optionally nudging playback near the same moment for context.

Keyboard shortcuts and tools keep exact-frame annotation fast. `Space` toggles play and pause. `<` and `>` step frame by frame. `Shift+>` and `Shift+<` jump across annotated frames. `g` opens jump to frame. `b` selects the box tool. `m` enables mask brush add. `e` enables erase brush. `Delete` removes the selected annotation. `s` saves. The annotation toolset includes select, box, brush add, brush erase, and pan/zoom. The object panel must show object id, label, color, visibility, lock state, delete action, and whether that object has annotation presence on the current frame.

## Observations
- [requirement] The video review interface uses a three-column workspace with list and object management on the left, playback and exact-frame work in the center, and inspector plus timeline detail on the right #frontend #ux
- [requirement] Playback is contextual and exact-frame review is the authoritative editing surface for annotation operations #frontend #annotation
- [requirement] Opening a video loads playback and exact-frame review together, initializing exact-frame state to frame 0 or the first annotated frame #workflow #frontend
- [requirement] The timeline shows playback position, exact frame index, annotated-frame markers, keyframe markers, and propagation range selection #timeline #ux
- [requirement] Jump to frame requests the exact backend frame first, then may seek playback approximately for context #exact-frame #workflow
- [requirement] Keyboard shortcuts cover playback control, frame stepping, annotated-frame jumps, jump dialog, tool switching, delete, and save #keyboard #ux
- [requirement] Annotation tools include select, box, brush add, brush erase, and pan/zoom #annotation #tools
- [requirement] The object panel exposes object id, label, color, visibility, lock, delete, and current-frame presence indicator #objects #frontend

## Relations
- depends_on [[Frame Indexing Contract]]
- depends_on [[API]]
- relates_to [[Product Requirements]]
- relates_to [[Architecture]]
- relates_to [[Delivery Plan and Risks]]
