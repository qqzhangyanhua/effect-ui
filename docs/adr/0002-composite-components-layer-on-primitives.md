---
status: accepted
---

# Composite components layer on primitives, and existing composites upgrade in place

Users want antd-style components that cover common scenarios through props (multi-select, search, clear, loading, `columns`, `options`). We add these as new catalog entries, called composite components, that depend on the unchanged primitive entries. `select`, `button`, `input`, `dialog`, `table` and the other shadcn-shaped entries keep their upstream shape, so their install output at `/r/<name>` does not change.

A catalog entry that is already a composite, such as `data-table` or `multi-select`, is the exception: it is upgraded in place, keeps its name, and stays backward compatible. Two overlapping composites for the same job would be worse than one that grew.

## Considered Options

- **Add features to the primitives.** Rejected: it changes the shape of `/r/<name>` for existing installs and makes the primitives hard to sync with upstream shadcn.
- **Replace the primitives with composites.** Rejected: it removes the option to assemble parts by hand.
- **Always add a new composite, even next to an existing one.** Rejected: `data-table` and a new table composite would overlap with no clear choice for a user.

## Consequences

- `multi-select` is folded into the new composite Select and stays installable under its current name as a thin wrapper, like `Reveal` and the older scroll-reveal components.
- The composite API is options-first (`options`, with `children` as an escape hatch). Feature props use antd names (`allowClear`, `showSearch`, `maxTagCount`, `loading`, `danger`). Controlled state keeps this repo's `value`, `defaultValue` and `onValueChange`.
- New composite entries take a `-plus` suffix (`select-plus`, `input-plus`, `button-plus`) and export a matching name (`SelectPlus`), so a user can install both layers without an import clash. Entries that were already composites keep their names.
- Default texts stay in Chinese, as in the existing components, and every one can be overridden by a prop (`placeholder`, `notFoundContent`). There is no locale provider.
- Turning `multi-select` into a wrapper does not touch its attribution. `THIRD_PARTY_NOTICES.md`, `CREDITS.md`, `licenses/` and the README source column keep their `multi-select` records until a separate, deliberate review says otherwise.
- Work is delivered in batches with a capability list agreed before code is written. Batch 1 is split in two pull requests: Select with the `multi-select` fold-in first, then Input, Button, Switch and Checkbox / Radio.
