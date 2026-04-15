---
title: Why Vite returns 404 on /api
type: note
permalink: video-annotator/validation/why-vite-returns-404-on-api
tags:
- validation
- frontend
- vite
---

# Why Vite returns 404 on /api

This note answers one local-dev failure mode directly: why does Vite return
`404` on `/api` instead of reaching the FastAPI backend?

The frontend should keep API paths relative, and the local development setup
must proxy `/api` traffic from the Vite server to `127.0.0.1:8000`. If that
proxy is missing or misconfigured, the browser sends `/api/...` to the frontend
dev server, Vite handles the request itself, and the review flow fails before
it ever reaches FastAPI.

## Observations
- [answer] The answer to "why does Vite return `404` on `/api`" is that `/api` traffic stayed on the Vite dev server instead of being proxied to FastAPI. #vite #frontend
- [decision] Keep frontend API paths relative and rely on the Vite dev proxy to route `/api` traffic to backend `127.0.0.1:8000`. #frontend #vite
- [gotcha] Without the proxy, browser requests to `/api` stay on the Vite dev server and return Vite `404` responses instead of hitting FastAPI. #local-dev #debugging
- [constraint] Live local validation should use the same relative `/api` paths as normal frontend code rather than special absolute URLs. #frontend #validation

## Relations
- relates_to [[Playback pane contract]]
- relates_to [[Jump to frame interaction]]
- relates_to [[Frame stepping interaction]]
- relates_to [[Live video smoke validation]]
