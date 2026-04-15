---
title: FrameAnnotation row constraints
type: note
permalink: video-annotator/backend/frameannotation-row-constraints
tags:
- backend
- persistence
- annotations
- data-model
---

# FrameAnnotation row constraints

This note answers what makes one `FrameAnnotation` row valid and unique. The
goal is to keep annotation storage aligned with the backend-owned frame index
contract and with the current box-first workflow.

`FrameAnnotation` stores one object's annotation on one exact frame. The
durable database rules are about row uniqueness, optional mask fields, and the
normalized box representation that the rest of the stack expects.

## Observations
- [constraint] One annotation row exists per `(video_id, frame_idx, object_id)` and that tuple is the durable uniqueness rule. #database #annotations
- [constraint] `mask_path` and `mask_rle` stay nullable so manual box-only rows can be persisted before any mask exists. #masks #manual
- [constraint] Boxes use normalized `xywh` values and masks are stored on disk instead of being inlined into the database row. #geometry #storage
- [technique] Model-level SQLite tests are enough to lock nullability, foreign keys, and uniqueness before API work expands. #testing #sqlalchemy

## Relations
- relates_to [[Exact frame API]]
- relates_to [[Live video smoke validation]]
