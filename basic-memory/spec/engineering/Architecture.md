---
title: Architecture
type: note
permalink: video-annotator/spec/engineering/architecture
tags:
- spec
- engineering
- architecture
- system-design
---

# Architecture

System stays local-first. React frontend, FastAPI backend, local storage, and SAM2 worker boundary remain core split. Backend-decoded frame index remains canonical truth even though review UI now uses one playback stage instead of separate playback and exact-frame panes.

Frontend owns two screen-level flows:
- video library for selection and status
- annotation screen for playback, overlays, inspector, and transport

Annotation screen architecture is single review surface:
- video stage renders playback from current frame onward
- overlay layer renders boxes and masks on same stage
- left rail and right inspector manage context and tools
- bottom transport manages seek, step, thumbnails, and selected range

Control rule is strict:
- playback may move continuously for context
- pause, step, jump, and seek resolve to explicit backend frame identity
- mutating actions run only against paused canonical current frame

Backend owns indexed video metadata, derived library state, exact-frame decode, annotation persistence, summary aggregation, SAM2 session lifecycle, propagation jobs, and export orchestration. New inspector summary contract belongs in backend because bbox display, confidence, and range summary should not depend on partial frontend cache.

Storage stays simple:
- SQLite for metadata
- filesystem for masks and exports
- local files for source videos

## Observations
- [architecture] Runtime split stays React frontend + FastAPI backend + local storage + SAM2 worker #system-design
- [screen] Frontend architecture now has library screen plus single-stage annotation screen #frontend #screens
- [truth] Single-stage playback UI does not relax canonical backend `frame_idx` ownership #frames #backend
- [rule] Pause gates all mutating actions on review screen #editing #architecture
- [boundary] Backend should aggregate derived library state and selected-object summary data instead of pushing that burden into partial frontend cache #backend #summary
- [storage] Storage model stays SQLite plus local filesystem artifacts #storage #local-first

## Relations
- depends_on [[Frame Indexing Contract]]
- relates_to [[Data Model]]
- relates_to [[API]]
- relates_to [[SAM2 Integration]]
- relates_to [[Runbook]]
- relates_to [[Engineering Index]]