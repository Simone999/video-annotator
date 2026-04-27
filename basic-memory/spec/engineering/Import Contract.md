---
title: Import Contract
type: spec
canonical: true
domain: engineering
permalink: video-annotator/spec/engineering/import-contract
tags:
- spec
- engineering
- import
- contract
---

# Import Contract

This note is canonical placeholder for planned import behavior. Existing-box import from current pipeline format remains in product scope, but blocked today until field mapping, route contract, and review-flow entry are written down and shipped. External-tool adapters are deferred to v2.

The field-level shape of the current pipeline format is not documented here, so that remains an open contract gap rather than something to guess. The import path should stay separate from export until the format mapping is known well enough to write down and test.

## Observations
- [contract] Planned v1 import covers existing boxes from current pipeline format, but live product does not ship that workflow yet.
- [defer] External-tool import adapters are a v2 concern.
- [gap] The exact pipeline field mapping is still open and should not be invented.

## Relations
- relates_to [[Spec Index]]
- relates_to [[Engineering Index]]
- relates_to [[Product Requirements]]
- relates_to [[Delivery Plan and Risks]]
- relates_to [[Export Format]]
