---
title: Backend API test database seam
type: note
permalink: video-annotator/backend/backend-api-test-database-seam
tags:
- backend
- testing
- database
---

# Backend API test database seam

This note answers how backend API tests isolate database state without adding
route-specific test hooks. The durable seam is `APP_DB_URL`: tests point the
app at a temp SQLite database, seed rows directly, then exercise real routes
through `create_app()`.

The main trap is engine caching. Tests that change `APP_DB_URL` between cases
must clear the cached SQLAlchemy engine and session factory before constructing
the next app, or state leaks between databases and the route assertions become
misleading.

## Observations
- [pattern] Use `APP_DB_URL` as the backend API test seam and point each test case at its own temp SQLite file. #testing #database
- [gotcha] When tests swap `APP_DB_URL` across cases, clear cached `app.db.session.get_engine()` and `get_session_factory()` before `create_app()` or stale DB state leaks across runs. #sqlalchemy #testing
- [pattern] Seed `Video` rows with SQLAlchemy and exercise endpoints through `create_app()` instead of adding route-specific overrides. #fastapi #integration

## Relations
- relates_to [[Video catalog API]]
- relates_to [[Exact frame API test seam]]
- relates_to [[Startup indexing test seam]]
