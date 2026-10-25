# Testing

## Standard Check
```sh
./scripts/check.sh          # pnpm lint, pnpm typecheck, pnpm test
./scripts/check.sh --full   # also pnpm build, same steps as CI
```

The script runs every step, prints a summary, and exits 1 if any step failed. Run `--full` after changing the catalog, component source, or `apps/docs` build config.

One difference from CI: after `pnpm build`, `--full` only prints a notice when `registry.json` or `apps/docs/public/r` differ from the index, because uncommitted but current generated files are normal locally. CI fails on the same condition. When you see the notice, commit the generated files with the source change.

If a step fails with `Cannot find module` or `Cannot find package`, run `pnpm install` first. See `docs/debugging.md`.

## Commands
Root `package.json`:

| Command | Runs | Scope |
| --- | --- | --- |
| `pnpm lint` | `eslint apps/docs packages/registry/src scripts` | docs app, registry source, scripts |
| `pnpm typecheck` | `tsc --noEmit` in `apps/docs` | docs app plus `packages/registry/src` (included by `apps/docs/tsconfig.json`) |
| `pnpm test` | `vitest run` | repo-root `**/*.test.ts`, including `packages/registry/src` and `apps/docs` |
| `pnpm registry:build` | `tsx scripts/build-registry.ts` | rewrites generated registry JSON |
| `pnpm build` | `pnpm registry:build`, then `next build` | full build |

Typecheck excludes `packages/registry/src/**/*.test.ts` and `*.test.tsx`. Tests under `apps/docs` are included. Vitest does not type-check on its own.

`pnpm lint` currently reports warnings but no errors, for example `react-hooks/incompatible-library` in `data-table.tsx` and `virtual-list.tsx`, and `@next/next/no-img-element` in components that intentionally use `<img>`. They are expected and do not fail the check.

## Tests
- `packages/registry/src/registry-item.test.ts`: registry JSON shape, derived dependency lists, and missing-file errors.
- `packages/registry/src/dependencies.test.ts`: import scanning for dependency derivation.
- `packages/registry/src/audit.test.ts`: unit tests for the audit rules. Vocabulary consistency (`vocabulary-mismatch`) checks Effect props whose names are in `docs/effect-prop-vocabulary.md`: type, control kind, and group. A non-empty `vocabularyExemption` on that prop skips the check. Control start values outside `min`/`max` or `options` stay `control-out-of-range`. `control-not-in-demo` reports a catalog prop that has a control when the Demo parameter list does not accept that name, or accepts it but does not pass it to the component. Props without a control are skipped. `prop-not-in-catalog` reports an own field of an exported `Props` type (including subcomponent Props in the same registry item) that is missing from that catalog entry. HTML attributes from the audit's existing list, and event callbacks whose names start with `on` plus an uppercase letter, are not required.
- `packages/registry/src/audit-coverage.test.ts`: missing-test import detection, the control count, reduced-motion source probes, and the exemption list. Checks follow the layer in `packages/registry/src/catalog-layer.ts`. An Effect owes the effect checks. A Primitive, Composite component, Widget, Section, Hook, or Lib needs a test file that imports its source. A Template does not. An audit fixture that omits `layer` owes neither the effect checks nor a component test. An Effect with fewer than 3 catalog controls fails `insufficient-controls` (2 fails, 3 does not); other layers do not. Effect source that matches the animation feature list and none of the reduced-motion features fails `missing-reduced-motion`; static source does not. `layer-mismatch` means the second-level group does not match the layer. `usePrefersReducedMotion`, `motion-reduce:`, or `prefers-reduced-motion` satisfies the motion rule. `audit-exemptions.ts` silences only the gaps it names. A listed gap that no longer applies fails `stale-exemption`. A catalog entry without a positive integer `batch` fails `missing-batch`. Batch 34 and later cannot be listed, except batches 36–45. The boundary reads each entry's `batch`. Static components are not given a `缺减弱动效` row with reason `无动画`: they do not match the animation features, so that row would be stale. See `docs/component-standard.md`.
- `packages/registry/src/audit.repo.test.ts`: audits the real repo. It passes `audit-exemptions.ts` in, so a component outside that list still fails `missing-test`. It checks that every derived npm dependency is in `packages/registry/package.json`, every derived registry dependency is in the catalog, and that demos and the README list are complete. It also checks that `registry.json` and `apps/docs/public/r` match a fresh build, and that every Effect using a vocabulary word matches that word unless the prop records an exemption. Stale generated JSON fails `pnpm test`. When a vocabulary check fails, the issue description names the component, the prop, and whether the type, control kind, group, or option is wrong. `preset-invalid` means a catalog preset value is outside that control's range or options, or names a prop that has no control. The whole-catalog gate counts `control-not-in-demo` and `prop-not-in-catalog` and expects neither kind. A separate test still checks that any such issue name is a real catalog entry.
- `packages/registry/src/ui/select-plus.test.tsx`: renders `SelectPlus` and `MultiSelect` in jsdom. The file opts in with `// @vitest-environment jsdom` and calls `cleanup()` in `afterEach`, because vitest does not enable globals and Testing Library will not clean up on its own. Assertions use rendered text, roles, ARIA, and `onValueChange` / `onSearch` / `onOpenChange`.
- `packages/registry/src/ui/button-plus.test.tsx`, `input-plus.test.tsx`, `switch-plus.test.tsx`, `checkbox-plus.test.tsx`, and `radio-plus.test.tsx` use the same jsdom setup. They render each composite through its public props and assert on text, roles, ARIA, focus, and callback calls.

`jsdom`, `@testing-library/react`, `@testing-library/user-event`, and `@testing-library/jest-dom` are root devDependencies.

- `apps/docs/lib/usage.test.ts`: usage text extracted from real demos. Docs pages are still checked manually with `pnpm dev`.

## Notes
- Do not claim a check passed unless it ran in this workspace.
- No pre-commit hooks are configured.
