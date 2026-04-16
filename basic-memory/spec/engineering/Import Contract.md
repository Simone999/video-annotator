---
title: Import Contract
type: note
permalink: video-annotator/spec/engineering/import-contract
tags:
- spec
- engineering
- import
- contract
---

# Import Contract

This note is the canonical placeholder for import behavior. The only confirmed v1 import contract is that the app imports existing boxes from the current pipeline format. External-tool adapters are deferred to v2.

The field-level shape of the current pipeline format is not documented here, so that remains an open contract gap rather than something to guess. The import path should stay separate from export until the format mapping is known well enough to write down and test.

## Observations
- [contract] v1 import includes existing boxes from the current pipeline format.
- [defer] External-tool import adapters are a v2 concern.
- [gap] The exact pipeline field mapping is still open and should not be invented.

## Relations
- relates_to [[Spec Index]]
- relates_to [[Engineering Index]]
- relates_to [[Product Requirements]]
- relates_to [[Delivery Plan and Risks]]
- relates_to [[Export Format]]
