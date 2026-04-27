---
title: Keeping backend integration tests aligned with object create and SAM2 propagate
  contracts
type: test_guide
permalink: video-annotator/tests/keeping-backend-integration-tests-aligned-with-object-create-and-sam2-propagate-contracts
canonical: true
domain: testing
aliases:
- backend object create color contract
- sam2 propagate request contract
- stale backend integration payloads
tags:
- testing
- backend
- integration
- sam2
- objects
- contracts
- pytest
---

# Keeping backend integration tests aligned with object create and SAM2 propagate contracts

Use this note when backend integration tests start failing with `422` on object creation or SAM2 propagation after route contract changes.

Current backend contract truth lives in `backend/app/schemas/video.py`, `backend/app/schemas/sam2.py`, and route wiring in `backend/app/api/videos.py`.

For object creation tests, every `POST /api/videos/{video_id}/objects` request must send both `label` and `color`. Response assertions can stay focused on `id`, `label`, `color`, and `status`.

For SAM2 propagation tests, request bodies must use `session_id`, `seed_frame_idx`, `range_start_frame_idx`, `range_end_frame_idx`, `direction`, and `object_ids`. Older `start_frame_idx` and `end_frame_idx` keys now fail validation.

When these tests drift, classify failures as stale-test contract issues first. Update test payloads before considering backend product changes.

## Observations
- [type] test_guide
- [canonical] true
- [domain] testing
- [contract] Backend object-create integration tests must send explicit `color` with `label` or FastAPI validation returns `422`. #backend #objects #contracts
- [contract] Backend SAM2 propagate integration tests must use `seed_frame_idx`, `range_start_frame_idx`, and `range_end_frame_idx`; old `start_frame_idx` and `end_frame_idx` payloads are stale. #backend #sam2 #contracts
- [technique] When contract-drift failures appear, verify schemas and route payload models first, then patch tests before touching product code. #pytest #testing #workflow

## Relations
- indexed_by [[Tests Index]]
- relates_to [[backend-api-integration-tests]]
- relates_to [[API]]