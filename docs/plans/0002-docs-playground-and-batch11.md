# Agent Plan: docs playground and Batch 11 (Micro)

Decisions behind this plan: `docs/adr/0005`. Terms: `CONTEXT.md` (Demo, Control, Batch, Original implementation).

Reference reviewed: React Bits (MIT + Commons Clause). Only its public component index, README and LICENSE were read. No component source was opened and none will be; everything below is an original implementation.

## Goal
Two workstreams, delivered as three serial PRs:

- **A1 – docs page shell.** Component pages get a React Bits style layout: top-level `Preview | Code` tabs, `Code` split into `用法 | 安装 | 源码` (source files as sub-tabs), page width `max-w-5xl`, a full-screen button that opens `/preview/[slug]` for every component. No controls yet.
- **A2 – controls.** Catalog entries may declare controls on `PropDoc`; the preview shows a control panel under the demo with a reset button and a "复制当前配置" button. 20 existing components get controls.
- **A3 – Batch 11 trial.** New `micro` category (label 微交互) with 10 original micro-interaction components, each with controls, then review before the remaining ~20.

### A2 control model (confirmed)

```ts
type ControlDef =
  | { kind: "range"; value: number; min: number; max: number; step?: number }
  | { kind: "select"; value: string; options: readonly string[] }
  | { kind: "color"; value: string }
  | { kind: "boolean"; value: boolean }
  | { kind: "text"; value: string }

interface PropDoc { name; type; defaultValue?; description; control?: ControlDef }
```

- `control.value` is the demo's start value; `defaultValue` stays the component's own default (display string).
- A demo with controls is written as `export function XDemo({ speed = 1.2, color = "#fff" }: Partial<XControls> = {})`. The control panel passes current values as props. `usage.ts` rewrites that signature to `()` and inserts `const speed = 1.2` lines at the top of the body, so the 用法 code stays copy-pasteable and shows default values only.
- Code tab does not follow live values (server-side shiki stays). "复制当前配置" copies plain-text JSX `<X speed={2} color="#fff" />`.
- No URL state. Preview follows the site theme. Full-screen page renders the demo with `control.value`s and no panel.

### A2 components receiving controls (20)
`shimmer-text`, `split-text`, `typing-text`, `scramble-text`, `glitch-text`, `variable-font-proximity`, `particles`, `aurora-background`, `silk`, `iridescence`, `lightning`, `letter-glitch-wall`, `shader-backgrounds` (variant), `shader-pack-2` (variant), `splash-cursor`, `target-cursor`, `magnetic`, `tilt`, `border-beam`, `siri-orb`.

### A3 Batch 11 trial (10)
Names checked against the registry index, no collisions. Own names; React Bits proper nouns are not reused.

| Name | What it is | Suggested controls |
| --- | --- | --- |
| `squish-switch` | Toggle whose thumb squashes while dragging/pressing | `size`, `color`, `squish` |
| `jelly-radio` | Radio group with a wobbling indicator that travels between options | `stiffness`, `color` |
| `spring-check` | Checkbox with a spring-drawn check mark | `strokeWidth`, `color`, `duration` |
| `peek-rating` | Star rating that previews the hovered value with a label | `max`, `allowHalf`, `color` |
| `slide-to-confirm` | Slide a handle to the end to confirm, snaps back on release | `label`, `threshold`, `color` |
| `swipe-row` | List row that swipes to reveal actions | `actionWidth`, `direction` |
| `fuse-button` | Press-and-hold button with a burning fuse progress ring | `holdMs`, `color` |
| `pulse-heart` | Like button with a pulse and particle ring | `size`, `color`, `burst` |
| `lattice-loader` | Grid of dots animating in a wave | `rows`, `cols`, `speed`, `color` |
| `warm-tooltip` | Tooltip that fades in from the trigger with a soft glow | `delay`, `side`, `glow` |

Out of scope for all three PRs: thumbnail index page, client-side highlighting, `three` / `@react-three/*`, the other ~20 Micro items, other React Bits categories (tracked for Batch 12+).

## Files Likely Involved

**A1**
- `apps/docs/app/docs/[slug]/page.tsx`: tabs layout, width, full-screen link for all items.
- New `apps/docs/components/component-tabs.tsx` (client, Preview/Code + Code sub-tabs); `component-preview.tsx` adjusted.
- `apps/docs/app/preview/[slug]/page.tsx`: drop the hard-coded template map, use `demoMap` + `visibleComponents`; keep `dynamicParams = false`. Templates keep rendering the template component directly.

**A2**
- `packages/registry/src/catalog.ts`: `ControlDef`, `PropDoc.control`.
- Catalog files holding the 20 entries (`catalog.ts`, `catalog-batch*.ts`): add `control` to existing `props`.
- `packages/registry/src/examples/*`: the 20 demos get the destructured-defaults signature.
- `apps/docs/lib/usage.ts`: signature rewrite; add a unit test file for it.
- New `apps/docs/components/control-panel.tsx` (client; range/select/color/boolean/text widgets, reset, copy).
- `apps/docs/components/props-table.tsx`: unchanged, still the full static table.
- `packages/registry/src/audit.ts`: validate `control.value` is within `min/max` or in `options`.

**A3**
- New `packages/registry/src/ui/<name>.tsx` × 10 (directory `ui/`, not a new alias dir).
- `catalog.ts`: `ComponentCategory` gains `"micro"`, `categoryLabels.micro = "微交互"`, inserted after `buttons` in `categoryOrder`.
- New `packages/registry/src/catalog-batch11.ts`, spread into `catalog.ts`; `source: "original"`.
- New `packages/registry/src/examples/ui-demos-6.tsx` + `examples/index.ts`.
- README component list; `THIRD_PARTY_NOTICES.md` (Batch 11 section: 灵感来自 React Bits，原创实现，未打开源码); `CREDITS.md` (one Batch 11 line). `licenses/`: no new file.
- Generated, never hand-edited: `registry.json`, `apps/docs/public/r/`.
- Not touched: alias configs, `.github/workflows/ci.yml`, `registry-item.ts`, any existing component's install JSON shape.

## Risks
- Generated files: A2 changes `catalog.ts` types; check whether `registry-item.ts` serialises `props`. If it does, `control` would leak into install JSON (public surface) and must be stripped there. A3 regenerates JSON for 10 new items only.
- Public install surface: no renames, no `target` changes. New category `micro` appears in the registry index `categories` for the 10 new items only.
- Licensing: A3 is original work; the rule "do not open React Bits source" is binding for the whole batch. If any code is copied from anywhere during A3, stop and record it.
- `usage.ts` rewrite: it is regex/scanner based. The signature rewrite must handle `Partial<T> = {}` and multi-line destructuring; cover with tests before touching the 20 demos.
- Static export: `/preview/[slug]` grows from 5 to ~260 static pages; build time rises. Heavy WebGL demos are already `React.lazy`, so page weight is per visit.
- A3 is high-risk by `AGENTS.md` (licensing records). Stop after A2 is merged and get the A3 component list re-confirmed before coding.

## Plan
1. **A1.** Build `component-tabs.tsx`; move 预览/用法/安装/源码 into it; widen to `max-w-5xl`; generalise `/preview/[slug]`; add full-screen link to every component page. Props table stays below the tabs. `./scripts/check.sh --full`, manual check on a text effect, a WebGL background, a section, a template. PR.
2. **A2.**
   1. Add `ControlDef` and `PropDoc.control`; confirm `registry-item.ts` does not emit `control` (strip if it does); add audit rule.
   2. `usage.ts`: implement the signature rewrite with tests (single-line, multi-line, no-params unchanged).
   3. `control-panel.tsx` + wire into `component-tabs.tsx`; reset and copy buttons.
   4. Convert the 20 demos and add `control` to their catalog `props`.
   5. `pnpm registry:build` (should produce no JSON diff if `control` is stripped), `./scripts/check.sh --full`. PR.
3. **A3.** Re-confirm the 10 names. Add `micro` category, 10 components in `ui/`, `catalog-batch11.ts`, demos with controls, README lines, notices/credits. `pnpm registry:build`, `./scripts/check.sh --full`. PR. Then plan 11a/11b for the remaining Micro items.

## Validation
- `./scripts/check.sh --full` on each PR.
- A2: new `usage.ts` tests; audit test covers control ranges; `registry.json` diff is empty after step 2.5.
- Manual in `pnpm dev`: `/docs/shimmer-text` (tabs, controls, reset, copy), `/docs/silk` (WebGL in 5xl), `/docs/section-logo-cloud`, `/docs/saas-template` (iframe unchanged), `/preview/shimmer-text`, keyboard navigation of tabs, dark mode, `prefers-reduced-motion`.
- A3: each new component under `prefers-reduced-motion`, keyboard operability (switch/radio/check/rating/slide-to-confirm are form controls and must be focusable with ARIA roles).

## Rollback
Each PR reverts independently. A1 is docs-only. A2: removing `control` fields and the panel leaves demos working with their default parameters. A3: deleting `catalog-batch11.ts`, the 10 files and the demos, then `registry:build`, removes the items; `micro` category removal goes with it.

## Review gate
Stop after this plan and wait for human review. Stop again before A3 (licensing records).
