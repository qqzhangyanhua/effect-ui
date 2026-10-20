# Project Map

effect-ui is a React UI and effects library distributed as a shadcn-compatible registry. Components are copied into the user's project with `npx shadcn add <url>`. See `README.md` (Chinese, with an English summary).

## Main Directories
- `packages/registry/` (`@effect-ui/registry`): all component source.
  - `src/ui`, `src/effects`, `src/sections`: installable components.
  - `src/templates/<name>/`: page templates (`registry:block`), each with `page.tsx`, `content.ts`, `theme.ts`. They import siblings with `./content` and `./theme`, not through the `@/components/ui/*` alias.
  - `src/hooks`, `src/lib`: hook and lib registry items.
  - `src/examples`: docs demos. `examples/index.ts` holds `demoMap`.
  - `src/catalog.ts`: the component list. It spreads every `catalog-batch*.ts`.
  - `src/registry-item.ts`: turns a catalog entry plus a source reader into registry JSON.
  - `src/dependencies.ts`: derives each item's npm and registry dependencies from its source imports.
  - `src/audit.ts`: registry consistency audit, run by `pnpm test`.
- `apps/docs/` (`@effect-ui/docs`): Next.js docs and demo site.
  - `app/page.tsx` (`/`), `app/docs/page.tsx` (`/docs`), `app/docs/[slug]/page.tsx` (`/docs/[slug]`), `app/preview/[slug]` (`/preview/[slug]`, template previews).
  - `app/r/[name]/route.ts`: `GET /r/[name]`, the public install endpoint.
  - `public/r/`: generated static registry JSON.
- `scripts/build-registry.ts`: writes the generated registry JSON. `scripts/check.sh`: local checks.
- `registry.json`: generated root registry index.
- `THIRD_PARTY_NOTICES.md`, `CREDITS.md`, `licenses/`: attribution for ported code.
- `docs/agents/`: issue tracker, triage labels, and domain-doc conventions.
- `.github/workflows/ci.yml`: the only CI workflow.

Workspace: pnpm (`pnpm-workspace.yaml` covers `apps/*` and `packages/*`). The pinned version is in `packageManager` in the root `package.json`.

## Import Aliases
Registry source imports only `@/components/ui/*`, `@/lib/utils`, `@/hooks/*`, or `./name` in the same directory. That is the layout users get after `shadcn add`.

The aliases are configured in three places that must stay in sync:

- `apps/docs/tsconfig.json`
- `packages/registry/tsconfig.json`
- `vitest.config.mts`

How each one resolves:

- `@/components/ui/*`: searches `ui/`, then `effects/`, then `sections/`.
- `@/hooks/*`: `packages/registry/src/hooks/*`.
- `@/lib/utils`: only this one path is mapped, not `@/lib/*`. The registry tsconfig and vitest point it at `packages/registry/src/lib/utils.ts`. The docs app has no explicit mapping, so its `@/*` rule resolves it to `apps/docs/lib/utils.ts`, a separate copy. Adding another file under `packages/registry/src/lib/` and importing it as `@/lib/<name>` requires a new mapping in all three configs.

## Important Flows
1. **Docs site.** `pnpm dev` runs `next dev --port 3000` in `apps/docs`. The docs app compiles registry source directly through the aliases above.
2. **Registry build.** `pnpm registry:build` runs `scripts/build-registry.ts`. It reads `catalog.ts` and each component file, then writes `registry.json`, `apps/docs/public/r/registry.json`, and `apps/docs/public/r/{name}.json`. `pnpm build` runs it before `next build`.
3. **Install endpoint.** `GET /r/[name]` builds the same JSON at request time from the catalog and source. The static files in `public/r/` and the route both come from `registry-item.ts`, so they agree as long as the registry build is current.
4. **CI.** On push to `main` and on pull requests: install, lint, typecheck, test, build, then fail if `registry.json` or `apps/docs/public/r` changed during the build.

## Adding or Changing a Component
Follow "新增组件" in `README.md`. In short:

1. Put the source in `packages/registry/src/{ui,effects,sections,templates,lib,hooks}`.
2. Register it in `catalog.ts` or a `catalog-batch*.ts` file. Do not list dependencies: the build derives them from the source imports (`docs/adr/0001-derive-dependency-lists-from-source.md`). Use `extraDependencies` only for an npm package the source never imports, such as a peer.
3. Add each new npm package to `packages/registry/package.json`. By convention it also goes into `apps/docs/package.json`.
4. For `registry:ui` and `registry:block`, add a demo and register it in `examples/index.ts`.
5. List the component name in the README component list.
6. For ported code, update `THIRD_PARTY_NOTICES.md` and `CREDITS.md`, and add `licenses/<license>/<package>/LICENSE`. See `docs/dangerous-areas.md`.
7. Run `pnpm registry:build` and commit the generated JSON.

`pnpm test` (the registry audit) fails when steps 2 through 5 or step 7 are missed.

## Domain Docs
See `docs/agents/domain.md`.
