# Agent Instructions

## Read First
- `docs/project-map.md`: layout, flows, and how to add a component.
- `docs/dangerous-areas.md`: generated files, the install endpoint, licensing.
- `docs/testing.md` and `docs/debugging.md`: read when running checks or fixing a failure.
- `apps/docs/AGENTS.md`: read before editing `apps/docs`. This Next.js version differs from older releases. Check `node_modules/next/dist/docs/` first.

## Default Workflow
1. Understand the task.
2. Check current workspace state.
3. Search for relevant files before editing.
4. Make the smallest safe change.
5. Add or update tests when behavior changes.
6. If the catalog or component source changed, run `pnpm registry:build` and keep the generated JSON in the change.
7. Run `./scripts/check.sh` (lint, typecheck, test). Use `./scripts/check.sh --full` to add `pnpm build`, matching CI.
8. Report changed files, validation results, and remaining risks.

## Do Not
- Edit generated files directly: `registry.json`, `apps/docs/public/r/`.
- Copy code from Aceternity UI or React Bits. Record the source and license for any ported code.
- Modify secrets or local environment files.
- Change the public install surface (`/r/[name]`, component names, registry JSON shape) or CI without calling out the risk.
- Hide failing or skipped checks.

## Large or High-Risk Changes
Use `docs/agent-plan-template.md` before editing. Stop after the plan for high-risk areas and ask for human review.

## Agent skills

### Issue tracker

Issues and specs live as GitHub issues in `qqzhangyanhua/effect-ui`. See `docs/agents/issue-tracker.md`.

### Triage labels

Five default labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
