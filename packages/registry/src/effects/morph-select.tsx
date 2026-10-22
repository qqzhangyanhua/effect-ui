"use client";

// Ported from Arc Library (MIT, (c) 2026 Elia Kuratli) — https://github.com/kuratlielia/arc-library/blob/main/registry/components/morph-select/morph-select.tsx

import { useAnimationActive } from "@/hooks/use-animation-active";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore , createContext, useContext} from "react";
import type { CSSProperties, FocusEvent as ReactFocusEvent, KeyboardEvent as ReactKeyboardEvent, ReactNode } from "react";
import { AnimatePresence, animate, motion, useMotionValue } from "motion/react";
import type { Transition, Variants } from "motion/react";
import { Check, ChevronDown, Search, X } from "lucide-react";
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

const styles: Record<string, string> = new Proxy({} as Record<string, string>, { get: (_target, key) => (typeof key === "string" ? "morph-select-" + key : "") });

const arcCss = ":where([class^=\"morph-select-\"], [class*=\" morph-select-\"]) {\n  --surface: var(--background);\n  --surface-raised: var(--popover);\n  --surface-muted: var(--muted);\n  --text-secondary: var(--muted-foreground);\n  --text-muted: var(--muted-foreground);\n  --border-subtle: color-mix(in oklab, var(--border) 65%, var(--background));\n  --border-strong: color-mix(in oklab, var(--foreground) 28%, var(--border));\n  --accent: var(--primary);\n  --accent-strong: var(--primary);\n  --accent-foreground: var(--primary-foreground);\n  --accent-subtle: color-mix(in oklab, var(--primary) 12%, transparent);\n  --danger: var(--destructive);\n  --success: var(--primary);\n  --warning: var(--destructive);\n  --control-on: var(--primary);\n  --control-glyph: var(--primary-foreground);\n  --shadow-resting: 0 1px 2px oklch(0% 0 0 / .035);\n  --shadow-raised: 0 6px 18px oklch(0% 0 0 / .065), 0 1px 3px oklch(0% 0 0 / .035);\n  --shadow-floating: 0 20px 48px oklch(0% 0 0 / .105), 0 3px 10px oklch(0% 0 0 / .045);\n  --radius-control: 1.125rem;\n  --radius-panel: 1.625rem;\n  --radius-surface: 2.125rem;\n  --radius-pill: 9999px;\n  --control-height-sm: 2.25rem;\n  --control-height-md: 2.75rem;\n  --control-height-lg: 3.125rem;\n  --space-1: .25rem; --space-2: .5rem; --space-3: .75rem; --space-4: 1rem;\n  --space-5: 1.25rem; --space-6: 1.5rem; --space-8: 2rem;\n  --text-xs: .75rem; --text-sm: .875rem; --text-base: 1rem;\n  --tracking-body: -.01em; --leading-body: 1.4;\n  --font-body: inherit; --font-display: inherit;\n  --ease-enter: cubic-bezier(.16, 1, .3, 1);\n  --ease-standard: cubic-bezier(.22, 1, .36, 1);\n  --ease-exit: cubic-bezier(.7, 0, .84, 0);\n  --ease-in-out: cubic-bezier(.65, 0, .35, 1);\n  --ease-spring: linear(0, 0.0213, 0.0739, 0.1443, 0.2235, 0.305, 0.3849, 0.4606, 0.5305, 0.594, 0.6508, 0.7011, 0.7452, 0.7836, 0.8168, 0.8454, 0.8699, 0.8907, 0.9084, 0.9234, 0.9361, 0.9467, 0.9557, 0.9632, 0.9694, 0.9747, 0.979, 0.9826, 0.9857, 0.9882, 0.9902, 0.992, 0.9934, 0.9946, 0.9955, 0.9963, 1);\n  --duration-instant: 120ms; --duration-fast: 160ms; --duration-standard: 240ms; --duration-considered: 480ms; --duration-spring: 580ms;\n  --series-1: var(--primary);\n  --series-2: #7128a5;\n  --series-3: #e58f00;\n  --series-4: #009e84;\n  color: var(--foreground);\n}\n.dark :where([class^=\"morph-select-\"], [class*=\" morph-select-\"]) { --series-1: #55adff; --series-2: #9c37be; --series-3: #e66e00; --series-4: #00a861; }\n@supports (color: oklch(from red clamp(.4, l * sign(max(c - .02, 0)) + .5, .8) c h)) {\n  :where([class^=\"morph-select-\"], [class*=\" morph-select-\"]) {\n    --series-1: oklch(from var(--accent) calc(l * sign(max(c - .02, 0)) + .58 * (1 - sign(max(c - .02, 0)))) calc(c * sign(max(c - .02, 0)) + .15 * (1 - sign(max(c - .02, 0)))) calc(h * sign(max(c - .02, 0)) + 250 * (1 - sign(max(c - .02, 0)))));\n    --series-2: oklch(from var(--accent) clamp(.45, l * sign(max(c - .02, 0)) + .58 * (1 - sign(max(c - .02, 0))) - 0.25, .76) .19 calc(h * sign(max(c - .02, 0)) + 250 * (1 - sign(max(c - .02, 0))) + 57));\n    --series-3: oklch(from var(--accent) clamp(.45, l * sign(max(c - .02, 0)) + .58 * (1 - sign(max(c - .02, 0))) + 0.14, .76) .18 calc(h * sign(max(c - .02, 0)) + 250 * (1 - sign(max(c - .02, 0))) + 184));\n    --series-4: oklch(from var(--accent) clamp(.45, l * sign(max(c - .02, 0)) + .58 * (1 - sign(max(c - .02, 0))), .76) .21 calc(h * sign(max(c - .02, 0)) + 250 * (1 - sign(max(c - .02, 0))) + 292));\n  }\n  .dark :where([class^=\"morph-select-\"], [class*=\" morph-select-\"]) {\n    --series-1: oklch(from var(--accent) calc(l * sign(max(c - .02, 0)) + .73 * (1 - sign(max(c - .02, 0)))) calc(c * sign(max(c - .02, 0)) + .15 * (1 - sign(max(c - .02, 0)))) calc(h * sign(max(c - .02, 0)) + 250 * (1 - sign(max(c - .02, 0)))));\n    --series-2: oklch(from var(--accent) clamp(.485, l * sign(max(c - .02, 0)) + .73 * (1 - sign(max(c - .02, 0))) - 0.19, .665) .21 calc(h * sign(max(c - .02, 0)) + 250 * (1 - sign(max(c - .02, 0))) + 66));\n    --series-3: oklch(from var(--accent) clamp(.485, l * sign(max(c - .02, 0)) + .73 * (1 - sign(max(c - .02, 0))) + 0.02, .665) .21 calc(h * sign(max(c - .02, 0)) + 250 * (1 - sign(max(c - .02, 0))) + 175));\n    --series-4: oklch(from var(--accent) clamp(.485, l * sign(max(c - .02, 0)) + .73 * (1 - sign(max(c - .02, 0))) - 0.1, .665) .18 calc(h * sign(max(c - .02, 0)) + 250 * (1 - sign(max(c - .02, 0))) + 270));\n  }\n}\n/* The root lays out the label and the anchor. The anchor holds the closed trigger's place; the shape floats over it and grows past it when open. */\n.morph-select-root { --ms-h: var(--control-height-md); --ms-trigger-w: 0px; position: relative; display: inline-grid; justify-items: start; gap: var(--space-2); min-width: 0; color: var(--foreground); font-family: var(--font-body); font-size: var(--text-sm); letter-spacing: var(--tracking-body); line-height: var(--leading-body); }\n.morph-select-root[data-align=\"end\"] { justify-items: end; }\n.morph-select-root[data-open] { z-index: 30; }\n.morph-select-label { color: var(--text-secondary); font-size: var(--text-sm); font-weight: 500; }\n\n.morph-select-anchor { position: relative; height: var(--ms-h); max-width: 100%; }\n\n/* One material for both states. The border is an overlay so it never changes a measurement. */\n.morph-select-shape { position: absolute; top: 0; left: 0; overflow: clip; background: var(--surface); box-shadow: var(--shadow-resting); transition: box-shadow var(--duration-considered) var(--ease-standard), background-color var(--duration-fast) var(--ease-standard); }\n.morph-select-shape::after { content: \"\"; position: absolute; inset: 0; z-index: 2; border: 1px solid var(--border); border-radius: inherit; pointer-events: none; transition: border-color var(--duration-fast) var(--ease-standard); }\n.morph-select-root[data-align=\"end\"] .morph-select-shape { right: 0; left: auto; }\n.morph-select-root[data-open] .morph-select-shape { background: var(--surface-raised); box-shadow: var(--shadow-floating); }\n.morph-select-root[data-disabled] .morph-select-shape { opacity: .55; }\n@media (hover: hover) and (pointer: fine) {\n  .morph-select-root:not([data-open], [data-disabled]) .morph-select-shape:hover { background: var(--surface-muted); }\n  .morph-select-root:not([data-open], [data-disabled]) .morph-select-shape:hover::after { border-color: var(--border-strong); }\n}\n\n/* The lid is the trigger row. It stays at the top of the surface in both states and sits above the list, so a lifted label passes over it. */\n.morph-select-lid { position: absolute; z-index: 1; top: 0; right: 0; left: 0; height: var(--ms-h); }\n\n.morph-select-trigger { box-sizing: border-box; display: flex; height: var(--ms-h); align-items: center; gap: var(--space-2); padding: 0 36px 0 14px; font-size: var(--text-sm); font-weight: 500; white-space: nowrap; }\n.morph-select-lid .morph-select-trigger { position: absolute; inset: 0; width: 100%; margin: 0; border: 0; background: transparent; color: inherit; cursor: pointer; font-family: inherit; letter-spacing: inherit; text-align: left; -webkit-tap-highlight-color: transparent; touch-action: manipulation; }\n.morph-select-lid .morph-select-trigger:disabled { cursor: not-allowed; }\n/* An invisible copy that says how wide the closed trigger wants to be. It sits in flow until the first measurement lands, so the server render already has the right size. */\n.morph-select-measure { position: static; visibility: hidden; pointer-events: none; width: max-content; max-width: min(20rem, calc(100vw - 2rem)); }\n.morph-select-root[data-ready] .morph-select-measure { position: absolute; top: 0; left: 0; }\n.morph-select-root[data-align=\"end\"][data-ready] .morph-select-measure { right: 0; left: auto; }\n\n.morph-select-slot { position: relative; display: block; min-width: 0; height: 100%; flex: 1; }\n.morph-select-slot[data-hidden] { opacity: 0; transition: opacity var(--duration-instant) var(--ease-standard); }\n.morph-select-layer { position: absolute; inset: 0; display: flex; align-items: center; gap: var(--space-2); min-width: 0; }\n.morph-select-valueText { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n.morph-select-placeholder { color: var(--text-muted); font-weight: 400; }\n.morph-select-icon { display: grid; width: 20px; height: 20px; flex: none; place-items: center; color: var(--text-secondary); }\n.morph-select-icon > svg { width: 16px; height: 16px; }\n.morph-select-icon > img { width: 20px; height: 20px; border-radius: 50%; object-fit: cover; }\n\n.morph-select-chevron { position: absolute; top: 50%; right: 12px; display: grid; width: 16px; height: 16px; margin-top: -8px; place-items: center; color: var(--text-muted); pointer-events: none; }\n\n/* Search takes the lid's place when the list is long. */\n.morph-select-searchRow { position: absolute; inset: 0; display: flex; align-items: center; gap: var(--space-2); padding: 0 2px 0 14px; }\n.morph-select-searchRow[inert] { pointer-events: none; }\n.morph-select-searchIcon { flex: none; color: var(--text-muted); }\n.morph-select-input { min-width: 0; height: 100%; flex: 1; padding: 0; border: 0; background: transparent; color: var(--foreground); font: inherit; font-size: var(--text-sm); letter-spacing: var(--tracking-body); outline: none; }\n.morph-select-input::placeholder { color: var(--text-muted); }\n.morph-select-clear { display: grid; width: 24px; height: 24px; flex: none; place-items: center; padding: 0; border: 0; border-radius: var(--radius-pill); background: color-mix(in oklab, var(--foreground) 8%, transparent); color: var(--text-secondary); cursor: pointer; -webkit-tap-highlight-color: transparent; }\n/* Sits exactly over the shared chevron, so the chevron closes the list in both lid states. */\n.morph-select-closeHit { width: 36px; height: 36px; flex: none; padding: 0; border: 0; border-radius: var(--radius-pill); background: transparent; cursor: pointer; -webkit-tap-highlight-color: transparent; transition: background-color var(--duration-fast) var(--ease-standard); }\n@media (hover: hover) and (pointer: fine) {\n  .morph-select-closeHit:hover, .morph-select-clear:hover { background: color-mix(in oklab, var(--foreground) 8%, transparent); }\n  .morph-select-clear:hover { color: var(--foreground); }\n}\n\n/* The list hangs under the lid at its own width, so it measures the same whatever size the surface is mid spring. */\n.morph-select-listFace { position: absolute; top: var(--ms-h); left: 0; box-sizing: border-box; width: max(var(--ms-trigger-w), min(var(--ms-panel-w), calc(100vw - 2rem))); padding: 0 6px 6px; }\n.morph-select-root[data-align=\"end\"] .morph-select-listFace { right: 0; left: auto; }\n.morph-select-listFace::before { content: \"\"; position: absolute; top: 0; right: 14px; left: 14px; height: 1px; background: var(--border-subtle); }\n.morph-select-listFace[inert] { pointer-events: none; }\n.morph-select-scroll { max-height: var(--ms-list-max); overflow-y: auto; overscroll-behavior: contain; padding-top: 6px; scrollbar-width: thin; }\n.morph-select-options { position: relative; display: grid; gap: 2px; }\n.morph-select-highlight { position: absolute; top: 0; right: 0; left: 0; border-radius: 16px; background: color-mix(in oklab, var(--foreground) 6.5%, transparent); pointer-events: none; }\n\n.morph-select-group { display: grid; gap: 2px; }\n.morph-select-group + .morph-select-group { margin-top: 4px; }\n.morph-select-groupLabel { padding: 8px 10px 4px; color: var(--text-muted); font-size: var(--text-xs); font-weight: 400; }\n\n.morph-select-option { position: relative; display: flex; min-height: 36px; box-sizing: border-box; align-items: center; gap: var(--space-2); padding: 0 10px 0 8px; border-radius: 16px; color: var(--text-secondary); cursor: pointer; user-select: none; -webkit-user-select: none; transition: color var(--duration-fast) var(--ease-standard); }\n.morph-select-option[data-active], .morph-select-option[aria-selected=\"true\"] { color: var(--foreground); }\n.morph-select-option[aria-disabled=\"true\"] { color: var(--text-muted); cursor: not-allowed; opacity: .6; }\n/* Lid padding minus list inset, so a lifted label starts exactly level with where it lands. */\n.morph-select-optionValue { display: flex; min-width: 0; flex: 1; align-items: center; gap: var(--space-2); font-weight: 500; }\n.morph-select-meta { flex: none; color: var(--text-muted); font-size: var(--text-xs); font-variant-numeric: tabular-nums; }\n.morph-select-check { display: grid; width: 16px; height: 16px; flex: none; place-items: center; color: var(--foreground); opacity: 0; transform: scale(.6); transition: opacity var(--duration-fast) var(--ease-standard), transform var(--duration-spring) var(--ease-spring); }\n.morph-select-check[data-on] { opacity: 1; transform: none; }\n.morph-select-empty { margin: 0; padding: 12px 10px 14px; color: var(--text-muted); font-size: var(--text-sm); }\n\n.morph-select-srOnly { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); clip-path: inset(50%); white-space: nowrap; }\n\n@media (prefers-reduced-motion: reduce) {\n  .morph-select-shape, .morph-select-check, .morph-select-slot { transition-duration: 0ms; }\n}\n@media (prefers-contrast: more) {\n  .morph-select-shape::after { border-color: var(--border-strong); }\n}\n\n";

function ArcStyle() {
  return <style>{arcCss}</style>;
}


export interface MorphSelectOption {
  value: string;
  label: string;
  /** A 20px mark shown before the label, in the list and in the trigger. An avatar or a plain icon. */
  icon?: ReactNode;
  /** Short trailing detail such as an offset or a count. Rendered with tabular numerals. */
  meta?: string;
  /** Extra words that match this option when searching. */
  keywords?: string;
  disabled?: boolean;
}

/** A labelled run of options. */
export interface MorphSelectGroup {
  label: string;
  options: MorphSelectOption[];
}

export type MorphSelectItem = MorphSelectOption | MorphSelectGroup;

/**
 * A select whose trigger is the list. Opening grows the trigger itself into the options surface, a highlight glides between options,
 * and the chosen option's label lifts out of the list and settles into the trigger while the trigger springs to its new width.
 * Supports groups, type-ahead, search for long lists, and the full listbox keyboard model.
 * Use it for compact property pickers and form fields with up to a few hundred options. Prefer a combobox when people mostly type free text.
 */
export interface MorphSelectProps {
  /** Visible label, also the accessible name of the trigger and the list. */
  label: string;
  /** Keeps the label for assistive technology only. */
  hideLabel?: boolean;
  items: MorphSelectItem[];
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string, option: MorphSelectOption) => void;
  placeholder?: string;
  /** Shows a search field in place of the trigger when open. "auto" turns it on above eight options. */
  searchable?: boolean | "auto";
  searchPlaceholder?: string;
  /** Width of the open surface in px. It never gets narrower than the trigger. Defaults to 272. */
  panelWidth?: number;
  /** Tallest the option list gets before it scrolls, in px. Defaults to 296. */
  maxListHeight?: number;
  /** Which edge of the trigger stays put while the surface grows. */
  align?: "start" | "end";
  /** Adds a hidden input for native form submission. */
  name?: string;
  disabled?: boolean;
  className?: string;
}

type Section = { key: string; label?: string; options: MorphSelectOption[] };
type Change = { key: number; value: string | null; dir: number; fly: { x: number; y: number } | null };

const { blur } = motionTokens;
type Bezier = [number, number, number, number];
const enter = motionTokens.ease.enter as Bezier;
const standard = motionTokens.ease.standard as Bezier;
/** Duration springs restated as stiffness and damping, so a retarget mid flight keeps the velocity it already has. */
const physical = (visualDuration: number, bounce: number): Transition => {
  const root = 2 * Math.PI / (visualDuration * 1.2);
  return { type: "spring", stiffness: root * root, damping: 2 * (1 - bounce) * root, mass: 1 };
};
const GROW = physical(.4, 0), SHRINK = physical(.34, 0), GLIDE = physical(.28, 0), WIDTH = physical(.42, 0);
/** Width that narrows never overshoots: dipping even half a pixel under the closed width ellipsizes the label and nudges the chevron. */
const NARROW = physical(.42, 0);
/** The lifted label travels a touch faster than the surface folds, so the closing edge never catches it. */
const FLY = physical(.3, 0);
const OPEN_RADIUS = 22;
const TYPEAHEAD_RESET = 600, PAGE = 8;

const subscribe = () => () => {};
function useReducedFlag() {
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false);
  return useArcReduced() && hydrated;
}

const isGroup = (item: MorphSelectItem): item is MorphSelectGroup => "options" in item;

/** Loose options between groups gather into unlabelled sections, so the list keeps the order it was given. */
function normalize(items: MorphSelectItem[]): Section[] {
  const out: Section[] = [];
  items.forEach((item, index) => {
    if (isGroup(item)) { out.push({ key: `group-${index}`, label: item.label, options: item.options }); return; }
    const last = out[out.length - 1];
    if (last && !last.label) last.options.push(item);
    else out.push({ key: `loose-${index}`, options: [item] });
  });
  return out;
}

function matches(option: MorphSelectOption, needle: string) {
  return `${option.label} ${option.meta ?? ""} ${option.keywords ?? ""}`.toLowerCase().includes(needle);
}

/** Lid values roll with the list: a later option rises from below, an earlier one drops from above. */
const valueVariants: Variants = {
  enter: (change: Change) => change.fly ? { opacity: 1, x: change.fly.x, y: change.fly.y, filter: "blur(0px)" } : { opacity: 0, x: 0, y: `${change.dir * .5}em`, filter: `blur(${blur.soft}px)` },
  rest: { opacity: 1, x: 0, y: 0, filter: "blur(0px)" },
  exit: (change: Change) => ({ opacity: 0, x: 0, y: change.fly ? "-0.3em" : `${change.dir * -.45}em`, filter: `blur(${blur.subtle}px)`, transition: { duration: .12, ease: standard } }),
};
const valueFade: Variants = { enter: { opacity: 0 }, rest: { opacity: 1, x: 0, y: 0, filter: "blur(0px)" }, exit: { opacity: 0, transition: { duration: .1 } } };

/** The closed trigger's width, rounded up. offsetWidth rounds to the nearest pixel, and half a pixel short is enough to ellipsize the label. */
const triggerWidth = (node: HTMLElement) => {
  const exact = node.getBoundingClientRect().width, rounded = node.offsetWidth;
  // Under a scaled ancestor the rect is scaled too, so fall back to the layout width with a pixel of slack.
  return Math.abs(exact - rounded) <= .5 ? Math.ceil(exact - .01) : rounded + 1;
};

export function MorphSelect({ label, hideLabel = false, items, value, defaultValue = null, onValueChange, placeholder = "Select", searchable = "auto", searchPlaceholder,
  panelWidth = 272, maxListHeight = 296, align = "start", name, disabled = false, className }: MorphSelectProps) {
  const preferReduced = useReducedFlag();
  const uid = useId();
  const labelId = `${uid}-label`, listId = `${uid}-list`, optionId = (index: number) => `${uid}-option-${index}`;

  const rootRef = useRef<HTMLDivElement>(null);
  const arcLive = useAnimationActive(rootRef);
  const reduced = preferReduced || !arcLive;
  const measureRef = useRef<HTMLSpanElement>(null);
  const listFaceRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const slotRef = useRef<HTMLSpanElement>(null);
  const optionRefs = useRef(new Map<string, HTMLElement>());

  const sections = useMemo(() => normalize(items), [items]);
  const all = useMemo(() => sections.flatMap(section => section.options), [sections]);
  const indexOf = useMemo(() => new Map(all.map((option, index) => [option.value, index])), [all]);
  const canSearch = searchable === "auto" ? all.length > 8 : searchable;

  const [inner, setInner] = useState<string | null>(defaultValue);
  const selected = value !== undefined ? value : inner;
  const selectedOption = selected === null ? undefined : all.find(option => option.value === selected);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<string | null>(null);
  const [change, setChange] = useState<Change>({ key: 0, value: null, dir: 1, fly: null });

  const needle = query.trim().toLowerCase();
  const visibleSections = useMemo(() => needle
    ? sections.map(section => ({ ...section, options: section.options.filter(option => matches(option, needle)) })).filter(section => section.options.length)
    : sections, [needle, sections]);
  const enabled = useMemo(() => visibleSections.flatMap(section => section.options).filter(option => !option.disabled), [visibleSections]);
  const current = active !== null && enabled.some(option => option.value === active) ? active : enabled[0]?.value ?? null;
  const resultCount = visibleSections.reduce((sum, section) => sum + section.options.length, 0);

  /* The shape: one surface whose width, height, and corners spring between the trigger and the open list. */
  const anchorW = useMotionValue<number | string>("auto");
  const shapeW = useMotionValue<number | string>("100%"), shapeH = useMotionValue<number | string>("100%"), radius = useMotionValue(22);
  const sizes = useRef({ trigger: 0, lid: 0, listW: 0, listH: 0 });
  const live = useRef({ open: false, reduced: false, measured: false });
  useLayoutEffect(() => { live.current.reduced = reduced; }, [reduced]);

  const place = useCallback((animated: boolean) => {
    const { trigger, lid, listW, listH } = sizes.current;
    if (!trigger || !lid) return;
    const isOpen = live.current.open;
    const next = isOpen ? { w: Math.max(trigger, listW), h: lid + listH, r: OPEN_RADIUS } : { w: trigger, h: lid, r: lid / 2 };
    if (!animated || live.current.reduced || !live.current.measured) {
      anchorW.jump(trigger); shapeW.jump(next.w); shapeH.jump(next.h); radius.jump(next.r);
      live.current.measured = true;
      return;
    }
    const lastW = typeof shapeW.get() === "number" ? shapeW.get() as number : next.w;
    const lastH = typeof shapeH.get() === "number" ? shapeH.get() as number : next.h;
    const lastAnchor = typeof anchorW.get() === "number" ? anchorW.get() as number : trigger;
    const transition = next.w * next.h >= lastW * lastH ? GROW : SHRINK;
    animate(anchorW, trigger, trigger < lastAnchor ? NARROW : WIDTH);
    animate(shapeW, next.w, isOpen ? transition : next.w < lastW ? NARROW : WIDTH);
    animate(shapeH, next.h, transition);
    animate(radius, next.r, transition);
  }, [anchorW, radius, shapeH, shapeW]);

  useLayoutEffect(() => {
    const measure = measureRef.current, face = listFaceRef.current, root = rootRef.current;
    if (!measure || !face || !root) return;
    const read = () => {
      const previous = sizes.current;
      // The open list is never narrower than the trigger; the width goes to CSS directly so a new label never waits on a render.
      root.style.setProperty("--ms-trigger-w", `${triggerWidth(measure)}px`);
      const next = { trigger: triggerWidth(measure), lid: measure.offsetHeight, listW: face.offsetWidth, listH: face.offsetHeight };
      const changed = next.trigger !== previous.trigger || next.lid !== previous.lid || (live.current.open && (next.listW !== previous.listW || next.listH !== previous.listH));
      sizes.current = next;
      if (changed) place(live.current.measured);
    };
    read();
    root.dataset.ready = "";
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(read);
    observer.observe(measure);
    observer.observe(face);
    return () => observer.disconnect();
  }, [place]);

  useLayoutEffect(() => {
    if (live.current.open === open) return;
    live.current.open = open;
    // A pick changes the label and closes in the same commit, so both faces are read fresh before the shape moves.
    const face = listFaceRef.current, measure = measureRef.current;
    if (face && measure) {
      rootRef.current?.style.setProperty("--ms-trigger-w", `${triggerWidth(measure)}px`);
      sizes.current = { trigger: triggerWidth(measure), lid: measure.offsetHeight, listW: face.offsetWidth, listH: face.offsetHeight };
    }
    place(true);
  }, [open, place]);

  /* The highlight glides between options on its own spring and fades when nothing is active. */
  const hy = useMotionValue(0), hh = useMotionValue(0), ho = useMotionValue(0);
  const scrollIntent = useRef(false);
  useLayoutEffect(() => {
    const node = open && current !== null ? optionRefs.current.get(current) : undefined;
    if (!node) { animate(ho, 0, { duration: reduced || !open ? 0 : .12, ease: standard }); return; }
    const top = node.offsetTop, height = node.offsetHeight;
    if (ho.get() < .05 || reduced) { hy.jump(top); hh.jump(height); }
    else { animate(hy, top, GLIDE); animate(hh, height, GLIDE); }
    animate(ho, 1, { duration: reduced ? 0 : .12, ease: enter });
    const scroller = scrollRef.current;
    if (scroller && scrollIntent.current) {
      scrollIntent.current = false;
      const pad = 6;
      if (top < scroller.scrollTop + pad) scroller.scrollTop = top - pad;
      else if (top + height > scroller.scrollTop + scroller.clientHeight - pad) scroller.scrollTop = top + height - scroller.clientHeight + pad;
    }
  }, [current, hh, ho, hy, open, reduced, visibleSections]);

  /* Focus lands in the lid: the search field when there is one, otherwise the trigger that keeps the active option. */
  const pendingFocus = useRef<"trigger" | "input" | null>(null);
  useLayoutEffect(() => {
    const target = pendingFocus.current;
    pendingFocus.current = null;
    if (target === "input") inputRef.current?.focus({ preventScroll: true });
    if (target === "trigger") triggerRef.current?.focus({ preventScroll: true });
  }, [open]);

  const typeahead = useRef({ buffer: "", at: 0 });
  /** Space opens and picks on keydown; the click a button fires on the matching keyup must not undo it. */
  const suppressClick = useRef(false);
  const [announcement, setAnnouncement] = useState("");

  const openList = (focus?: string | null, seed = "") => {
    if (disabled || open) return;
    setQuery(seed);
    setActive(focus !== undefined ? focus : selected);
    scrollIntent.current = true;
    pendingFocus.current = canSearch ? "input" : "trigger";
    setAnnouncement("");
    setOpen(true);
  };

  const close = useCallback((restoreFocus: boolean) => {
    typeahead.current.buffer = "";
    if (restoreFocus) pendingFocus.current = "trigger";
    setOpen(false);
  }, []);

  const commit = (option: MorphSelectOption | undefined, source?: HTMLElement | null) => {
    if (!option || option.disabled) return;
    if (option.value !== selected) {
      let fly: Change["fly"] = null;
      const slot = slotRef.current;
      const part = source?.querySelector<HTMLElement>("[data-part='value']");
      if (!reduced && part && slot) {
        const from = part.getBoundingClientRect(), to = slot.getBoundingClientRect();
        fly = { x: from.left - to.left, y: from.top + from.height / 2 - (to.top + to.height / 2) };
      }
      const from = selected === null ? -1 : indexOf.get(selected) ?? -1, to = indexOf.get(option.value) ?? 0;
      setChange(last => ({ key: last.key + 1, value: option.value, dir: from < 0 ? 1 : Math.sign(to - from) || 1, fly }));
      if (value === undefined) setInner(option.value);
      onValueChange?.(option.value, option);
    }
    close(true);
  };

  const typeTo = (char: string) => {
    const now = performance.now(), state = typeahead.current;
    state.buffer = now - state.at > TYPEAHEAD_RESET ? char : state.buffer + char;
    state.at = now;
    const buffer = state.buffer.toLowerCase();
    const repeated = buffer.split("").every(letter => letter === buffer[0]);
    const search = repeated ? buffer[0]! : buffer;
    const pool = all.filter(option => !option.disabled);
    const from = open ? current : selected;
    const at = pool.findIndex(option => option.value === from);
    const offset = repeated || buffer.length === 1 ? 1 : 0;
    const ordered = [...pool.slice(at + offset), ...pool.slice(0, at + offset)];
    return ordered.find(option => option.label.toLowerCase().startsWith(search));
  };

  const move = (to: string | null | undefined) => {
    if (to === undefined || to === null) return;
    scrollIntent.current = true;
    setActive(to);
  };

  const onKey = (event: ReactKeyboardEvent<HTMLElement>, fromInput: boolean) => {
    const { key } = event;
    if (key === " " && !fromInput) suppressClick.current = true;
    const printable = key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey;
    const typing = performance.now() - typeahead.current.at < TYPEAHEAD_RESET && typeahead.current.buffer.length > 0;

    if (!open) {
      if (key === "ArrowDown" || key === "ArrowUp" || key === "Enter" || (key === " " && !typing)) { event.preventDefault(); openList(); return; }
      if (key === "Home" || key === "End") { event.preventDefault(); const pool = all.filter(option => !option.disabled); openList((key === "Home" ? pool[0] : pool[pool.length - 1])?.value ?? null); return; }
      if (printable) {
        event.preventDefault();
        if (canSearch) openList(undefined, key);
        else { const hit = typeTo(key); openList(hit?.value ?? selected); }
      }
      return;
    }

    const at = enabled.findIndex(option => option.value === current);
    const caretKeys = fromInput && query.length > 0;
    switch (key) {
      case "ArrowDown": event.preventDefault(); move(enabled[Math.min(enabled.length - 1, at + 1)]?.value); return;
      case "ArrowUp":
        event.preventDefault();
        if (event.altKey) { commit(enabled[at], optionRefs.current.get(current ?? "")); return; }
        move(enabled[Math.max(0, at - 1)]?.value); return;
      case "PageDown": event.preventDefault(); move(enabled[Math.min(enabled.length - 1, at + PAGE)]?.value); return;
      case "PageUp": event.preventDefault(); move(enabled[Math.max(0, at - PAGE)]?.value); return;
      case "Home": if (caretKeys) return; event.preventDefault(); move(enabled[0]?.value); return;
      case "End": if (caretKeys) return; event.preventDefault(); move(enabled[enabled.length - 1]?.value); return;
      case "Enter": event.preventDefault(); commit(enabled[at], optionRefs.current.get(current ?? "")); return;
      case "Escape": event.preventDefault(); event.stopPropagation(); close(true); return;
      case "Tab": close(false); return;
    }
    if (fromInput) return;
    if (key === " " && !typing) { event.preventDefault(); commit(enabled[at], optionRefs.current.get(current ?? "")); return; }
    if (printable) { event.preventDefault(); move(typeTo(key)?.value); }
  };

  // A press outside or focus leaving the control folds the list back into the trigger.
  useEffect(() => {
    if (!open) return;
    const down = (event: PointerEvent) => { if (!rootRef.current?.contains(event.target as Node)) close(false); };
    document.addEventListener("pointerdown", down);
    return () => document.removeEventListener("pointerdown", down);
  }, [close, open]);
  const onBlur = (event: ReactFocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget as Node | null;
    if (open && next && !event.currentTarget.contains(next)) close(false);
  };

  const onQuery = (next: string) => {
    setQuery(next);
    setActive(null);
    scrollIntent.current = true;
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
    const text = next.trim().toLowerCase();
    const count = text ? all.filter(option => matches(option, text)).length : all.length;
    setAnnouncement(text ? count ? `${count} ${count === 1 ? "option" : "options"}` : "No matches" : "");
  };

  const renderValue = (option: MorphSelectOption | undefined) => option
    ? <>{option.icon && <span className={styles.icon} aria-hidden="true">{option.icon}</span>}<span className={styles.valueText}>{option.label}</span></>
    : <span className={styles.placeholder}>{placeholder}</span>;

  const showSearch = open && canSearch;
  const layerKey = selected ?? "__empty";
  const changeForLayer: Change = change.value === selected ? change : { ...change, fly: null };
  const rootStyle = { "--ms-panel-w": `${panelWidth}px`, "--ms-list-max": `${maxListHeight}px` } as CSSProperties;

  return <ArcQuiet.Provider value={!arcLive}><ArcStyle /><div data-slot="morph-select" data-reduced={preferReduced ? "true" : "false"} data-motion={arcLive && !preferReduced ? "on" : "off"}  ref={rootRef} className={[styles.root, className].filter(Boolean).join(" ")} style={rootStyle} data-open={open || undefined} data-align={align} data-disabled={disabled || undefined} onBlur={onBlur}>
    <span id={labelId} className={hideLabel ? styles.srOnly : styles.label}>{label}</span>

    <motion.div className={styles.anchor} style={{ width: anchorW }}>
      {/* Sizes the closed trigger. It holds the chosen label with the trigger's own padding, so the width spring has a target before anything moves. */}
      <span ref={measureRef} className={`${styles.trigger} ${styles.measure}`} aria-hidden="true">{renderValue(selectedOption)}</span>

      <motion.div className={styles.shape} style={{ width: shapeW, height: shapeH, borderRadius: radius }}>
        <div className={styles.lid}>
          <button ref={triggerRef} type="button" className={styles.trigger} role="combobox" aria-labelledby={labelId} aria-haspopup="listbox" aria-expanded={open} aria-controls={listId}
            aria-activedescendant={open && !canSearch && current !== null ? optionId(indexOf.get(current) ?? 0) : undefined}
            disabled={disabled} inert={showSearch || undefined} tabIndex={showSearch ? -1 : 0}
            onClick={() => { if (suppressClick.current) { suppressClick.current = false; return; } if (open) close(true); else openList(); }}
            onKeyDown={event => onKey(event, false)} onKeyUp={event => { if (event.key === " ") window.setTimeout(() => { suppressClick.current = false; }); }}>
            <span ref={slotRef} className={styles.slot} data-hidden={showSearch || undefined}>
              <AnimatePresence initial={false} custom={changeForLayer}>
                <motion.span key={layerKey} className={styles.layer} custom={changeForLayer} variants={reduced ? valueFade : valueVariants} initial="enter" animate="rest" exit="exit"
                  transition={reduced ? { duration: .12 } : changeForLayer.fly ? { x: FLY, y: FLY, opacity: { duration: 0 } } : { y: GLIDE, opacity: { duration: .2, ease: enter }, filter: { duration: .22, ease: enter } }}>
                  {renderValue(selectedOption)}
                </motion.span>
              </AnimatePresence>
            </span>
          </button>

          {canSearch && <motion.div className={styles.searchRow} inert={!showSearch || undefined} initial={false}
            animate={showSearch ? { opacity: 1, filter: "blur(0px)" } : { opacity: 0, filter: reduced ? "blur(0px)" : `blur(${blur.subtle}px)` }}
            transition={showSearch ? { duration: .18, ease: enter, delay: reduced ? 0 : .04 } : { duration: .1, ease: standard }}>
            <Search className={styles.searchIcon} size={16} strokeWidth={1.75} aria-hidden="true" />
            <input ref={inputRef} className={styles.input} type="text" role="combobox" aria-label={`Search ${label.toLowerCase()}`} aria-expanded={open} aria-controls={listId} aria-autocomplete="list"
              aria-activedescendant={open && current !== null ? optionId(indexOf.get(current) ?? 0) : undefined}
              placeholder={searchPlaceholder ?? selectedOption?.label ?? "Search"} value={query} autoComplete="off" spellCheck={false}
              onChange={event => onQuery(event.target.value)} onKeyDown={event => onKey(event, true)} />
            <AnimatePresence initial={false}>
              {query && <motion.button key="clear" type="button" className={styles.clear} aria-label="Clear search" onPointerDown={event => event.preventDefault()}
                onClick={() => { onQuery(""); inputRef.current?.focus(); }}
                initial={{ opacity: 0, scale: .6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .6, transition: { duration: .1 } }} transition={reduced ? { duration: 0 } : GLIDE}>
                <X size={14} strokeWidth={1.75} aria-hidden="true" />
              </motion.button>}
            </AnimatePresence>
            <button type="button" className={styles.closeHit} aria-label={`Close ${label.toLowerCase()}`} onClick={() => close(true)} />
          </motion.div>}

          <motion.span className={styles.chevron} aria-hidden="true" initial={false} animate={{ rotate: open ? 180 : 0 }} transition={reduced ? { duration: 0 } : GLIDE}>
            <ChevronDown size={16} strokeWidth={1.75} />
          </motion.span>
        </div>

        <motion.div ref={listFaceRef} className={styles.listFace}
          inert={!open || undefined} aria-hidden={!open || undefined} initial={false}
          animate={open ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: reduced ? 0 : -6, filter: reduced ? "blur(0px)" : `blur(${blur.subtle}px)` }}
          transition={open ? { y: GROW, opacity: { duration: .2, ease: enter, delay: reduced ? 0 : .04 }, filter: { duration: .22, ease: enter, delay: .04 } } : { duration: .1, ease: standard }}>
          <div ref={scrollRef} className={styles.scroll}>
            <div id={listId} className={styles.options} role="listbox" aria-labelledby={labelId}>
              <motion.span className={styles.highlight} style={{ y: hy, height: hh, opacity: ho }} aria-hidden="true" />
              {visibleSections.map(section => {
                const rows = section.options.map(option => {
                  const index = indexOf.get(option.value) ?? 0;
                  const isSelected = option.value === selected, isActive = option.value === current;
                  return <div key={option.value} id={optionId(index)} role="option" aria-selected={isSelected} aria-disabled={option.disabled || undefined}
                    className={styles.option} data-active={isActive || undefined}
                    ref={node => { if (node) optionRefs.current.set(option.value, node); else optionRefs.current.delete(option.value); }}
                    onPointerMove={event => { if (event.pointerType === "mouse" && !option.disabled && option.value !== current) setActive(option.value); }}
                    onPointerDown={event => event.preventDefault()}
                    onClick={event => commit(option, event.currentTarget)}>
                    <span className={styles.optionValue} data-part="value">{option.icon && <span className={styles.icon} aria-hidden="true">{option.icon}</span>}<span className={styles.valueText}>{option.label}</span></span>
                    {option.meta && <span className={styles.meta}>{option.meta}</span>}
                    <span className={styles.check} data-on={isSelected || undefined} aria-hidden="true"><Check size={16} strokeWidth={1.75} /></span>
                  </div>;
                });
                return section.label
                  ? <div key={section.key} role="group" aria-labelledby={`${uid}-${section.key}`} className={styles.group}>
                    <div id={`${uid}-${section.key}`} className={styles.groupLabel} role="presentation">{section.label}</div>
                    {rows}
                  </div>
                  : <div key={section.key} role="presentation" className={styles.group}>{rows}</div>;
              })}
              {resultCount === 0 && <p className={styles.empty}>No matches for “{query.trim()}”</p>}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>

    {name && <input type="hidden" name={name} value={selected ?? ""} />}
    <span className={styles.srOnly} role="status" aria-live="polite">{announcement}</span>
  </div></ArcQuiet.Provider>;
}

export default MorphSelect;
