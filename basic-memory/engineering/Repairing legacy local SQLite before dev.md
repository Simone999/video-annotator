---
title: Repairing legacy local SQLite before dev
type: engineering
canonical: true
domain: engineering
aliases:
- review unavailable sqlite
- manifest sqlite drift
- repair local sqlite
permalink: video-annotator/engineering/repairing-legacy-local-sqlite-before-dev
tags:
- sqlite
- alembic
- manifest
- review-unavailable
- playwright
- ports
- backend
---

# Repairing legacy local SQLite before dev

Use this note when local review route opens show `Review unavailable`, when `/api/videos/:id/manifest` crashes on local dev, or when browser smoke seems to hit the wrong stack.

## Problem

Two separate failures can look the same in browser:

- local app on `5173` can show `Review unavailable` because frontend asks backend `8000` or `8001` for `/api/videos/{video_id}/manifest`, and local `data/video_annotator.db` may still be a pre-Alembic SQLite with integer `object_tracks.id`, nullable `color`, integer `frame_annotations.object_id`, and no `alembic_version`
- local Playwright smoke can fail for route or fetch reasons if it reuses unrelated servers or shares backend port with normal dev

## Current fix

- local `npm run backend:dev` now loads repo env files, runs DB prepare first, then serves FastAPI on the development backend port from `.env.development`
- DB prepare repairs the known legacy local SQLite shape into a fresh Alembic-managed schema, backs up the old DB to `.bak`, then runs `alembic upgrade head`
- local frontend dev reads repo env files and proxies `/api` to the development backend port
- host Playwright E2E reads `.env.e2e`, uses backend `127.0.0.1:8001`, and no longer reuses stray local servers

## What to remember

- if real app on `5173` shows `Review unavailable`, inspect backend manifest route first, not frontend routing
- if browser smoke hits unexpected UI or wrong seed state, check the active env file and ports before debugging product code
- keep API contract on string `object_id`; repair old DB data instead of weakening current manifest schema

## Observations

- [root-cause] `Review unavailable` on local real app can come from legacy SQLite drift in `data/video_annotator.db`, not from frontend route ownership. #sqlite #manifest #review-unavailable
- [root-cause] Browser smoke can fail separately when dev and E2E share ports or reuse stray local servers. #playwright #ports #e2e
- [fix] Repo env files now own dev and E2E ports; local dev defaults use backend `127.0.0.1:8000`, while host E2E uses backend `127.0.0.1:8001`. #backend #ports #env
- [fix] Preserve current string object-id contract and repair old local DB rows into current Alembic schema instead of loosening API serializers. #sqlite #api #alembic

## Relations

- indexed_by [[Engineering Memory Index]]
- relates_to [[Architecture]]
- relates_to [[API]]
- relates_to [[Data Model]]
- relates_to [[e2e-tests]]
