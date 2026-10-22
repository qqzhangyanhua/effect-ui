"use client";

// Ported from Arc Library (MIT, (c) 2026 Elia Kuratli) — https://github.com/kuratlielia/arc-library/blob/main/registry/components/split-button/split-button.tsx

import { useAnimationActive } from "@/hooks/use-animation-active";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

import { isValidElement, useEffect, useLayoutEffect, useRef, useState , createContext, useContext} from "react";
import type { CSSProperties, ReactNode, RefObject } from "react";
import * as DropdownPrimitive from "@radix-ui/react-dropdown-menu";
import { AnimatePresence, animate, motion, useMotionValue } from "motion/react";
import type { TargetAndTransition } from "motion/react";
import { ChevronDown } from "lucide-react";
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

const styles: Record<string, string> = new Proxy({} as Record<string, string>, { get: (_target, key) => (typeof key === "string" ? "split-button-" + key : "") });

const arcCss = ":where([class^=\"split-button-\"], [class*=\" split-button-\"]) {\n  --surface: var(--background);\n  --surface-raised: var(--popover);\n  --surface-muted: var(--muted);\n  --text-secondary: var(--muted-foreground);\n  --text-muted: var(--muted-foreground);\n  --border-subtle: color-mix(in oklab, var(--border) 65%, var(--background));\n  --border-strong: color-mix(in oklab, var(--foreground) 28%, var(--border));\n  --accent: var(--primary);\n  --accent-strong: var(--primary);\n  --accent-foreground: var(--primary-foreground);\n  --accent-subtle: color-mix(in oklab, var(--primary) 12%, transparent);\n  --danger: var(--destructive);\n  --success: var(--primary);\n  --warning: var(--destructive);\n  --control-on: var(--primary);\n  --control-glyph: var(--primary-foreground);\n  --shadow-resting: 0 1px 2px oklch(0% 0 0 / .035);\n  --shadow-raised: 0 6px 18px oklch(0% 0 0 / .065), 0 1px 3px oklch(0% 0 0 / .035);\n  --shadow-floating: 0 20px 48px oklch(0% 0 0 / .105), 0 3px 10px oklch(0% 0 0 / .045);\n  --radius-control: 1.125rem;\n  --radius-panel: 1.625rem;\n  --radius-surface: 2.125rem;\n  --radius-pill: 9999px;\n  --control-height-sm: 2.25rem;\n  --control-height-md: 2.75rem;\n  --control-height-lg: 3.125rem;\n  --space-1: .25rem; --space-2: .5rem; --space-3: .75rem; --space-4: 1rem;\n  --space-5: 1.25rem; --space-6: 1.5rem; --space-8: 2rem;\n  --text-xs: .75rem; --text-sm: .875rem; --text-base: 1rem;\n  --tracking-body: -.01em; --leading-body: 1.4;\n  --font-body: inherit; --font-display: inherit;\n  --ease-enter: cubic-bezier(.16, 1, .3, 1);\n  --ease-standard: cubic-bezier(.22, 1, .36, 1);\n  --ease-exit: cubic-bezier(.7, 0, .84, 0);\n  --ease-in-out: cubic-bezier(.65, 0, .35, 1);\n  --ease-spring: linear(0, 0.0213, 0.0739, 0.1443, 0.2235, 0.305, 0.3849, 0.4606, 0.5305, 0.594, 0.6508, 0.7011, 0.7452, 0.7836, 0.8168, 0.8454, 0.8699, 0.8907, 0.9084, 0.9234, 0.9361, 0.9467, 0.9557, 0.9632, 0.9694, 0.9747, 0.979, 0.9826, 0.9857, 0.9882, 0.9902, 0.992, 0.9934, 0.9946, 0.9955, 0.9963, 1);\n  --duration-instant: 120ms; --duration-fast: 160ms; --duration-standard: 240ms; --duration-considered: 480ms; --duration-spring: 580ms;\n  --series-1: var(--primary);\n  --series-2: #7128a5;\n  --series-3: #e58f00;\n  --series-4: #009e84;\n  color: var(--foreground);\n}\n.dark :where([class^=\"split-button-\"], [class*=\" split-button-\"]) { --series-1: #55adff; --series-2: #9c37be; --series-3: #e66e00; --series-4: #00a861; }\n@supports (color: oklch(from red clamp(.4, l * sign(max(c - .02, 0)) + .5, .8) c h)) {\n  :where([class^=\"split-button-\"], [class*=\" split-button-\"]) {\n    --series-1: oklch(from var(--accent) calc(l * sign(max(c - .02, 0)) + .58 * (1 - sign(max(c - .02, 0)))) calc(c * sign(max(c - .02, 0)) + .15 * (1 - sign(max(c - .02, 0)))) calc(h * sign(max(c - .02, 0)) + 250 * (1 - sign(max(c - .02, 0)))));\n    --series-2: oklch(from var(--accent) clamp(.45, l * sign(max(c - .02, 0)) + .58 * (1 - sign(max(c - .02, 0))) - 0.25, .76) .19 calc(h * sign(max(c - .02, 0)) + 250 * (1 - sign(max(c - .02, 0))) + 57));\n    --series-3: oklch(from var(--accent) clamp(.45, l * sign(max(c - .02, 0)) + .58 * (1 - sign(max(c - .02, 0))) + 0.14, .76) .18 calc(h * sign(max(c - .02, 0)) + 250 * (1 - sign(max(c - .02, 0))) + 184));\n    --series-4: oklch(from var(--accent) clamp(.45, l * sign(max(c - .02, 0)) + .58 * (1 - sign(max(c - .02, 0))), .76) .21 calc(h * sign(max(c - .02, 0)) + 250 * (1 - sign(max(c - .02, 0))) + 292));\n  }\n  .dark :where([class^=\"split-button-\"], [class*=\" split-button-\"]) {\n    --series-1: oklch(from var(--accent) calc(l * sign(max(c - .02, 0)) + .73 * (1 - sign(max(c - .02, 0)))) calc(c * sign(max(c - .02, 0)) + .15 * (1 - sign(max(c - .02, 0)))) calc(h * sign(max(c - .02, 0)) + 250 * (1 - sign(max(c - .02, 0)))));\n    --series-2: oklch(from var(--accent) clamp(.485, l * sign(max(c - .02, 0)) + .73 * (1 - sign(max(c - .02, 0))) - 0.19, .665) .21 calc(h * sign(max(c - .02, 0)) + 250 * (1 - sign(max(c - .02, 0))) + 66));\n    --series-3: oklch(from var(--accent) clamp(.485, l * sign(max(c - .02, 0)) + .73 * (1 - sign(max(c - .02, 0))) + 0.02, .665) .21 calc(h * sign(max(c - .02, 0)) + 250 * (1 - sign(max(c - .02, 0))) + 175));\n    --series-4: oklch(from var(--accent) clamp(.485, l * sign(max(c - .02, 0)) + .73 * (1 - sign(max(c - .02, 0))) - 0.1, .665) .18 calc(h * sign(max(c - .02, 0)) + 250 * (1 - sign(max(c - .02, 0))) + 270));\n  }\n}\n/* One pill, two actions. The whole pill presses in for the main action; the menu half answers in color only, because Radix measures it on pointerdown to place the menu. */\n.split-button-group { display: inline-flex; align-items: stretch; border: 1px solid var(--foreground); border-radius: var(--radius-control); background: var(--foreground); transition: transform var(--duration-spring) var(--ease-spring); }\n.split-button-group:has(> .split-button-primary:active:not(:disabled)) { transform: scale(.97); transition-duration: var(--duration-instant); transition-timing-function: var(--ease-standard); }\n.split-button-primary, .split-button-trigger { border: 0; background: var(--foreground); color: var(--background); font: inherit; cursor: pointer; -webkit-tap-highlight-color: transparent; transition: background-color var(--duration-fast) var(--ease-standard), color var(--duration-fast) var(--ease-standard), opacity var(--duration-fast) var(--ease-standard); }\n.split-button-primary { position: relative; display: inline-grid; min-height: var(--control-height-md); place-items: center; padding: 0 var(--space-4); border-radius: calc(var(--radius-control) - 1px) 0 0 calc(var(--radius-control) - 1px); font-size: var(--text-sm); font-weight: 500; }\n/* The slot springs to the width of the next label; the content leads from the start edge and is clipped only while it morphs. */\n.split-button-primarySlot { display: inline-flex; min-width: 0; align-items: center; }\n.split-button-primarySlot[data-morphing] { clip-path: inset(-50% calc(var(--space-2) * -1)); }\n.split-button-primaryContent { display: inline-flex; flex: none; align-items: center; gap: var(--space-2); white-space: nowrap; }\n.split-button-mainIcon { display: inline-grid; flex: none; place-items: center; }\n.split-button-iconPhase { grid-area: 1 / 1; display: inline-flex; align-items: center; justify-content: center; }\n.split-button-glyphs { position: relative; display: inline-flex; flex: none; white-space: pre; }\n.split-button-glyph { display: inline-block; }\n.split-button-trigger { display: grid; width: 38px; min-height: var(--control-height-md); place-items: center; border-left: 1px solid color-mix(in oklab, var(--background) 18%, var(--foreground)); border-radius: 0 calc(var(--radius-control) - 1px) calc(var(--radius-control) - 1px) 0; }\n.split-button-chevron { transition: transform var(--duration-spring) var(--ease-spring); }\n.split-button-trigger[data-state=\"open\"] .split-button-chevron { transform: rotate(180deg); }\n@media (hover: hover) and (pointer: fine) {\n  .split-button-primary:hover:not(:disabled), .split-button-trigger:hover:not(:disabled) { background: color-mix(in oklab, var(--foreground) 88%, var(--background)); }\n  .split-button-secondary .split-button-primary:hover:not(:disabled), .split-button-secondary .split-button-trigger:hover:not(:disabled) { background: var(--surface-muted); }\n}\n.split-button-primary:active:not(:disabled), .split-button-trigger:active:not(:disabled), .split-button-trigger[data-state=\"open\"] { background: color-mix(in oklab, var(--foreground) 80%, var(--background)); }\n.split-button-primary:disabled, .split-button-trigger:disabled { cursor: not-allowed; opacity: .52; }\n.split-button-secondary { border-color: var(--border); border-radius: var(--radius-pill); background: var(--surface); }\n.split-button-secondary .split-button-primary, .split-button-secondary .split-button-trigger { min-height: var(--control-height-sm); background: var(--surface); color: var(--foreground); }\n.split-button-secondary .split-button-primary { min-width: 142px; border-radius: var(--radius-pill) 0 0 var(--radius-pill); padding-inline: var(--space-3); font-size: var(--text-xs); }\n.split-button-secondary .split-button-trigger { width: 32px; border-left-color: var(--border-subtle); border-radius: 0 var(--radius-pill) var(--radius-pill) 0; }\n.split-button-secondary .split-button-primary:active:not(:disabled), .split-button-secondary .split-button-trigger:active:not(:disabled), .split-button-secondary .split-button-trigger[data-state=\"open\"] { background: color-mix(in oklab, var(--surface-muted), var(--border) 55%); }\n.split-button-icon { display: inline-flex; }\n.split-button-srOnly { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }\n/* The menu grows from the trigger edge: offset toward the trigger, scale from the Radix origin, fade quickly; it leaves faster than it arrives.\n   Transitions instead of keyframes, so a close that interrupts the open reverses from where the menu is instead of snapping to rest first. */\n.split-button-menu { --menu-x: 0px; --menu-y: -5px; z-index: 60; min-width: min(12rem, var(--radix-dropdown-menu-content-available-width)); max-width: var(--radix-dropdown-menu-content-available-width); padding: 5px; border: 1px solid var(--border); border-radius: var(--radius-panel); background: var(--surface-raised); color: var(--foreground); box-shadow: var(--shadow-floating); transform-origin: var(--radix-dropdown-menu-content-transform-origin); transition: opacity var(--duration-fast) var(--ease-enter), transform var(--duration-spring) var(--ease-spring); }\n.split-button-menu[data-side=\"top\"] { --menu-y: 5px; }\n.split-button-menu[data-side=\"left\"] { --menu-x: 5px; --menu-y: 0px; }\n.split-button-menu[data-side=\"right\"] { --menu-x: -5px; --menu-y: 0px; }\n@starting-style {\n  .split-button-menu[data-state=\"open\"] { opacity: 0; transform: translate(var(--menu-x), var(--menu-y)) scale(.97); }\n  .split-button-menu[data-state=\"open\"] .split-button-item { opacity: 0; transform: translate(calc(var(--menu-x) * .4), calc(var(--menu-y) * .4)); }\n}\n/* Radix unmounts when the exit animation ends, so a no-op keyframe times the exit while the transition does the visual work. */\n.split-button-menu[data-state=\"closed\"] { opacity: 0; transform: translate(calc(var(--menu-x) * .5), calc(var(--menu-y) * .5)) scale(.985); transition: opacity 130ms var(--ease-standard), transform 130ms var(--ease-standard); animation: split-button-menu-exit 130ms linear both; pointer-events: none; }\n/* Highlight follows the pointer and arrow keys instantly, like a native menu. */\n.split-button-item { display: flex; min-height: var(--control-height-sm); align-items: center; gap: 10px; padding: 0 11px; border-radius: calc(var(--radius-panel) - 6px); font-size: var(--text-sm); cursor: pointer; outline: none; transition: opacity var(--duration-standard) var(--ease-enter) calc(min(var(--i, 0), 4) * 35ms), transform var(--duration-standard) var(--ease-enter) calc(min(var(--i, 0), 4) * 35ms); }\n.split-button-item[data-highlighted] { background: var(--surface-muted); }\n.split-button-item[data-disabled] { cursor: default; opacity: .45; }\n.split-button-destructive { color: var(--danger); }\n.split-button-destructive[data-highlighted] { background: color-mix(in oklab, var(--danger) 8%, var(--surface)); }\n@keyframes split-button-menu-exit { to { --menu-exit: 1; } }\n@media (prefers-reduced-motion: reduce) {\n  .split-button-group, .split-button-primary, .split-button-trigger, .split-button-chevron { transition: none; }\n  .split-button-group:has(> .split-button-primary:active:not(:disabled)) { transform: none; }\n  .split-button-item { transition: none; }\n  .split-button-menu, .split-button-menu[data-state=\"closed\"] { transform: none; transition: opacity var(--duration-instant) linear; }\n}\n\n";

function ArcStyle() {
  return <style>{arcCss}</style>;
}


export interface SplitButtonAction { label: string; onSelect?: () => void; disabled?: boolean; destructive?: boolean; icon?: ReactNode; }
export interface SplitButtonProps { label: string; actions: SplitButtonAction[]; onClick?: () => void; disabled?: boolean; icon?: ReactNode; variant?: "primary" | "secondary"; }

const rest: TargetAndTransition = { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" };
const fadeIn: TargetAndTransition = { ...rest, opacity: 0 };
const fadeOut: TargetAndTransition = { opacity: 0, transition: { duration: motionTokens.duration.instant } };
const glyphIn: TargetAndTransition = { opacity: 0, y: 5, filter: `blur(${motionTokens.blur.soft}px)` };
const glyphOut: TargetAndTransition = { opacity: 0, y: -4, filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: motionTokens.duration.fast, ease: motionTokens.ease.standard } };
const iconIn: TargetAndTransition = { opacity: 0, scale: .6, filter: `blur(${motionTokens.blur.subtle}px)` };
const iconOut: TargetAndTransition = { ...iconIn, transition: { duration: motionTokens.duration.fast, ease: motionTokens.ease.standard } };
/** Scale rides the spring; opacity and blur tween so blur never overshoots below zero. */
const iconEnter = { ...motionTokens.spring.snappy, opacity: { duration: motionTokens.duration.fast, ease: motionTokens.ease.enter }, filter: { duration: motionTokens.duration.fast, ease: motionTokens.ease.enter } } as const;

/** Names the icon element, so swapping Copy for Check morphs while a re-render of the same icon stays still. */
function iconKey(node: ReactNode): string {
  if (!isValidElement(node)) return node == null || typeof node === "boolean" ? "" : String(node);
  const type = node.type as string | { displayName?: string; name?: string };
  return typeof type === "string" ? type : type?.displayName ?? type?.name ?? "icon";
}

/** Springs the slot to the natural width of its content when the label changes; other resizes (a late web font) jump. */
function useMorphWidth(content: RefObject<HTMLElement | null>, key: string, reduced: boolean) {
  const width = useMotionValue<number | "auto">("auto");
  const lastKey = useRef(key), armedUntil = useRef(0);
  useLayoutEffect(() => {
    if (lastKey.current === key) return;
    lastKey.current = key;
    armedUntil.current = performance.now() + 700;
  }, [key]);
  useEffect(() => {
    const node = content.current, slot = node?.parentElement;
    if (!node || !slot || typeof ResizeObserver === "undefined") return;
    let measured = false;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const next = entry.contentRect.width;
      if (!next || !measured || reduced || performance.now() > armedUntil.current) { measured = next > 0; width.jump(next || "auto"); delete slot.dataset.morphing; return; }
      slot.dataset.morphing = "";
      animate(width, next, { ...motionTokens.spring.morph, onComplete: () => { delete slot.dataset.morphing; } });
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [content, reduced, width]);
  return width;
}

type Glyph = { id: string; char: string; order: number };
const toGlyphs = (chars: string[], seq: number): Glyph[] => chars.map((char, order) => ({ id: `${seq}:${order}`, char, order }));

/** Shared leading and trailing characters keep their identity, so "Copy page" to "Copied" only replaces the changed letters. */
function useGlyphs(text: string) {
  const [state, setState] = useState(() => ({ text, seq: 0, glyphs: toGlyphs([...text], 0) }));
  if (state.text === text) return state.glyphs;
  const prev = [...state.text], next = [...text];
  let start = 0, end = 0;
  while (start < prev.length && start < next.length && prev[start] === next[start]) start++;
  while (end < prev.length - start && end < next.length - start && prev[prev.length - 1 - end] === next[next.length - 1 - end]) end++;
  if (start < 2) start = 0;
  if (end < 2) end = 0;
  const seq = state.seq + 1;
  const glyphs = [...state.glyphs.slice(0, start), ...toGlyphs(next.slice(start, next.length - end), seq), ...state.glyphs.slice(state.glyphs.length - end)];
  setState({ text, seq, glyphs });
  return glyphs;
}

function MorphText({ text, reduced }: { text: string; reduced: boolean }) {
  const glyphs = useGlyphs(text);
  return <span className={styles.glyphs}>
    <AnimatePresence mode="popLayout" initial={false}>
      {glyphs.map(glyph => <motion.span key={glyph.id} className={styles.glyph} layout={reduced ? false : "position"} layoutDependency={text} initial={reduced ? fadeIn : glyphIn} animate={rest} exit={reduced ? fadeOut : glyphOut} transition={reduced ? { duration: motionTokens.duration.instant } : { duration: motionTokens.duration.standard, ease: motionTokens.ease.enter, delay: Math.min(glyph.order * motionTokens.stagger.char, .1), layout: motionTokens.spring.morph }}>{glyph.char}</motion.span>)}
    </AnimatePresence>
  </span>;
}

/** The main action morphs its icon and label in place while its width follows on a spring; the menu half never scales, so the menu opens from a still anchor. */
export function SplitButton({ label, actions, onClick, disabled, icon, variant = "primary" }: SplitButtonProps) {
  const preferReduced = useArcReduced();
  const groupRef = useRef<HTMLDivElement>(null);
  const arcLive = useAnimationActive(groupRef);
  const reduced = preferReduced || !arcLive;
  const contentRef = useRef<HTMLSpanElement>(null);
  const glyph = iconKey(icon);
  const width = useMorphWidth(contentRef, `${glyph}|${label}`, reduced);
  return <DropdownPrimitive.Root>
    <ArcQuiet.Provider value={!arcLive}><ArcStyle /><div data-slot="split-button" data-reduced={preferReduced ? "true" : "false"} data-motion={arcLive && !preferReduced ? "on" : "off"}  ref={groupRef} className={[styles.group, variant === "secondary" ? styles.secondary : ""].filter(Boolean).join(" ")}>
      <button className={styles.primary} type="button" onClick={onClick} disabled={disabled}>
        <motion.span className={styles.primarySlot} style={{ width }} aria-hidden="true">
          <span ref={contentRef} className={styles.primaryContent}>
            {icon ? <span className={styles.mainIcon}><AnimatePresence initial={false}><motion.span key={glyph} className={styles.iconPhase} initial={reduced ? fadeIn : iconIn} animate={rest} exit={reduced ? fadeOut : iconOut} transition={reduced ? { duration: motionTokens.duration.instant } : iconEnter}>{icon}</motion.span></AnimatePresence></span> : null}
            <MorphText text={label} reduced={reduced} />
          </span>
        </motion.span>
        <span className={styles.srOnly} aria-live="polite">{label}</span>
      </button>
      <DropdownPrimitive.Trigger className={styles.trigger} type="button" aria-label={`${label} more actions`} disabled={disabled}><ChevronDown className={styles.chevron} size={16} strokeWidth={1.75} aria-hidden="true" /></DropdownPrimitive.Trigger>
    </div></ArcQuiet.Provider>
    <DropdownPrimitive.Portal><DropdownPrimitive.Content className={styles.menu} sideOffset={4} align="end" collisionPadding={12} loop>
      {actions.map((action, index) => <DropdownPrimitive.Item key={action.label} className={[styles.item, action.destructive ? styles.destructive : ""].filter(Boolean).join(" ")} style={{ "--i": index } as CSSProperties} disabled={action.disabled} onSelect={action.onSelect}>{action.icon ? <span className={styles.icon} aria-hidden="true">{action.icon}</span> : null}{action.label}</DropdownPrimitive.Item>)}
    </DropdownPrimitive.Content></DropdownPrimitive.Portal>
  </DropdownPrimitive.Root>;
}

export default SplitButton;
