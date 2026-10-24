# Catalog entries are classified by layer, then by a second-level group

Each catalog entry used to carry one `category` that mixed three questions: what kind of thing it is (`ui`, `sections`), what kind of effect it is (`text`, `loaders`), and what domain it serves (`ai`, `utility`). `utility` became a catch-all of 132 entries, and the `effects/` directory filled with entries that are not effects. We now classify every entry by its layer first (Primitive, Composite component, Widget, Effect, Section, Template, Hook, Lib), and then give each component layer a second-level group: Effects take an effect category, while Primitives, Composite components and Widgets share one set of purpose groups. Domains such as AI are topics that cut across layers, not layers or groups.

Whether something is an Effect is decided by removing every animation: if what is left is an existing primitive or nothing at all, it is an Effect; if it still does a complete job, it is a Widget or a Composite component. This is why `diff-viewer` is not an Effect even though it was ported from an effects library.

Audit obligations follow the layer. An entry that moves into the Effect layer takes on the Effect checks (prop vocabulary, enough controls, reduced motion), and any gap it cannot close yet is recorded in `audit-exemptions.ts` with a reason, rather than being grandfathered.

## Considered Options

- One flat category with tightened boundaries: smaller change, but keeps two axes in one field, so the catch-all comes back.
- Grouping by use case (forms, feedback, marketing): readable for docs readers, but cannot say which checks an entry owes.
- Classifying by source library: cheap to apply, and is exactly how non-effects ended up in `effects/`.

## Consequences

- Classification lives in the catalog. Source directories do not follow the layer until the reclassification is finished; moving files is a separate change because it alters the `path` value in every moved item's install JSON.
- Component names, `target`, and `/r/[name]` do not change. Category is not part of the install JSON.
