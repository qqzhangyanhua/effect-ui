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
- An npm package is not declared: add it to the catalog entry's `dependencies` and to `packages/registry/package.json`.
- `unregistered-source`: a component file has no catalog entry.
- The README does not mention the component name.
- A dependency is intentionally unused, for example a peer dependency: add an entry to `packages/registry/src/audit-exceptions.ts` with a reason.

**CI step "Check registry JSON is unchanged" fails.**
Generated JSON was not committed. Run `pnpm registry:build` locally and commit `registry.json` and `apps/docs/public/r`.

**`apps/docs/AGENTS.md` shows up as modified after `next dev`.**
Expected. Commit it. Do not revert it.

**A component import resolves to the wrong file.**
Check for the same file name in `ui/`, `effects/`, and `sections/`. See "Shared Configuration" in `docs/dangerous-areas.md`.
