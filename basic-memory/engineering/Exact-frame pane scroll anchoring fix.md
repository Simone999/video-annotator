---
title: Exact-frame pane scroll anchoring fix
type: note
permalink: video-annotator/engineering/exact-frame-pane-scroll-anchoring-fix
tags:
- frontend
- ui
- scroll
- exact-frame
---

# Exact-frame pane scroll anchoring fix

A viewport jump happened in the exact-frame review flow when the user scrolled down, then clicked `Load frame`. The page height increased after the backend image loaded, and browser scroll anchoring adjusted `window.scrollY` to keep the old anchor in view. That behavior made the review controls jump even though the user had not intentionally scrolled.

The stable fix was to opt the exact-frame pane itself out of browser scroll anchoring with `overflow-anchor: none`. This keeps the rest of the page behavior unchanged and avoids imperative scroll restoration logic. Browser verification on the live local stack showed document height growing while `window.scrollY` stayed unchanged during frame load.

## Observations
- [bug] Exact-frame pane expansion after `Load frame` can trigger browser scroll anchoring and move the viewport #frontend #ui
- [decision] Fix scroll jump by setting `overflow-anchor: none` on the exact-frame pane instead of restoring scroll position imperatively #frontend #css
- [verification] Live browser check on local app kept `window.scrollY` stable while document height grew after exact frame `7` loaded #playwright #validation
