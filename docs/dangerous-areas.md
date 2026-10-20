# Dangerous Areas

## Generated Files
Written by `scripts/build-registry.ts`. Do not edit them by hand:

- `registry.json`
- `apps/docs/public/r/registry.json`
- `apps/docs/public/r/{name}.json`

Change `packages/registry/src` instead, then run `pnpm registry:build` and commit the output with the source change. Stale output fails `pnpm test` and the CI drift check.

Files written by Next.js:

- `apps/docs/next-env.d.ts`: tracked, and says not to edit it. Leave Next.js-made changes to it out of unrelated commits.
- `apps/docs/AGENTS.md`: re-added by `next dev`. The file says to commit it instead of reverting it.

Local agent cache: `.agent/` is written by agent tooling and gitignored. Do not commit it or depend on its contents.

## Public Install Surface
- `GET /r/[name]` in `apps/docs/app/r/[name]/route.ts`, plus the static files in `apps/docs/public/r/`. Users install from these URLs.
- The shape of each item comes from `packages/registry/src/registry-item.ts`. Renaming a component, changing `target`, or changing that shape breaks existing install commands.

## Licensing and Attribution
Much of the registry is ported from third-party projects. This is the main legal risk in the repo.

- Do not copy code from Aceternity UI or React Bits. Their terms forbid redistribution. "Inspired by" reimplementations are fine and are marked that way in the README.
- When porting code, record the source in `THIRD_PARTY_NOTICES.md` and `CREDITS.md`, and add the license text under `licenses/`.
- Check the source license before porting. Non-MIT licenses (for example Apache-2.0 or BSD-3) are already noted per component in the README.

## Shared Configuration
- The `@/components/ui/*` alias searches `ui/`, `effects/`, then `sections/`. A file name that exists in two of those directories resolves to the first one. Keep component file names unique across all three. `templates/` is not part of this alias.
- The alias is defined in `apps/docs/tsconfig.json`, `packages/registry/tsconfig.json`, and `vitest.config.mts`. Change all three together.
- `packages/registry/src` is shared by the docs app, the registry build, and the install endpoint. A change there affects all three.

## Not Present
There is no auth, billing, database, migration, deployment script, or committed secret in this repo. `.env` and `.env.*` are gitignored. If a change introduces any of these, call it out.

## Rules
- Do not edit generated files directly.
- Do not change the public install surface, licensing records, or CI without an explicit risk note.
- Do not change `.github/workflows/ci.yml` casually. It is the only CI and the only release gate.
