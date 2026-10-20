# Debugging

## Start Here
- Run the docs site: `pnpm install`, `pnpm dev`, then open http://localhost:3000.
- Run checks: `./scripts/check.sh`. See `docs/testing.md`.
- There are no backend logs. Errors appear in the `next dev` terminal and the browser console.

## Common Failures

**`Cannot find module 'x'` in typecheck, or `Cannot find package 'x'` in tests, after pulling.**
The lockfile gained a dependency that is not installed locally. Run `pnpm install`.

**`pnpm test` fails in `audit.repo.test.ts`.**
The audit message says what is missing. Common causes:
- `stale-static-json` or `missing-static-json`: run `pnpm registry:build` and commit the output.
- `missing-package-dependency`: an npm package the source imports, or one listed in `extraDependencies`, is missing from `packages/registry/package.json`. Add it there.
- `unknown-registry-dependency`: the source imports `@/components/ui/x`, `@/hooks/x`, `@/lib/x`, or `./x`, and no catalog entry is named `x`. Register the item or fix the import.
- `unregistered-source`: a component file has no catalog entry.
- The README does not mention the component name.

**An installed component fails because a peer package was not installed.**
Dependency lists are derived from source imports, so a package the source never imports is not listed. Add it to the catalog entry's `extraDependencies`, then run `pnpm registry:build`. See `docs/adr/0001-derive-dependency-lists-from-source.md`.

**CI step "Check registry JSON is unchanged" fails.**
Generated JSON was not committed. Run `pnpm registry:build` locally and commit `registry.json` and `apps/docs/public/r`.

**`apps/docs/AGENTS.md` shows up as modified after `next dev`.**
Expected. Commit it. Do not revert it.

**A component import resolves to the wrong file.**
Check for the same file name in `ui/`, `effects/`, and `sections/`. See "Shared Configuration" in `docs/dangerous-areas.md`.
