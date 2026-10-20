---
status: accepted
---

# Derive dependency lists from source imports

A registry item's npm dependencies and registry dependencies are computed from its source imports when the registry is built. They are never written in the catalog. Before this decision, every catalog entry hand-copied its imports, and an audit re-scanned the source only to catch copies that had gone stale. Every entry but one already matched its imports exactly, so the copy was pure overhead. Both lists are emitted in alphabetical order, so the output does not change when someone reorders imports. The only authored dependency fact left is an extra dependency on the catalog entry: an npm package installed even though the source never imports it, such as `@tiptap/pm` for `rich-text-editor`.

## Considered Options

- **Generate the lists into the catalog files during `registry:build`.** Rejected: it keeps two stored copies of the same fact in git and only makes syncing them cheaper.
- **Keep hand-written lists and let the audit fix them automatically.** Rejected: the duplication stays.
- **Emit in import order.** Rejected: the install JSON would change whenever imports are reordered.

## Consequences

- Adopting this reordered the dependency lists in 39 registry items and in the registry index once. The sets did not change, and the shadcn CLI treats these lists as sets.
- Building the registry index now needs to read sources, so both builders take a source reader.
