# Agent Plan: select-plus (batch 1, PR 1)

Decisions behind this plan: `docs/adr/0002` to `0004`. Terms: `CONTEXT.md` (Primitive, Composite component).

## Goal
Add an antd-style composite Select, `select-plus`, and fold `multi-select` into it as a thin wrapper. The `select` primitive is untouched.

Capability list (confirmed):

| Prop | Behaviour |
| --- | --- |
| `options` | `{ value, label, disabled? }[]` or groups `{ label, options }[]`. `children` is the escape hatch. |
| `mode` | `"single"` (default), `"multiple"`, `"tags"` (Enter creates a new value). |
| `value` / `defaultValue` / `onValueChange` | `string` in single mode, `string[]` otherwise. |
| `showSearch` | Default `false` in single mode, `true` in `multiple` and `tags`. |
| `filterOption` | `boolean` or `(input, option) => boolean`. Default: label contains input, case-insensitive. |
| `onSearch` | Input change callback. Built-in filtering stays on unless `filterOption={false}`. |
| `allowClear` | Clear button. |
| `maxTagCount` | `number`. Extra tags collapse into `+N`. |
| `loading`, `disabled` | |
| `status` | `"error" \| "warning"`, mapped to `aria-invalid`. Forwards `ref`, `id`, `aria-*` to the focusable element. |
| `size` | `"sm" \| "default"`. |
| `open` / `onOpenChange` | Controlled open state. |
| `placeholder`, `notFoundContent` | Override the default Chinese texts. |
| `renderOption` | Custom option rendering. |

Out of scope: virtual scroll, `tokenSeparators`, `labelInValue`, `maxTagCount="responsive"`, `dropdownRender`, `optionFilterProp`, debounce for remote search, any form-library binding.

## Files Likely Involved
- New: `packages/registry/src/ui/select-plus.tsx`, `select-plus.test.tsx`.
- Changed: `packages/registry/src/ui/multi-select.tsx` (becomes a wrapper; keeps `MultiSelectProps` and `MultiSelectOption`).
- Catalog: a new `select-plus` entry and an updated `multi-select` description in `packages/registry/src/catalog-batch3.ts` (or a new batch file). No dependency lists, they are derived.
- Demo: `packages/registry/src/examples/ui-demos-3.tsx` plus `examples/index.ts` (`select-plus`; `MultiSelectDemo` keeps working).
- README component list.
- Test setup: `package.json` devDependencies for `jsdom` and `@testing-library/react` (with `@testing-library/user-event` if needed), `docs/testing.md`.
- Generated, never hand-edited: `registry.json`, `apps/docs/public/r/`.
- Not touched: `select.tsx`, `combobox.tsx`, `THIRD_PARTY_NOTICES.md`, `CREDITS.md`, `licenses/`, `.github/workflows/ci.yml`, alias configs.

## Risks
- Generated files: run `pnpm registry:build` and commit the output.
- Public install surface: `multi-select` changes content and gains a registry dependency on `select-plus`, `combobox` and `@base-ui/react`. Its name, `target` and exported types stay. Existing installs that re-run `shadcn add multi-select` get new markup and focus behaviour. Call this out in the PR description.
- Licensing: `multi-select` attribution is kept as is (ADR 0002). The new `select-plus` is original code on top of the `combobox` primitive, so no new third-party entry is needed. If any code is copied from another project during the work, stop and record its source.
- New dependencies: `jsdom` and Testing Library are devDependencies at the repo root only. No new runtime npm package, because `@base-ui/react` is already in both `package.json` files.
- Test environment: opt in per file with `// @vitest-environment jsdom`, so existing node tests are unaffected. `vitest.config.mts` may need small changes, and it is one of the three alias configs, so any edit there must leave the aliases identical to the other two.
- Engine risk (ADR 0003 is `proposed`): non-searchable single mode and Base UI popups under jsdom are unproven.
- Bundle: `select-plus` pulls in `combobox`, `input-group` and `button`.

## Plan
1. **Spike (time-boxed).** Prototype single, multiple and tags on the `combobox` primitive, including a button-style single mode without search. Add jsdom and Testing Library and write a few interaction tests (open, filter, select, clear, remove chip). Do not commit the prototype as-is.
   - Pass: mark ADR 0003 `accepted`, go on.
   - Fail: mark ADR 0003 `superseded`, write a new ADR for Radix Popover plus cmdk, update this plan, and ask for review again before continuing.
2. Implement `select-plus.tsx` against the capability list. Keep `status`, `ref` and ARIA forwarding on the focusable element.
3. Write behaviour tests: filtering with default and custom `filterOption`, `onSearch` with `filterOption={false}`, multi toggle, tags creation, `allowClear`, `maxTagCount` overflow, `disabled`, `status` to `aria-invalid`, controlled and uncontrolled value.
4. Turn `multi-select.tsx` into a wrapper over `SelectPlus` with `mode="multiple"`, keeping its current props and exports. Check that `MultiSelectDemo` still works.
5. Add the catalog entry, demo and README line. Demo shows basic, multiple, search, tags, clear, `maxTagCount`, `status`, groups, loading.
6. Update `docs/testing.md` for the jsdom setup and the new test files.
7. Run `pnpm registry:build`, then `./scripts/check.sh --full`.

## Validation
- `./scripts/check.sh --full`, with the 2 known `react-hooks/incompatible-library` warnings expected.
- Typecheck excludes `*.test.ts`, and vitest does not type-check, so type-check the new test file by hand (for example `tsc --noEmit` with the test included) or report that it was not checked.
- Manual checks in `pnpm dev`: open `/docs/select-plus` and `/docs/multi-select`; keyboard navigation (arrows, Enter, Escape, Backspace removes the last chip); dark mode; inside `FormControl` with an invalid field; narrow container with many tags.

## Rollback
Revert the PR. `select-plus` is a new entry and disappears with it. `multi-select` returns to its previous source, and `registry:build` regenerates the matching JSON. If only the engine fails after merge, replace the internals of `select-plus` and keep its props.

## Review gate
High-risk area (public install surface and a new test setup). Stop after this plan and wait for human review before any code is written.
