"use client";

// Ported from Arc Library (MIT, (c) 2026 Elia Kuratli) — https://github.com/kuratlielia/arc-library/blob/main/registry/components/floating-button-group/floating-button-group.tsx

import { useAnimationActive } from "@/hooks/use-animation-active";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState , createContext, useContext} from "react";
import type { CSSProperties, FocusEvent, KeyboardEvent, ReactElement, ReactNode } from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { AnimatePresence, animate, motion, useIsPresent, useMotionValue } from "motion/react";
import type { TargetAndTransition } from "motion/react";
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

const styles: Record<string, string> = new Proxy({} as Record<string, string>, { get: (_target, key) => (typeof key === "string" ? "floating-button-group-" + key : "") });

const arcCss = ":where([class^=\"floating-button-group-\"], [class*=\" floating-button-group-\"]) {\n  --surface: var(--background);\n  --surface-raised: var(--popover);\n  --surface-muted: var(--muted);\n  --text-secondary: var(--muted-foreground);\n  --text-muted: var(--muted-foreground);\n  --border-subtle: color-mix(in oklab, var(--border) 65%, var(--background));\n  --border-strong: color-mix(in oklab, var(--foreground) 28%, var(--border));\n  --accent: var(--primary);\n  --accent-strong: var(--primary);\n  --accent-foreground: var(--primary-foreground);\n  --accent-subtle: color-mix(in oklab, var(--primary) 12%, transparent);\n  --danger: var(--destructive);\n  --success: var(--primary);\n  --warning: var(--destructive);\n  --control-on: var(--primary);\n  --control-glyph: var(--primary-foreground);\n  --shadow-resting: 0 1px 2px oklch(0% 0 0 / .035);\n  --shadow-raised: 0 6px 18px oklch(0% 0 0 / .065), 0 1px 3px oklch(0% 0 0 / .035);\n  --shadow-floating: 0 20px 48px oklch(0% 0 0 / .105), 0 3px 10px oklch(0% 0 0 / .045);\n  --radius-control: 1.125rem;\n  --radius-panel: 1.625rem;\n  --radius-surface: 2.125rem;\n  --radius-pill: 9999px;\n  --control-height-sm: 2.25rem;\n  --control-height-md: 2.75rem;\n  --control-height-lg: 3.125rem;\n  --space-1: .25rem; --space-2: .5rem; --space-3: .75rem; --space-4: 1rem;\n  --space-5: 1.25rem; --space-6: 1.5rem; --space-8: 2rem;\n  --text-xs: .75rem; --text-sm: .875rem; --text-base: 1rem;\n  --tracking-body: -.01em; --leading-body: 1.4;\n  --font-body: inherit; --font-display: inherit;\n  --ease-enter: cubic-bezier(.16, 1, .3, 1);\n  --ease-standard: cubic-bezier(.22, 1, .36, 1);\n  --ease-exit: cubic-bezier(.7, 0, .84, 0);\n  --ease-in-out: cubic-bezier(.65, 0, .35, 1);\n  --ease-spring: linear(0, 0.0213, 0.0739, 0.1443, 0.2235, 0.305, 0.3849, 0.4606, 0.5305, 0.594, 0.6508, 0.7011, 0.7452, 0.7836, 0.8168, 0.8454, 0.8699, 0.8907, 0.9084, 0.9234, 0.9361, 0.9467, 0.9557, 0.9632, 0.9694, 0.9747, 0.979, 0.9826, 0.9857, 0.9882, 0.9902, 0.992, 0.9934, 0.9946, 0.9955, 0.9963, 1);\n  --duration-instant: 120ms; --duration-fast: 160ms; --duration-standard: 240ms; --duration-considered: 480ms; --duration-spring: 580ms;\n  --series-1: var(--primary);\n  --series-2: #7128a5;\n  --series-3: #e58f00;\n  --series-4: #009e84;\n  color: var(--foreground);\n}\n.dark :where([class^=\"floating-button-group-\"], [class*=\" floating-button-group-\"]) { --series-1: #55adff; --series-2: #9c37be; --series-3: #e66e00; --series-4: #00a861; }\n@supports (color: oklch(from red clamp(.4, l * sign(max(c - .02, 0)) + .5, .8) c h)) {\n  :where([class^=\"floating-button-group-\"], [class*=\" floating-button-group-\"]) {\n    --series-1: oklch(from var(--accent) calc(l * sign(max(c - .02, 0)) + .58 * (1 - sign(max(c - .02, 0)))) calc(c * sign(max(c - .02, 0)) + .15 * (1 - sign(max(c - .02, 0)))) calc(h * sign(max(c - .02, 0)) + 250 * (1 - sign(max(c - .02, 0)))));\n    --series-2: oklch(from var(--accent) clamp(.45, l * sign(max(c - .02, 0)) + .58 * (1 - sign(max(c - .02, 0))) - 0.25, .76) .19 calc(h * sign(max(c - .02, 0)) + 250 * (1 - sign(max(c - .02, 0))) + 57));\n    --series-3: oklch(from var(--accent) clamp(.45, l * sign(max(c - .02, 0)) + .58 * (1 - sign(max(c - .02, 0))) + 0.14, .76) .18 calc(h * sign(max(c - .02, 0)) + 250 * (1 - sign(max(c - .02, 0))) + 184));\n    --series-4: oklch(from var(--accent) clamp(.45, l * sign(max(c - .02, 0)) + .58 * (1 - sign(max(c - .02, 0))), .76) .21 calc(h * sign(max(c - .02, 0)) + 250 * (1 - sign(max(c - .02, 0))) + 292));\n  }\n  .dark :where([class^=\"floating-button-group-\"], [class*=\" floating-button-group-\"]) {\n    --series-1: oklch(from var(--accent) calc(l * sign(max(c - .02, 0)) + .73 * (1 - sign(max(c - .02, 0)))) calc(c * sign(max(c - .02, 0)) + .15 * (1 - sign(max(c - .02, 0)))) calc(h * sign(max(c - .02, 0)) + 250 * (1 - sign(max(c - .02, 0)))));\n    --series-2: oklch(from var(--accent) clamp(.485, l * sign(max(c - .02, 0)) + .73 * (1 - sign(max(c - .02, 0))) - 0.19, .665) .21 calc(h * sign(max(c - .02, 0)) + 250 * (1 - sign(max(c - .02, 0))) + 66));\n    --series-3: oklch(from var(--accent) clamp(.485, l * sign(max(c - .02, 0)) + .73 * (1 - sign(max(c - .02, 0))) + 0.02, .665) .21 calc(h * sign(max(c - .02, 0)) + 250 * (1 - sign(max(c - .02, 0))) + 175));\n    --series-4: oklch(from var(--accent) clamp(.485, l * sign(max(c - .02, 0)) + .73 * (1 - sign(max(c - .02, 0))) - 0.1, .665) .18 calc(h * sign(max(c - .02, 0)) + 250 * (1 - sign(max(c - .02, 0))) + 270));\n  }\n}\n/* Separate soft buttons in a quiet tray, with real gaps between them. The tray always keeps its natural size and never wraps or clips its buttons. The buttons stay transparent: one shared highlight\n   moves underneath their content, so there is only ever one moving surface. Corners are concentric with the tray. */\n.floating-button-group-group {\n  --fbg-h: 36px; --fbg-pad: 4px; --fbg-gap: 4px; --fbg-pad-x: 12px;\n  --fbg-outer: var(--radius-control);\n  --fbg-radius: calc(var(--fbg-outer) - var(--fbg-pad) - 1px);\n  --fbg-highlight: color-mix(in oklab, var(--foreground) 7%, transparent);\n  --fbg-highlight-press: color-mix(in oklab, var(--foreground) 12%, transparent);\n  --fbg-on: color-mix(in oklab, var(--control-on) 12%, transparent);\n  --fbg-rule: color-mix(in oklab, var(--foreground) 12%, transparent);\n  /* The muted tray is a translucent tint, not --surface-muted, so it still reads when it sits on a muted surface. */\n  --fbg-tray: color-mix(in oklab, var(--foreground) 4.5%, transparent);\n  --fbg-tray-edge: color-mix(in oklab, var(--foreground) 3%, transparent);\n  position: relative; isolation: isolate; display: inline-flex; flex: none; flex-wrap: nowrap; align-items: center; gap: var(--fbg-gap); padding: var(--fbg-pad); border: 1px solid var(--fbg-tray-edge); border-radius: var(--fbg-outer); background: var(--fbg-tray); color: var(--text-secondary); font-family: var(--font-body); letter-spacing: var(--tracking-body); -webkit-tap-highlight-color: transparent;\n}\n.floating-button-group-sm { --fbg-h: 30px; --fbg-pad: 3px; --fbg-gap: 3px; --fbg-pad-x: 10px; --fbg-outer: calc(var(--radius-control) - 3px); }\n.floating-button-group-md { --fbg-h: 36px; }\n/* Raised for overlays such as a selection toolbar: the floating layer shadow and a hairline edge. */\n.floating-button-group-floating { border-color: var(--border); background: var(--surface-raised); box-shadow: var(--shadow-floating); }\n.floating-button-group-vertical { flex-direction: column; align-items: stretch; }\n.dark .floating-button-group-group {\n  --fbg-highlight: color-mix(in oklab, var(--foreground) 9%, transparent);\n  --fbg-highlight-press: color-mix(in oklab, var(--foreground) 15%, transparent);\n  --fbg-on: color-mix(in oklab, var(--control-on) 16%, transparent);\n  --fbg-tray: color-mix(in oklab, var(--foreground) 6%, transparent);\n  --fbg-tray-edge: color-mix(in oklab, var(--foreground) 5%, transparent);\n}\n\n/* The highlight paints above the buttons' own backgrounds (a pressed tint) and below their content. */\n.floating-button-group-highlight { position: absolute; z-index: 1; top: 0; left: 0; border-radius: var(--fbg-radius); background: var(--fbg-highlight); pointer-events: none; transition: background-color var(--duration-fast) var(--ease-standard); }\n.floating-button-group-highlight[data-pressing] { background: var(--fbg-highlight-press); transition-duration: var(--duration-instant); }\n\n/* Buttons are not positioned, so the highlight measures them against the tray and stacks above their background. */\n.floating-button-group-item { display: inline-flex; min-width: var(--fbg-h); height: var(--fbg-h); flex: none; align-items: center; justify-content: center; margin: 0; padding: 0 var(--fbg-pad-x); border: 0; border-radius: var(--fbg-radius); background: transparent; color: inherit; font: inherit; font-size: var(--text-sm); font-weight: 500; line-height: 1; white-space: nowrap; cursor: pointer; user-select: none; -webkit-tap-highlight-color: transparent; touch-action: manipulation; transition: color var(--duration-fast) var(--ease-standard), background-color var(--duration-fast) var(--ease-standard), opacity var(--duration-fast) var(--ease-standard); }\n.floating-button-group-sm .floating-button-group-item { font-size: var(--text-xs); }\n.floating-button-group-item[data-icon]:not([data-icon-only]) { padding-left: calc(var(--fbg-pad-x) - 2px); }\n.floating-button-group-item[data-icon-only] { width: var(--fbg-h); padding: 0; }\n.floating-button-group-item[data-active], .floating-button-group-item[aria-pressed=\"true\"] { color: var(--foreground); }\n.floating-button-group-item[aria-pressed=\"true\"] { background: var(--fbg-on); }\n.floating-button-group-item[aria-disabled=\"true\"] { color: var(--text-muted); cursor: not-allowed; opacity: .5; }\n.floating-button-group-vertical .floating-button-group-item:not([data-icon-only]) { justify-content: flex-start; }\n.floating-button-group-vertical .floating-button-group-item[data-icon-only] { align-self: center; }\n\n/* Ghosts of every label share one grid cell with the visible one, so the slot always has the widest label's width. */\n.floating-button-group-slot { position: relative; z-index: 2; display: inline-grid; align-items: center; justify-items: center; }\n.floating-button-group-slot > * { grid-area: 1 / 1; }\n.floating-button-group-vertical .floating-button-group-slot { justify-items: start; }\n.floating-button-group-ghost { display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; visibility: hidden; pointer-events: none; }\n.floating-button-group-iconSpace { display: block; width: 16px; height: 16px; flex: none; }\n.floating-button-group-phase { display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; }\n.floating-button-group-icon { display: inline-flex; flex: none; }\n.floating-button-group-icon svg { width: 16px; height: 16px; stroke-width: 1.75; }\n.floating-button-group-text { display: block; }\n\n.floating-button-group-separator { flex: none; align-self: center; width: 1px; height: calc(var(--fbg-h) * .5); margin-inline: 2px; border-radius: 1px; background: var(--fbg-rule); }\n.floating-button-group-vertical .floating-button-group-separator { width: calc(var(--fbg-h) * .5); height: 1px; margin: 2px 0; }\n\n.floating-button-group-tip { display: inline-flex; align-items: baseline; gap: var(--space-3); white-space: nowrap; }\n.floating-button-group-kbd { font: inherit; color: color-mix(in oklab, var(--background) 58%, var(--foreground)); font-variant-numeric: tabular-nums; }\n\n/* Side tooltips for a column match the library tooltip, rising a few pixels away from the rail instead of up. */\n.floating-button-group-sideTip { --tip-x: -3px; z-index: 90; max-width: 15rem; padding: var(--space-3) var(--space-4); border: 1px solid color-mix(in oklab, var(--background) 14%, var(--foreground)); border-radius: var(--radius-control); background: var(--foreground); color: var(--background); box-shadow: var(--shadow-raised); font-family: var(--font-body); font-size: var(--text-sm); font-weight: 400; letter-spacing: var(--tracking-body); line-height: var(--leading-body); transform-origin: var(--radix-tooltip-content-transform-origin); transition: opacity var(--duration-fast) var(--ease-enter), transform var(--duration-fast) var(--ease-enter); }\n.floating-button-group-sideTip[data-side=\"left\"] { --tip-x: 3px; }\n@starting-style {\n  .floating-button-group-sideTip[data-state$=\"-open\"] { opacity: 0; transform: translateX(var(--tip-x)) scale(.97); }\n}\n/* Radix unmounts when the exit animation ends, so a no-op keyframe times the exit while the transition does the visual work. */\n.floating-button-group-sideTip[data-state=\"closed\"] { opacity: 0; transform: scale(.98); transition: opacity 110ms var(--ease-standard), transform 110ms var(--ease-standard); animation: floating-button-group-side-tip-exit 110ms linear both; }\n@keyframes floating-button-group-side-tip-exit { to { --side-tip-exit: 1; } }\n\n@media (prefers-reduced-motion: reduce) {\n  .floating-button-group-item, .floating-button-group-highlight { transition: color var(--duration-instant) linear, background-color var(--duration-instant) linear, opacity var(--duration-instant) linear; }\n  .floating-button-group-sideTip, .floating-button-group-sideTip[data-state=\"closed\"] { transform: none; transition: opacity 90ms linear; }\n}\n\n";

function ArcStyle() {
  return <style>{arcCss}</style>;
}


export type FloatingButtonGroupVariant = "muted" | "floating";
export type FloatingButtonGroupSize = "sm" | "md";
export type FloatingButtonGroupOrientation = "horizontal" | "vertical";

export interface FloatingButtonGroupAction {
  type?: "action";
  /** Stable key, also passed to onAction. */
  id: string;
  /** Visible label, and the accessible name when the item shows only its icon. */
  label: string;
  icon?: ReactNode;
  /** Shows only the icon. The label moves into a tooltip and the accessible name. Overrides the group's iconOnly. */
  iconOnly?: boolean;
  onSelect?: () => void;
  disabled?: boolean;
  /** Marks an action that switches a mode on, such as Present. Sets aria-pressed and keeps a quiet tint while on. */
  pressed?: boolean;
  /** A shortcut hint shown in the tooltip, such as "⌘Z". The component does not bind the key. */
  shortcut?: string;
  /** Other labels this item can switch to, such as ["Copied"] for Share. The button keeps the width of the widest, so a label change never moves anything. */
  reserveLabels?: readonly string[];
}

export interface FloatingButtonGroupSeparator {
  type: "separator";
  id?: string;
}

export type FloatingButtonGroupItem = FloatingButtonGroupAction | FloatingButtonGroupSeparator;

export interface FloatingButtonGroupProps {
  items: readonly FloatingButtonGroupItem[];
  /** Accessible name of the toolbar, such as "Board actions". */
  label: string;
  /** muted sits quietly on a page; floating raises the tray with the floating shadow for overlays such as a selection toolbar. */
  variant?: FloatingButtonGroupVariant;
  size?: FloatingButtonGroupSize;
  orientation?: FloatingButtonGroupOrientation;
  /** Shows every item as an icon only, with its label in a tooltip. Items with their own iconOnly win. */
  iconOnly?: boolean;
  /** Side of the item tooltips. Defaults to top for a row and right for a column. */
  tooltipSide?: "top" | "bottom" | "left" | "right";
  /** Called with the item id after the item's own onSelect. */
  onAction?: (id: string) => void;
  className?: string;
  style?: CSSProperties;
}

const isAction = (item: FloatingButtonGroupItem): item is FloatingButtonGroupAction => item.type !== "separator";
const standard = motionTokens.ease.standard as [number, number, number, number];
const enter = motionTokens.ease.enter as [number, number, number, number];

const rest: TargetAndTransition = { opacity: 1, y: 0, filter: "blur(0px)" };
const textIn: TargetAndTransition = { opacity: 0, y: 4, filter: `blur(${motionTokens.blur.soft}px)` };
const textOut: TargetAndTransition = { opacity: 0, y: -3, filter: `blur(${motionTokens.blur.soft}px)`, transition: { duration: motionTokens.duration.fast, ease: standard } };
const fadeIn: TargetAndTransition = { opacity: 0 };
const fadeOut: TargetAndTransition = { opacity: 0, transition: { duration: motionTokens.duration.instant } };

function Phase({ children, reduced }: { children: ReactNode; reduced: boolean }) {
  const present = useIsPresent();
  return <motion.span className={styles.phase} aria-hidden={present ? undefined : true} initial={reduced ? fadeIn : textIn} animate={rest} exit={reduced ? fadeOut : textOut} transition={{ duration: reduced ? motionTokens.duration.instant : motionTokens.duration.standard, ease: enter }}>{children}</motion.span>;
}

/**
 * Icon and label. Every label the item can show is laid out invisibly in the same grid cell, so the button always has the width
 * of the widest one: a label change crossfades in place and never resizes the button, its neighbours or the tray.
 */
function ItemBody({ label, icon, iconOnly, reserve, reduced }: { label: string; icon?: ReactNode; iconOnly: boolean; reserve: readonly string[]; reduced: boolean }) {
  const ghosts = iconOnly ? [] : Array.from(new Set([label, ...reserve]));
  return <span className={styles.slot}>
    {ghosts.map(text => <span key={text} className={styles.ghost} aria-hidden="true">
      {icon ? <span className={styles.iconSpace} /> : null}
      <span className={styles.text}>{text}</span>
    </span>)}
    <AnimatePresence initial={false}>
      <Phase key={label} reduced={reduced}>
        {icon ? <span className={styles.icon} aria-hidden="true">{icon}</span> : null}
        {iconOnly ? null : <span className={styles.text}>{label}</span>}
      </Phase>
    </AnimatePresence>
  </span>;
}

function TipContent({ label, shortcut }: { label: string; shortcut?: string }) {
  return <span className={styles.tip}>{label}{shortcut ? <kbd className={styles.kbd}>{shortcut}</kbd> : null}</span>;
}

/** Side tooltips for a column. The library Tooltip opens above or below, which would cover the neighbouring button. */
function SideTip({ side, content, children }: { side: "left" | "right"; content: ReactNode; children: ReactElement }) {
  return <TooltipPrimitive.Root>
    <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content className={styles.sideTip} side={side} sideOffset={10} collisionPadding={12}>{content}</TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  </TooltipPrimitive.Root>;
}

/**
 * Separate soft buttons in a quiet tray. One shared highlight morphs, in position and size, to whichever button the pointer
 * or keyboard focus is on, fades when the pointer leaves the tray, and settles darker in place while a button is pressed.
 * It is the toolbar's only hover and focus indicator. Arrow keys move focus, Home and End jump to the ends, Enter and Space act.
 */
function Tooltip({ side, content, children }: { side: "top" | "bottom" | "left" | "right"; content: ReactNode; children: ReactElement }) {
  return <TooltipPrimitive.Root>
    <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content className={styles.sideTip} side={side} sideOffset={8} collisionPadding={12}>{content}</TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  </TooltipPrimitive.Root>;
}

export function FloatingButtonGroup({ items, label, variant = "muted", size = "md", orientation = "horizontal", iconOnly: groupIconOnly = false, tooltipSide, onAction, className, style }: FloatingButtonGroupProps) {
  const preferReduced = useArcReduced();
  const tray = useRef<HTMLDivElement>(null);
  const arcLive = useAnimationActive(tray);
  const reduced = preferReduced || !arcLive;
  const nodes = useRef(new Map<string, HTMLButtonElement>());
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [pressing, setPressing] = useState(false);
  const [tabStop, setTabStop] = useState<string | null>(null);

  const actions = items.filter(isAction);
  const byId = new Map(actions.map(action => [action.id, action]));
  const enabled = (id: string | null) => !!id && !!byId.get(id) && !byId.get(id)?.disabled;
  // Pointer wins over keyboard focus while it is in the tray; a disabled item under the pointer hands back to focus.
  const activeId = enabled(hoverId) ? hoverId : focusId && byId.has(focusId) ? focusId : null;
  const stop = enabled(tabStop) ? tabStop : actions.find(action => !action.disabled)?.id ?? null;
  const vertical = orientation === "vertical";
  const side = tooltipSide ?? (vertical ? "right" : "top");
  const idsKey = actions.map(action => action.id).join("\u0000");

  // The highlight lives in motion values so moving it never re-renders the buttons.
  const x = useMotionValue(0), y = useMotionValue(0), width = useMotionValue(0), height = useMotionValue(0);
  const opacity = useMotionValue(0), scale = useMotionValue(1);
  const traveling = useRef(false);
  const activeRef = useRef(activeId);
  const pressingRef = useRef(pressing);

  /** The button's box in tray coordinates, exact to the device pixel (offsetLeft rounds to whole pixels) and free of ancestor transforms. */
  const measure = useCallback((node: HTMLElement) => {
    const root = tray.current;
    if (!root) return null;
    const outer = root.getBoundingClientRect(), box = node.getBoundingClientRect();
    const unscale = outer.width ? root.offsetWidth / outer.width : 1;
    const dpr = window.devicePixelRatio || 1;
    const snap = (value: number) => Math.round(value * unscale * dpr) / dpr;
    return { x: snap(box.left - outer.left) - root.clientLeft, y: snap(box.top - outer.top) - root.clientTop, width: snap(box.width), height: snap(box.height) };
  }, []);

  const place = useCallback((id: string | null, mode: "move" | "follow") => {
    const node = id ? nodes.current.get(id) : undefined;
    if (!node) {
      animate(opacity, 0, { duration: reduced ? motionTokens.duration.instant : motionTokens.duration.standard, ease: standard });
      return;
    }
    const rect = measure(node);
    if (!rect) return;
    const visible = opacity.get() > .15;
    // Travel between buttons on the morph spring. Appearing from nothing, and every move with reduced motion, lands in place.
    const travel = !reduced && visible && (mode === "move" || traveling.current);
    if (travel) {
      traveling.current = true;
      animate(x, rect.x, motionTokens.spring.morph);
      animate(y, rect.y, motionTokens.spring.morph);
      animate(width, rect.width, motionTokens.spring.morph);
      animate(height, rect.height, { ...motionTokens.spring.morph, onComplete: () => { traveling.current = false; } });
    } else {
      traveling.current = false;
      x.jump(rect.x); y.jump(rect.y); width.jump(rect.width); height.jump(rect.height);
      if (!visible && !reduced) {
        scale.jump(.94);
        animate(scale, pressingRef.current ? .965 : 1, motionTokens.spring.snappy);
      }
    }
    if (opacity.get() !== 1) animate(opacity, 1, { duration: reduced ? motionTokens.duration.instant : motionTokens.duration.fast, ease: standard });
  }, [height, measure, opacity, reduced, scale, width, x, y]);

  useLayoutEffect(() => {
    activeRef.current = activeId;
    place(activeId, "move");
  }, [activeId, place]);

  useEffect(() => {
    pressingRef.current = pressing;
    animate(scale, pressing && activeId ? .965 : 1, reduced ? { duration: 0 } : motionTokens.spring.snappy);
  }, [activeId, pressing, reduced, scale]);

  // A font that loads or a container that reflows moves the buttons; the highlight follows without travel.
  useEffect(() => {
    const root = tray.current;
    if (!root || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => { if (activeRef.current) place(activeRef.current, "follow"); });
    observer.observe(root);
    nodes.current.forEach(node => observer.observe(node));
    return () => observer.disconnect();
  }, [idsKey, place]);

  // A native listener, because React bubbles pointer events through portals: moving from a button onto its tooltip
  // would not count as leaving the tray, and the highlight would stay behind.
  useEffect(() => {
    const root = tray.current;
    if (!root) return;
    const leave = () => { setHoverId(null); setPressing(false); };
    root.addEventListener("pointerleave", leave);
    return () => root.removeEventListener("pointerleave", leave);
  }, []);

  const buttons = () => Array.from(tray.current?.querySelectorAll<HTMLButtonElement>("[data-fbg-item]") ?? []);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const all = buttons();
    const index = all.findIndex(node => node === document.activeElement);
    if (index < 0) return;
    const next = vertical ? "ArrowDown" : "ArrowRight";
    const previous = vertical ? "ArrowUp" : "ArrowLeft";
    const usable = (node: HTMLButtonElement) => node.getAttribute("aria-disabled") !== "true";
    let target: HTMLButtonElement | undefined;
    if (event.key === "Home") target = all.find(usable);
    else if (event.key === "End") target = [...all].reverse().find(usable);
    else if (event.key === next || event.key === previous) {
      const step = event.key === next ? 1 : -1;
      for (let offset = 1; offset <= all.length; offset += 1) {
        const candidate = all[(index + step * offset + all.length * offset) % all.length]!;
        if (usable(candidate)) { target = candidate; break; }
      }
    } else return;
    event.preventDefault();
    if (!target) return;
    // The keyboard takes the highlight back until the pointer moves again.
    setHoverId(null);
    target.focus();
  };

  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (tray.current?.contains(event.relatedTarget as Node | null)) return;
    setFocusId(null);
    setPressing(false);
  };

  const classes = [styles.group, styles[variant], styles[size], vertical ? styles.vertical : "", className].filter(Boolean).join(" ");

  const group = <div data-slot="floating-button-group" data-reduced={preferReduced ? "true" : "false"} data-motion={arcLive && !preferReduced ? "on" : "off"} 
    ref={tray}
    className={classes}
    style={style}
    role="toolbar"
    aria-label={label}
    aria-orientation={orientation}
    data-variant={variant}
    onKeyDown={onKeyDown}
    onBlur={onBlur}
  >
    <ArcStyle /><motion.span className={styles.highlight} data-pressing={pressing && activeId ? "" : undefined} style={{ x, y, width, height, opacity, scale }} aria-hidden="true" />
    {items.map((item, position) => {
      if (!isAction(item)) return <span key={item.id ?? `separator-${position}`} className={styles.separator} role="separator" aria-orientation={vertical ? "horizontal" : "vertical"} />;
      const { id, label: itemLabel, icon, onSelect, disabled = false, pressed, shortcut, reserveLabels = [] } = item;
      const iconOnly = !!icon && (item.iconOnly ?? groupIconOnly);
      const button = <button
        ref={node => { if (node) nodes.current.set(id, node); else nodes.current.delete(id); }}
        type="button"
        className={styles.item}
        data-fbg-item=""
        data-active={activeId === id ? "" : undefined}
        data-icon={icon ? "" : undefined}
        data-icon-only={iconOnly ? "" : undefined}
        aria-label={itemLabel}
        aria-pressed={pressed === undefined ? undefined : pressed}
        aria-disabled={disabled || undefined}
        tabIndex={stop === id ? 0 : -1}
        onPointerMove={event => { if (event.pointerType === "mouse" || event.pointerType === "pen") setHoverId(id); }}
        onPointerDown={event => { if (disabled || event.button !== 0) return; setHoverId(id); setPressing(true); }}
        onPointerUp={() => setPressing(false)}
        onPointerCancel={() => setPressing(false)}
        onPointerLeave={() => setPressing(false)}
        onKeyDown={event => { if ((event.key === "Enter" || event.key === " ") && !event.repeat && !disabled) setPressing(true); }}
        onKeyUp={event => { if (event.key === "Enter" || event.key === " ") setPressing(false); }}
        onFocus={event => {
          setTabStop(id);
          let keyboard = false;
          try { keyboard = event.currentTarget.matches(":focus-visible"); } catch { keyboard = false; }
          setFocusId(keyboard ? id : null);
        }}
        onClick={() => {
          if (disabled) return;
          onSelect?.();
          onAction?.(id);
        }}
      >
        <ItemBody label={itemLabel} icon={icon} iconOnly={iconOnly} reserve={reserveLabels} reduced={reduced} />
      </button>;
      // Tooltips render no wrapper element, so every button stays a direct child of the tray and measures against it.
      if (!iconOnly && !shortcut) return <Fragment key={id}>{button}</Fragment>;
      const tip = <TipContent label={itemLabel} shortcut={shortcut} />;
      return side === "top" || side === "bottom"
        ? <Tooltip key={id} side={side} content={tip}>{button}</Tooltip>
        : <SideTip key={id} side={side} content={tip}>{button}</SideTip>;
    })}
  </div>;

  return <ArcQuiet.Provider value={!arcLive}><TooltipPrimitive.Provider delayDuration={250} skipDelayDuration={300} disableHoverableContent={side === "left" || side === "right"}>{group}</TooltipPrimitive.Provider></ArcQuiet.Provider>;
}

export default FloatingButtonGroup;
