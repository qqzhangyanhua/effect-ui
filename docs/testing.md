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

`pnpm lint` currently reports 2 `react-hooks/incompatible-library` warnings, in `data-table.tsx` and `virtual-list.tsx`. They are expected and do not fail the check.

## Tests
- `packages/registry/src/registry-item.test.ts`: registry JSON shape, derived dependency lists, and missing-file errors.
- `packages/registry/src/dependencies.test.ts`: import scanning for dependency derivation.
- `packages/registry/src/audit.test.ts`: unit tests for the audit rules.
- `packages/registry/src/audit.repo.test.ts`: audits the real repo. It checks that every derived npm dependency is in `packages/registry/package.json`, every derived registry dependency is in the catalog, and that demos and the README list are complete. It also checks that `registry.json` and `apps/docs/public/r` match a fresh build. Stale generated JSON fails `pnpm test`.
- `packages/registry/src/ui/select-plus.test.tsx`: renders `SelectPlus` and `MultiSelect` in jsdom. The file opts in with `// @vitest-environment jsdom` and calls `cleanup()` in `afterEach`, because vitest does not enable globals and Testing Library will not clean up on its own. Assertions use rendered text, roles, ARIA, and `onValueChange` / `onSearch` / `onOpenChange`.
- `packages/registry/src/ui/button-plus.test.tsx`, `input-plus.test.tsx`, `switch-plus.test.tsx`, `checkbox-plus.test.tsx`, and `radio-plus.test.tsx` use the same jsdom setup. They render each composite through its public props and assert on text, roles, ARIA, focus, and callback calls.

`jsdom`, `@testing-library/react`, `@testing-library/user-event`, and `@testing-library/jest-dom` are root devDependencies.

- `apps/docs/lib/usage.test.ts`: usage text extracted from real demos. Docs pages are still checked manually with `pnpm dev`.

## Notes
- Do not claim a check passed unless it ran in this workspace.
- No pre-commit hooks are configured.
