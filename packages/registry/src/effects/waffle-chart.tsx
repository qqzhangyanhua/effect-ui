"use client";

// Ported from Arc Library (MIT, (c) 2026 Elia Kuratli) — https://github.com/kuratlielia/arc-library/blob/main/registry/components/waffle-chart/waffle-chart.tsx

import { useAnimationActive } from "@/hooks/use-animation-active";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

import { useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties, type KeyboardEvent, type PointerEvent, type Ref , createContext, useContext} from "react";
import { animate, motion, useMotionValue, useSpring, useTransform } from "motion/react";
const ArcQuiet = createContext(false);

function useArcReduced() {
  const prefer = usePrefersReducedMotion();
  const quiet = useContext(ArcQuiet);
  return prefer || quiet;
}

const motionTokens = {
  duration: { instant: 0.12, fast: 0.16, exit: 0.18, standard: 0.24, considered: 0.48 },
  ease: {
    enter: [0.16, 1, 0.3, 1] as [number, number, number, number],
    exit: [0.7, 0, 0.84, 0] as [number, number, number, number],
    standard: [0.22, 1, 0.36, 1] as [number, number, number, number],
    inOut: [0.65, 0, 0.35, 1] as [number, number, number, number],
  },
  spring: {
    responsive: { type: "spring" as const, stiffness: 520, damping: 44 },
    gentle: { type: "spring" as const, stiffness: 340, damping: 34 },
    snappy: { type: "spring" as const, visualDuration: 0.26, bounce: 0 },
    smooth: { type: "spring" as const, visualDuration: 0.4, bounce: 0 },
    morph: { type: "spring" as const, visualDuration: 0.42, bounce: 0 },
  },
  stagger: { char: 0.016, word: 0.04, line: 0.08, item: 0.035 },
  blur: { subtle: 2, soft: 4, text: 8 },
};

const styles: Record<string, string> = new Proxy({} as Record<string, string>, { get: (_target, key) => (typeof key === "string" ? "waffle-chart-" + key : "") });

const arcCss = ":where([class^=\"waffle-chart-\"], [class*=\" waffle-chart-\"]) {\n  --surface: var(--background);\n  --surface-raised: var(--popover);\n  --surface-muted: var(--muted);\n  --text-secondary: var(--muted-foreground);\n  --text-muted: var(--muted-foreground);\n  --border-subtle: color-mix(in oklab, var(--border) 65%, var(--background));\n  --border-strong: color-mix(in oklab, var(--foreground) 28%, var(--border));\n  --accent: var(--primary);\n  --accent-strong: var(--primary);\n  --accent-foreground: var(--primary-foreground);\n  --accent-subtle: color-mix(in oklab, var(--primary) 12%, transparent);\n  --danger: var(--destructive);\n  --success: var(--primary);\n  --warning: var(--destructive);\n  --control-on: var(--primary);\n  --control-glyph: var(--primary-foreground);\n  --shadow-resting: 0 1px 2px oklch(0% 0 0 / .035);\n  --shadow-raised: 0 6px 18px oklch(0% 0 0 / .065), 0 1px 3px oklch(0% 0 0 / .035);\n  --shadow-floating: 0 20px 48px oklch(0% 0 0 / .105), 0 3px 10px oklch(0% 0 0 / .045);\n  --radius-control: 1.125rem;\n  --radius-panel: 1.625rem;\n  --radius-surface: 2.125rem;\n  --radius-pill: 9999px;\n  --control-height-sm: 2.25rem;\n  --control-height-md: 2.75rem;\n  --control-height-lg: 3.125rem;\n  --space-1: .25rem; --space-2: .5rem; --space-3: .75rem; --space-4: 1rem;\n  --space-5: 1.25rem; --space-6: 1.5rem; --space-8: 2rem;\n  --text-xs: .75rem; --text-sm: .875rem; --text-base: 1rem;\n  --tracking-body: -.01em; --leading-body: 1.4;\n  --font-body: inherit; --font-display: inherit;\n  --ease-enter: cubic-bezier(.16, 1, .3, 1);\n  --ease-standard: cubic-bezier(.22, 1, .36, 1);\n  --ease-exit: cubic-bezier(.7, 0, .84, 0);\n  --ease-in-out: cubic-bezier(.65, 0, .35, 1);\n  --ease-spring: linear(0, 0.0213, 0.0739, 0.1443, 0.2235, 0.305, 0.3849, 0.4606, 0.5305, 0.594, 0.6508, 0.7011, 0.7452, 0.7836, 0.8168, 0.8454, 0.8699, 0.8907, 0.9084, 0.9234, 0.9361, 0.9467, 0.9557, 0.9632, 0.9694, 0.9747, 0.979, 0.9826, 0.9857, 0.9882, 0.9902, 0.992, 0.9934, 0.9946, 0.9955, 0.9963, 1);\n  --duration-instant: 120ms; --duration-fast: 160ms; --duration-standard: 240ms; --duration-considered: 480ms; --duration-spring: 580ms;\n  --series-1: var(--primary);\n  --series-2: #7128a5;\n  --series-3: #e58f00;\n  --series-4: #009e84;\n  color: var(--foreground);\n}\n.dark :where([class^=\"waffle-chart-\"], [class*=\" waffle-chart-\"]) { --series-1: #55adff; --series-2: #9c37be; --series-3: #e66e00; --series-4: #00a861; }\n@supports (color: oklch(from red clamp(.4, l * sign(max(c - .02, 0)) + .5, .8) c h)) {\n  :where([class^=\"waffle-chart-\"], [class*=\" waffle-chart-\"]) {\n    --series-1: oklch(from var(--accent) calc(l * sign(max(c - .02, 0)) + .58 * (1 - sign(max(c - .02, 0)))) calc(c * sign(max(c - .02, 0)) + .15 * (1 - sign(max(c - .02, 0)))) calc(h * sign(max(c - .02, 0)) + 250 * (1 - sign(max(c - .02, 0)))));\n    --series-2: oklch(from var(--accent) clamp(.45, l * sign(max(c - .02, 0)) + .58 * (1 - sign(max(c - .02, 0))) - 0.25, .76) .19 calc(h * sign(max(c - .02, 0)) + 250 * (1 - sign(max(c - .02, 0))) + 57));\n    --series-3: oklch(from var(--accent) clamp(.45, l * sign(max(c - .02, 0)) + .58 * (1 - sign(max(c - .02, 0))) + 0.14, .76) .18 calc(h * sign(max(c - .02, 0)) + 250 * (1 - sign(max(c - .02, 0))) + 184));\n    --series-4: oklch(from var(--accent) clamp(.45, l * sign(max(c - .02, 0)) + .58 * (1 - sign(max(c - .02, 0))), .76) .21 calc(h * sign(max(c - .02, 0)) + 250 * (1 - sign(max(c - .02, 0))) + 292));\n  }\n  .dark :where([class^=\"waffle-chart-\"], [class*=\" waffle-chart-\"]) {\n    --series-1: oklch(from var(--accent) calc(l * sign(max(c - .02, 0)) + .73 * (1 - sign(max(c - .02, 0)))) calc(c * sign(max(c - .02, 0)) + .15 * (1 - sign(max(c - .02, 0)))) calc(h * sign(max(c - .02, 0)) + 250 * (1 - sign(max(c - .02, 0)))));\n    --series-2: oklch(from var(--accent) clamp(.485, l * sign(max(c - .02, 0)) + .73 * (1 - sign(max(c - .02, 0))) - 0.19, .665) .21 calc(h * sign(max(c - .02, 0)) + 250 * (1 - sign(max(c - .02, 0))) + 66));\n    --series-3: oklch(from var(--accent) clamp(.485, l * sign(max(c - .02, 0)) + .73 * (1 - sign(max(c - .02, 0))) + 0.02, .665) .21 calc(h * sign(max(c - .02, 0)) + 250 * (1 - sign(max(c - .02, 0))) + 175));\n    --series-4: oklch(from var(--accent) clamp(.485, l * sign(max(c - .02, 0)) + .73 * (1 - sign(max(c - .02, 0))) - 0.1, .665) .18 calc(h * sign(max(c - .02, 0)) + 250 * (1 - sign(max(c - .02, 0))) + 270));\n  }\n}\n.waffle-chart-figure { position: relative; min-width: 0; margin: 0; color: var(--foreground); font-family: var(--font-body); letter-spacing: var(--tracking-body); container-type: inline-size; }\n\n/* Series colors (--series-1 to --series-4) come from registry/foundation.waffle-chart-css. */\n.waffle-chart-body { display: grid; min-width: 0; grid-template-columns: minmax(0, 1fr); align-items: center; gap: var(--space-6); }\n@container (min-width: 420px) {\n  .waffle-chart-figure[data-legend] .waffle-chart-body { grid-template-columns: minmax(0, 232px) minmax(0, 1fr); gap: var(--space-6); }\n}\n\n.waffle-chart-board { min-width: 0; }\n.waffle-chart-grid { position: relative; width: 100%; max-width: 300px; margin-inline: auto; outline: none; touch-action: pan-y; user-select: none; -webkit-user-select: none; -webkit-tap-highlight-color: transparent; cursor: default; }\n\n/* Each cell is one unit. Its colour changes mid-flight with the same stagger as its travel. */\n.waffle-chart-cell { --inner: 0 0 0 0 transparent; --outer: 0 0 0 0 transparent; position: absolute; top: 0; left: 0; border-radius: 22%; background: var(--cell); box-shadow: var(--inner), var(--outer); will-change: transform; transition: background-color var(--duration-considered) var(--ease-standard) var(--delay, 0s), border-radius var(--duration-considered) var(--ease-standard) var(--delay, 0s), box-shadow var(--duration-considered) var(--ease-standard) var(--delay, 0s), opacity var(--duration-fast) var(--ease-standard); }\n.waffle-chart-grid[data-active] .waffle-chart-cell:not([data-on]) { opacity: .26 !important; transition: background-color var(--duration-considered) var(--ease-standard) var(--delay, 0s), border-radius var(--duration-considered) var(--ease-standard) var(--delay, 0s), opacity var(--duration-standard) var(--ease-standard); }\n.waffle-chart-cell[data-cursor] { --outer: 0 0 0 2px var(--surface), 0 0 0 3.5px color-mix(in oklab, var(--foreground) 55%, transparent); }\n\n/* Shape is the colour-free second channel: a cell morphs between these as it changes category. */\n.waffle-chart-cell[data-shape=\"round\"], .waffle-chart-swatch[data-shape=\"round\"], .waffle-chart-tipSwatch[data-shape=\"round\"] { border-radius: 50%; }\n.waffle-chart-cell[data-shape=\"framed\"] { --inner: inset 0 0 0 2.5px var(--cell), inset 0 0 0 3.25px var(--surface); }\n.waffle-chart-swatch[data-shape=\"framed\"], .waffle-chart-tipSwatch[data-shape=\"framed\"] { box-shadow: inset 0 0 0 2px var(--cell), inset 0 0 0 3px var(--surface); }\n\n.waffle-chart-tooltip { position: absolute; top: 0; left: 0; z-index: 2; display: grid; min-width: 150px; max-width: min(240px, 100%); gap: 2px; padding: 8px 12px; border: 1px solid var(--border); border-radius: 14px; background: var(--surface-raised); box-shadow: var(--shadow-floating); opacity: 0; pointer-events: none; scale: .96; transition: opacity var(--duration-fast) var(--ease-standard), scale var(--duration-fast) var(--ease-standard); }\n.waffle-chart-tooltip[data-shown] { opacity: 1; scale: 1; }\n.waffle-chart-tipRow { display: flex; min-width: 0; align-items: center; gap: 8px; margin: 0; font-size: var(--text-sm); line-height: 1.3; }\n.waffle-chart-tipSwatch { width: 10px; height: 10px; flex: none; border-radius: 3px; background: var(--cell); transition: background-color var(--duration-fast) var(--ease-standard); }\n.waffle-chart-tipName { min-width: 0; flex: 1; overflow: hidden; color: var(--text-secondary); text-overflow: ellipsis; white-space: nowrap; }\n.waffle-chart-tipValue { flex: none; margin-left: 8px; font-weight: 500; font-variant-numeric: tabular-nums; }\n.waffle-chart-tipMeta { margin: 0 0 0 18px; color: var(--text-muted); font-size: var(--text-xs); line-height: var(--leading-body); font-variant-numeric: tabular-nums; white-space: nowrap; }\n\n.waffle-chart-message { display: grid; min-height: 160px; place-items: center; margin: 0; color: var(--text-muted); font-size: var(--text-sm); }\n\n/* The legend doubles as the reading: each share rolls to its new value. */\n.waffle-chart-legend { display: grid; min-width: 0; grid-template-columns: repeat(auto-fill, minmax(132px, 1fr)); gap: 2px var(--space-2); margin: 0; padding: 0; list-style: none; }\n@container (min-width: 420px) { .waffle-chart-figure[data-legend] .waffle-chart-legend { grid-template-columns: minmax(0, 1fr); } }\n/* Below the side-by-side layout two columns would clip names like \"Wind and solar\", so the legend reads as one list. */\n/* Stacked, the legend shares the grid's measure and its row padding hangs outside, so swatches and shares line up with the cell edges. */\n@container (max-width: 419px) { .waffle-chart-legend { grid-template-columns: minmax(0, 1fr); margin-inline: max(-10px, calc((100% - 320px) / 2)); } }\n.waffle-chart-item { display: grid; width: 100%; min-height: 36px; grid-template-columns: 10px minmax(0, 1fr) auto; align-items: center; gap: 10px; padding: 4px 10px; border: 0; border-radius: 12px; background: transparent; color: var(--text-secondary); cursor: pointer; font: inherit; font-size: var(--text-sm); line-height: var(--leading-body); text-align: left; -webkit-tap-highlight-color: transparent; transition: color var(--duration-fast) var(--ease-standard), background-color var(--duration-fast) var(--ease-standard), opacity var(--duration-fast) var(--ease-standard), transform var(--duration-instant) var(--ease-standard); }\n.waffle-chart-item:active { transform: scale(.98); }\n.waffle-chart-item[data-on] { color: var(--foreground); background: color-mix(in oklab, var(--foreground) 5%, transparent); }\n.waffle-chart-item[data-dim] { opacity: .5; }\n.waffle-chart-item[aria-pressed=\"true\"] { color: var(--foreground); }\n@media (hover: hover) and (pointer: fine) { .waffle-chart-item:hover { color: var(--foreground); } }\n.waffle-chart-swatch { width: 10px; height: 10px; border-radius: 3px; background: var(--cell); }\n.waffle-chart-itemLabel { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n.waffle-chart-itemShare { color: var(--foreground); font-size: var(--text-base); font-weight: 500; font-variant-numeric: tabular-nums; text-align: right; min-width: 3.2em; }\n\n.waffle-chart-srOnly { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }\n\n@media (prefers-reduced-motion: reduce) {\n  .waffle-chart-cell, .waffle-chart-grid[data-active] .waffle-chart-cell:not([data-on]), .waffle-chart-tooltip, .waffle-chart-tipSwatch, .waffle-chart-item { transition: none; }\n}\n\n";

function ArcStyle() {
  return <style>{arcCss}</style>;
}


export interface WaffleCategory {
  /** Stable identity. Cells keep following their category when the data changes, so a new dataset flows instead of repainting. */
  key: string;
  /** Name in the legend, the tooltip, and the data table. */
  label: string;
  /** Raw amount. Shares are computed from the total; negatives count as zero. */
  value: number;
  /** Any CSS color. Defaults to the first series for accentKey, the supporting series for the next three, then neutral steps. */
  color?: string;
}

/** A unit chart: every cell is one share of the whole, so parts of a total read as countable squares. */
export interface WaffleChartProps {
  /** Categories in fill order. The first fills from the bottom-left corner, column by column. */
  data: WaffleCategory[];
  /** What the whole is, such as "Electricity generation, 2023". Names the chart for assistive technology. */
  label: string;
  /** Unit after each raw value in the tooltip and table, such as "TWh". */
  unit?: string;
  formatValue?: (value: number, category: WaffleCategory) => string;
  /** Grid rows. rows × columns cells make the whole; 10 × 10 means one cell per percent. */
  rows?: number;
  columns?: number;
  /** The category painted in the accent. Pass null to keep every category neutral. Defaults to the first category. */
  accentKey?: string | null;
  /** Controlled focused category. Others dim while one is focused. */
  activeKey?: string | null;
  defaultActiveKey?: string | null;
  onActiveChange?: (key: string | null) => void;
  /** Category list with shares that roll to their new value. */
  legend?: boolean;
  /** Decimal places for shares. */
  decimals?: number;
  emptyLabel?: string;
  ref?: Ref<HTMLElement>;
  className?: string;
}

type Cell = { id: number; key: string | null; slot: number };
type Pointer = { key: string; slot: number } | null;

const { spring } = motionTokens;
const GAP = 3;
/** accentKey takes the first series and the next three categories the supporting series. Anything past that falls back to neutral steps that alternate in lightness. */
const SHADES = [40, 20, 30, 14];
/** A second, colour-free channel: neutral categories cycle through square, round, and framed cells, so neighbours differ in shape as well as lightness. */
const SHAPES = ["square", "round", "framed"] as const;
const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));
const grouped = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

const subscribeNothing = () => () => {};
function useReducedMotionSafe() {
  const hydrated = useSyncExternalStore(subscribeNothing, () => true, () => false);
  return useArcReduced() && hydrated;
}

/** Whole cells per category by largest remainder, so the counts always add up to the grid. */
function allocate(data: WaffleCategory[], total: number, cells: number): number[] {
  if (total <= 0) return data.map(() => 0);
  const exact = data.map(item => Math.max(0, item.value) / total * cells);
  const counts = exact.map(Math.floor);
  let left = cells - counts.reduce((sum, count) => sum + count, 0);
  const order = exact.map((value, index) => ({ index, rest: value - Math.floor(value) })).sort((a, b) => b.rest - a.rest);
  for (let k = 0; left > 0 && k < order.length; k++, left--) counts[order[k]!.index]!++;
  return counts;
}

/**
 * Hands cells to categories while moving as few as possible: each category keeps the cells it already had,
 * surplus cells join the categories that grew, and every block takes its cells in their previous order so paths never cross.
 */
function reassign(previous: Cell[], data: WaffleCategory[], counts: number[]): Cell[] {
  const bySlot = [...previous].sort((a, b) => a.slot - b.slot);
  const kept = new Map<string, Cell[]>();
  const pool: Cell[] = [];
  const want = new Map(data.map((item, index) => [item.key, counts[index]]));
  for (const cell of bySlot) {
    const list = cell.key !== null ? kept.get(cell.key) ?? [] : [];
    if (cell.key !== null && list.length < (want.get(cell.key) ?? 0)) { list.push(cell); kept.set(cell.key, list); } else pool.push(cell);
  }
  const next: Cell[] = [];
  let slot = 0;
  data.forEach((item, index) => {
    const own = kept.get(item.key) ?? [];
    while (own.length < counts[index]! && pool.length) own.push(pool.shift()!);
    own.sort((a, b) => a.slot - b.slot).forEach(cell => next.push({ id: cell.id, key: item.key, slot: slot++ }));
  });
  pool.forEach(cell => next.push({ id: cell.id, key: null, slot: slot++ }));
  return next.sort((a, b) => a.id - b.id);
}

/** A share that rolls to its new value on a spring and holds its width with tabular figures. */
function Rolling({ value, decimals, reduced }: { value: number; decimals: number; reduced: boolean }) {
  const shown = useMotionValue(value);
  const text = useTransform(shown, current => `${current.toFixed(decimals)}%`);
  useEffect(() => {
    if (reduced) { shown.jump(value); return; }
    const controls = animate(shown, value, spring.smooth);
    return () => controls.stop();
  }, [reduced, shown, value]);
  return <motion.span>{text}</motion.span>;
}

export function WaffleChart({ data, label, unit = "", formatValue, rows = 10, columns = 10, accentKey, activeKey, defaultActiveKey = null, onActiveChange, legend = true, decimals = 0, emptyLabel = "No data", ref, className }: WaffleChartProps) {
  const reduced = useReducedMotionSafe();
  const figure = useRef<HTMLElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const tip = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => figure.current as HTMLElement);
  const arcLive = useAnimationActive(figure);
  const [arcSeen, setArcSeen] = useState(false);
  if (arcLive && !arcSeen) setArcSeen(true);
  const inView = arcSeen;
  const count = Math.max(1, rows * columns);
  const total = data.reduce((sum, item) => sum + Math.max(0, item.value), 0);
  const empty = !data.length || total <= 0;
  const accent = accentKey === undefined ? data[0]?.key ?? null : accentKey;

  // Cells are persistent objects; each data change reassigns them so they travel instead of repainting.
  const signature = `${count}|${data.map(item => `${item.key}:${item.value}`).join(",")}`;
  const counts = useMemo(() => allocate(data, total, count), [signature]); // eslint-disable-line react-hooks/exhaustive-deps
  const [layout, setLayout] = useState(() => ({ cells: reassign(Array.from({ length: count }, (_, id) => ({ id, key: null, slot: id })), data, counts), moved: new Set<number>(), version: 0 }));
  const [seen, setSeen] = useState(signature);
  if (seen !== signature) {
    setSeen(signature);
    const base = Array.from({ length: count }, (_, id) => layout.cells[id] ?? { id, key: null, slot: id });
    const next = reassign(base, data, counts);
    setLayout({ cells: next, moved: new Set(next.filter(cell => base[cell.id]!.slot !== cell.slot || base[cell.id]!.key !== cell.key).map(cell => cell.id)), version: layout.version + 1 });
  }
  const { cells, moved, version } = layout;

  const [ownActive, setOwnActive] = useState<string | null>(defaultActiveKey);
  const pinned = activeKey !== undefined ? activeKey : ownActive;
  const setPinned = (key: string | null) => { if (activeKey === undefined) setOwnActive(key); onActiveChange?.(key); };
  const [pointer, setPointer] = useState<Pointer>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const focusKey = pointer?.key ?? preview ?? pinned;
  const active = focusKey && data.some(item => item.key === focusKey) ? focusKey : null;

  const [side, setSide] = useState(0);
  useLayoutEffect(() => {
    const node = grid.current;
    if (!node) return;
    const read = () => setSide(node.clientWidth);
    read();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(read);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  const size = side ? (side - GAP * (columns - 1)) / columns : 0;
  const height = size ? size * rows + GAP * (rows - 1) : 0;
  // Column by column from the bottom-left corner, like a glass filling up.
  const place = (slot: number) => ({ x: Math.floor(slot / rows) * (size + GAP), y: (rows - 1 - (slot % rows)) * (size + GAP) });

  const colorOf = (key: string | null) => {
    if (key === null) return "transparent";
    const index = data.findIndex(item => item.key === key), item = data[index];
    if (!item) return "transparent";
    if (item.color) return item.color;
    if (key === accent) return "var(--series-1)";
    const rank = data.filter(entry => entry.key !== accent).findIndex(entry => entry.key === key);
    return rank < 3 ? `var(--series-${rank + 2})` : `color-mix(in oklab, var(--foreground) ${SHADES[(rank - 3) % SHADES.length]}%, var(--surface))`;
  };

  const shapeOf = (key: string | null) => {
    if (key === null || key === accent) return "square";
    const rank = data.filter(entry => entry.key !== accent).findIndex(entry => entry.key === key);
    return rank < 0 ? "square" : SHAPES[rank % SHAPES.length];
  };

  // The tooltip glides between cells on its own spring and stays inside the figure.
  const tipX = useMotionValue(0), tipY = useMotionValue(0);
  const follow = { stiffness: 520, damping: 44, restDelta: .01 };
  const glideX = useSpring(tipX, follow), glideY = useSpring(tipY, follow);
  const wasShown = useRef(false);
  useLayoutEffect(() => {
    const bubble = tip.current, host = figure.current, board = grid.current;
    if (!pointer || !bubble || !host || !board || !size) { wasShown.current = false; return; }
    const hostBox = host.getBoundingClientRect(), boardBox = board.getBoundingClientRect();
    const { x, y } = place(pointer.slot);
    const cx = boardBox.left - hostBox.left + x + size / 2, cy = boardBox.top - hostBox.top + y;
    const tw = bubble.offsetWidth, th = bubble.offsetHeight;
    let top = cy - th - 10;
    if (top < 0) top = cy + size + 10;
    const left = clamp(cx - tw / 2, 0, Math.max(0, hostBox.width - tw));
    tipX.set(left); tipY.set(clamp(top, 0, Math.max(0, hostBox.height - th)));
    if (!wasShown.current || reduced) { glideX.jump(tipX.get()); glideY.jump(tipY.get()); }
    wasShown.current = true;
  });

  const slotAt = (clientX: number, clientY: number) => {
    const box = grid.current?.getBoundingClientRect();
    if (!box || !size) return null;
    const col = clamp(Math.floor((clientX - box.left) / (size + GAP)), 0, columns - 1);
    const row = clamp(Math.floor((clientY - box.top) / (size + GAP)), 0, rows - 1);
    return col * rows + (rows - 1 - row);
  };
  const pointAt = (slot: number | null): Pointer => {
    if (slot === null) return null;
    const cell = cells.find(item => item.slot === slot);
    return cell?.key ? { key: cell.key, slot } : null;
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => { if (event.pointerType === "mouse" || event.buttons) setPointer(pointAt(slotAt(event.clientX, event.clientY))); };
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => { if (event.pointerType !== "mouse") event.currentTarget.setPointerCapture?.(event.pointerId); setPointer(pointAt(slotAt(event.clientX, event.clientY))); };

  // Arrows walk the grid cell by cell; Page keys jump between categories.
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (empty) return;
    if (event.key === "Escape" && pointer) { event.preventDefault(); setPointer(null); return; }
    const filled = cells.filter(cell => cell.key !== null).length;
    const at = pointer?.slot ?? 0;
    const col = Math.floor(at / rows), row = at % rows;
    const blocks = counts.map((size, index) => ({ start: counts.slice(0, index).reduce((sum, value) => sum + value, 0), size })).filter(block => block.size > 0);
    const block = Math.max(0, blocks.findIndex(item => at >= item.start && at < item.start + item.size));
    const moves: Record<string, () => number> = {
      ArrowUp: () => col * rows + Math.min(rows - 1, row + 1),
      ArrowDown: () => col * rows + Math.max(0, row - 1),
      ArrowRight: () => Math.min(columns - 1, col + 1) * rows + row,
      ArrowLeft: () => Math.max(0, col - 1) * rows + row,
      PageDown: () => blocks[Math.min(blocks.length - 1, block + 1)]!.start,
      PageUp: () => at > blocks[block]!.start ? blocks[block]!.start : blocks[Math.max(0, block - 1)]!.start,
      Home: () => 0,
      End: () => filled - 1,
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    setPointer(pointAt(clamp(pointer ? move() : 0, 0, Math.max(0, filled - 1))));
  };

  const format = (value: number, item: WaffleCategory) => `${formatValue ? formatValue(value, item) : grouped.format(value)}${unit ? ` ${unit}` : ""}`;
  const share = (item: WaffleCategory) => total > 0 ? Math.max(0, item.value) / total * 100 : 0;
  const reading = pointer ? data.find(item => item.key === pointer.key) ?? null : null;
  const announce = reading ? `${reading.label}, ${share(reading).toFixed(decimals)}%, ${format(reading.value, reading)}` : "";
  const summary = empty ? `${label}. ${emptyLabel}.` : `${label}. ${data.map(item => `${item.label} ${share(item).toFixed(decimals)}%`).join(", ")}.`;
  const shownX = reduced ? tipX : glideX, shownY = reduced ? tipY : glideY;
  const settle = reduced ? { duration: 0 } : spring.morph;

  return <ArcQuiet.Provider value={!arcLive}><ArcStyle /><svg width="0" height="0" aria-hidden="true" focusable="false"><title>{label}</title></svg><figure data-slot="waffle-chart" data-reduced={reduced ? "true" : "false"} data-motion={arcLive && !reduced ? "on" : "off"}  ref={figure} className={[styles.figure, className].filter(Boolean).join(" ")} aria-label={label} data-legend={legend || undefined}>
    <div className={styles.body}>
    <div className={styles.board}>
      <div ref={grid} className={styles.grid} style={{ height: height || undefined, aspectRatio: height ? undefined : `${columns} / ${rows}` }} data-active={active ? true : undefined}
        role="group" tabIndex={empty ? -1 : 0} aria-roledescription="waffle chart" aria-label={`${label}. ${count} cells. Use arrow keys to move between cells, Page Up and Page Down to jump between categories.`}
        onPointerMove={onPointerMove} onPointerDown={onPointerDown} onPointerUp={event => { if (event.pointerType !== "mouse") setPointer(null); }} onPointerCancel={() => setPointer(null)} onPointerLeave={event => { if (event.pointerType === "mouse") setPointer(null); }}
        onKeyDown={onKeyDown} onBlur={() => setPointer(null)} onFocus={event => { if (event.currentTarget.matches(":focus-visible") && !empty) setPointer(current => current ?? pointAt(0)); }}>
        {size > 0 && cells.map(cell => {
          const { x, y } = place(cell.slot);
          const travel = moved.has(cell.id) && !reduced;
          const delay = reduced ? 0 : (cell.slot / count) * .32;
          const on = cell.key !== null && cell.key === active;
          const shown = inView || reduced;
          // A travelling cell dips while it flies, so the flow reads as cells lifting out of one block and landing in another.
          const dip = travel ? [1, .62 + (version % 2) * .001, 1] : 1;
          return <motion.span key={cell.id} className={styles.cell} aria-hidden="true"
            data-on={on || undefined} data-cursor={pointer?.slot === cell.slot || undefined} data-empty={cell.key === null || undefined} data-shape={shapeOf(cell.key)}
            style={{ width: size, height: size, "--cell": colorOf(cell.key), "--delay": `${delay}s` } as CSSProperties}
            initial={reduced ? false : { x, y, scale: .4, opacity: 0 }}
            animate={shown ? { x, y, scale: dip, opacity: cell.key === null ? 0 : 1 } : { x, y, scale: .4, opacity: 0 }}
            transition={reduced ? { duration: 0 } : {
              x: { ...settle, delay }, y: { ...settle, delay },
              scale: travel ? { duration: .62, times: [0, .42, 1], ease: motionTokens.ease.inOut, delay } : { ...spring.snappy, delay: delay * .6 },
              opacity: { duration: motionTokens.duration.standard, ease: motionTokens.ease.standard, delay: delay * .6 },
            }} />;
        })}
      </div>
      {!empty && <motion.div ref={tip} className={styles.tooltip} data-shown={pointer ? true : undefined} style={{ x: shownX, y: shownY }} aria-hidden="true">
        <p className={styles.tipRow}>
          <span className={styles.tipSwatch} data-shape={shapeOf(reading?.key ?? null)} style={{ "--cell": colorOf(reading?.key ?? null) } as CSSProperties} />
          <span className={styles.tipName}>{reading?.label ?? ""}</span>
          <span className={styles.tipValue}>{reading ? `${share(reading).toFixed(decimals)}%` : ""}</span>
        </p>
        <p className={styles.tipMeta}>{reading ? format(reading.value, reading) : ""}</p>
      </motion.div>}
      {empty && <p className={styles.message}>{emptyLabel}</p>}
    </div>
    {legend && !empty && <ul className={styles.legend} aria-label={`${label} categories`} onPointerLeave={() => setPreview(null)}>
      {data.map(item => <li key={item.key}>
        <button type="button" className={styles.item} aria-pressed={pinned === item.key} data-on={active === item.key || undefined} data-dim={(active !== null && active !== item.key) || undefined}
          onClick={() => setPinned(pinned === item.key ? null : item.key)}
          onPointerEnter={event => { if (event.pointerType === "mouse") setPreview(item.key); }} onFocus={event => { if (event.currentTarget.matches(":focus-visible")) setPreview(item.key); }} onBlur={() => setPreview(null)}>
          <span className={styles.swatch} data-shape={shapeOf(item.key)} style={{ "--cell": colorOf(item.key) } as CSSProperties} aria-hidden="true" />
          <span className={styles.itemLabel}>{item.label}</span>
          <span className={styles.itemShare}><Rolling value={share(item)} decimals={decimals} reduced={reduced} /></span>
        </button>
      </li>)}
    </ul>}
    </div>
    <p className={styles.srOnly} aria-live="polite" aria-atomic="true">{announce}</p>
    <p className={styles.srOnly}>{summary}</p>
    {!empty && <div className={styles.srOnly}><table>
      <caption>{label}</caption>
      <thead><tr><th scope="col">Category</th><th scope="col">Value</th><th scope="col">Share</th><th scope="col">Cells</th></tr></thead>
      <tbody>{data.map((item, index) => <tr key={item.key}><th scope="row">{item.label}</th><td>{format(item.value, item)}</td><td>{share(item).toFixed(decimals)}%</td><td>{counts[index]}</td></tr>)}</tbody>
    </table></div>}
  </figure></ArcQuiet.Provider>;
}

export default WaffleChart;
