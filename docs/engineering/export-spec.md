# Milestone 0 Export Spec

## Purpose

This document records the Milestone 0 export foundation for the local-first
video annotation reviewer.

It captures only the baseline export assumptions already established in the
spec and product requirements. Implementation details for export execution and
packaging are deferred to later milestones.

## Baseline Export Contract

- Exports are local-only.
- The intended export direction is native JSON plus PNG mask artifacts.
- Export outputs must be deterministic and reloadable.
- Repository-owned `exports/` storage is part of the export contract.
- Exported data must preserve the repository's canonical backend frame
  indexing and local project state.

These assumptions align with the product's local-first workflow and stable,
machine-readable export goals. They do not define the full export workflow.

## Milestone 0 Scope

Milestone 0 establishes the export foundation only.

Out of scope for Milestone 0:

- export execution flow
- archive or download behavior
- filtering or option behavior
- any implemented export UI or API beyond placeholders

Those behaviors are intentionally deferred to later milestone documents.

## Deferred Sections

The following sections are reserved for later milestones. Their implementation
details are intentionally omitted here.

### Native JSON Schema

Placeholder for the native JSON export schema. The exact fields, relationships,
and serialization rules will be defined later.

### Mask Directory Layout

Placeholder for the PNG mask export directory structure. The exact layout,
naming scheme, and per-object or per-frame conventions will be defined later.

### Versioning Strategy

Placeholder for export format versioning. The exact compatibility policy and
version negotiation rules will be defined later.

## Notes

This document is intentionally a stub. It exists so later milestones can
reference a stable export foundation without implying that export generation,
download handling, or UI wiring is already implemented.
