# Agent Plan

## Goal
TODO

## Files Likely Involved
TODO

## Risks
Check each one and remove the ones that do not apply:

- Generated files: `registry.json` and `apps/docs/public/r/` must be regenerated, not edited.
- Public install surface: component names, `target` paths, registry JSON shape.
- Licensing: ported code needs `THIRD_PARTY_NOTICES.md`, `CREDITS.md`, and `licenses/` entries.
- Shared aliases: `@/components/ui/*` in three configs.
- CI: `.github/workflows/ci.yml`.
- New dependencies: catalog entry, `packages/registry/package.json`, `apps/docs/package.json`.

See `docs/dangerous-areas.md`.

## Plan
1. TODO

## Validation
- `./scripts/check.sh`, or `./scripts/check.sh --full` when the catalog or source changed
- Manual checks in `pnpm dev`: TODO

## Rollback
TODO
