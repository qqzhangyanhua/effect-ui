"use client";

// Ported from Arc Library (MIT, (c) 2026 Elia Kuratli) — https://github.com/kuratlielia/arc-library/blob/main/registry/components/user-menu/user-menu.tsx

import { useAnimationActive } from "@/hooks/use-animation-active";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

import { useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore , createContext, useContext} from "react";
import type { CSSProperties, FocusEvent, KeyboardEvent, MouseEvent, PointerEvent, ReactNode, Ref } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import type { PanInfo, Transition, Variants } from "motion/react";
import { ChevronDown, LoaderCircle, LogOut, Monitor, Moon, Sun, SunMoon } from "lucide-react";
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

const styles: Record<string, string> = new Proxy({} as Record<string, string>, { get: (_target, key) => (typeof key === "string" ? "user-menu-" + key : "") });

const arcCss = ":where([class^=\"user-menu-\"], [class*=\" user-menu-\"]) {\n  --surface: var(--background);\n  --surface-raised: var(--popover);\n  --surface-muted: var(--muted);\n  --text-secondary: var(--muted-foreground);\n  --text-muted: var(--muted-foreground);\n  --border-subtle: color-mix(in oklab, var(--border) 65%, var(--background));\n  --border-strong: color-mix(in oklab, var(--foreground) 28%, var(--border));\n  --accent: var(--primary);\n  --accent-strong: var(--primary);\n  --accent-foreground: var(--primary-foreground);\n  --accent-subtle: color-mix(in oklab, var(--primary) 12%, transparent);\n  --danger: var(--destructive);\n  --success: var(--primary);\n  --warning: var(--destructive);\n  --control-on: var(--primary);\n  --control-glyph: var(--primary-foreground);\n  --shadow-resting: 0 1px 2px oklch(0% 0 0 / .035);\n  --shadow-raised: 0 6px 18px oklch(0% 0 0 / .065), 0 1px 3px oklch(0% 0 0 / .035);\n  --shadow-floating: 0 20px 48px oklch(0% 0 0 / .105), 0 3px 10px oklch(0% 0 0 / .045);\n  --radius-control: 1.125rem;\n  --radius-panel: 1.625rem;\n  --radius-surface: 2.125rem;\n  --radius-pill: 9999px;\n  --control-height-sm: 2.25rem;\n  --control-height-md: 2.75rem;\n  --control-height-lg: 3.125rem;\n  --space-1: .25rem; --space-2: .5rem; --space-3: .75rem; --space-4: 1rem;\n  --space-5: 1.25rem; --space-6: 1.5rem; --space-8: 2rem;\n  --text-xs: .75rem; --text-sm: .875rem; --text-base: 1rem;\n  --tracking-body: -.01em; --leading-body: 1.4;\n  --font-body: inherit; --font-display: inherit;\n  --ease-enter: cubic-bezier(.16, 1, .3, 1);\n  --ease-standard: cubic-bezier(.22, 1, .36, 1);\n  --ease-exit: cubic-bezier(.7, 0, .84, 0);\n  --ease-in-out: cubic-bezier(.65, 0, .35, 1);\n  --ease-spring: linear(0, 0.0213, 0.0739, 0.1443, 0.2235, 0.305, 0.3849, 0.4606, 0.5305, 0.594, 0.6508, 0.7011, 0.7452, 0.7836, 0.8168, 0.8454, 0.8699, 0.8907, 0.9084, 0.9234, 0.9361, 0.9467, 0.9557, 0.9632, 0.9694, 0.9747, 0.979, 0.9826, 0.9857, 0.9882, 0.9902, 0.992, 0.9934, 0.9946, 0.9955, 0.9963, 1);\n  --duration-instant: 120ms; --duration-fast: 160ms; --duration-standard: 240ms; --duration-considered: 480ms; --duration-spring: 580ms;\n  --series-1: var(--primary);\n  --series-2: #7128a5;\n  --series-3: #e58f00;\n  --series-4: #009e84;\n  color: var(--foreground);\n}\n.dark :where([class^=\"user-menu-\"], [class*=\" user-menu-\"]) { --series-1: #55adff; --series-2: #9c37be; --series-3: #e66e00; --series-4: #00a861; }\n@supports (color: oklch(from red clamp(.4, l * sign(max(c - .02, 0)) + .5, .8) c h)) {\n  :where([class^=\"user-menu-\"], [class*=\" user-menu-\"]) {\n    --series-1: oklch(from var(--accent) calc(l * sign(max(c - .02, 0)) + .58 * (1 - sign(max(c - .02, 0)))) calc(c * sign(max(c - .02, 0)) + .15 * (1 - sign(max(c - .02, 0)))) calc(h * sign(max(c - .02, 0)) + 250 * (1 - sign(max(c - .02, 0)))));\n    --series-2: oklch(from var(--accent) clamp(.45, l * sign(max(c - .02, 0)) + .58 * (1 - sign(max(c - .02, 0))) - 0.25, .76) .19 calc(h * sign(max(c - .02, 0)) + 250 * (1 - sign(max(c - .02, 0))) + 57));\n    --series-3: oklch(from var(--accent) clamp(.45, l * sign(max(c - .02, 0)) + .58 * (1 - sign(max(c - .02, 0))) + 0.14, .76) .18 calc(h * sign(max(c - .02, 0)) + 250 * (1 - sign(max(c - .02, 0))) + 184));\n    --series-4: oklch(from var(--accent) clamp(.45, l * sign(max(c - .02, 0)) + .58 * (1 - sign(max(c - .02, 0))), .76) .21 calc(h * sign(max(c - .02, 0)) + 250 * (1 - sign(max(c - .02, 0))) + 292));\n  }\n  .dark :where([class^=\"user-menu-\"], [class*=\" user-menu-\"]) {\n    --series-1: oklch(from var(--accent) calc(l * sign(max(c - .02, 0)) + .73 * (1 - sign(max(c - .02, 0)))) calc(c * sign(max(c - .02, 0)) + .15 * (1 - sign(max(c - .02, 0)))) calc(h * sign(max(c - .02, 0)) + 250 * (1 - sign(max(c - .02, 0)))));\n    --series-2: oklch(from var(--accent) clamp(.485, l * sign(max(c - .02, 0)) + .73 * (1 - sign(max(c - .02, 0))) - 0.19, .665) .21 calc(h * sign(max(c - .02, 0)) + 250 * (1 - sign(max(c - .02, 0))) + 66));\n    --series-3: oklch(from var(--accent) clamp(.485, l * sign(max(c - .02, 0)) + .73 * (1 - sign(max(c - .02, 0))) + 0.02, .665) .21 calc(h * sign(max(c - .02, 0)) + 250 * (1 - sign(max(c - .02, 0))) + 175));\n    --series-4: oklch(from var(--accent) clamp(.485, l * sign(max(c - .02, 0)) + .73 * (1 - sign(max(c - .02, 0))) - 0.1, .665) .18 calc(h * sign(max(c - .02, 0)) + 250 * (1 - sign(max(c - .02, 0))) + 270));\n  }\n}\n.user-menu-root { position: relative; display: inline-flex; flex: none; vertical-align: middle; }\n\n/* The trigger anchors the menu, so it answers hover and press with color, never with scale. */\n.user-menu-trigger { --presence-surface: var(--user-menu-surface, var(--surface)); position: relative; display: inline-flex; height: 40px; flex: none; align-items: center; gap: var(--space-2); margin: 0; padding: 4px; border: 0; border-radius: var(--radius-pill); background: transparent; color: var(--foreground); font: inherit; font-family: var(--font-body); font-size: var(--text-sm); letter-spacing: var(--tracking-body); cursor: pointer; -webkit-tap-highlight-color: transparent; transition: background-color var(--duration-fast) var(--ease-standard); }\n.user-menu-trigger[data-name] { padding-right: 10px; }\n@media (hover: hover) and (pointer: fine) { .user-menu-trigger:hover { --presence-surface: var(--surface-muted); background: var(--surface-muted); } }\n.user-menu-trigger[data-state=\"open\"] { --presence-surface: var(--surface-muted); background: var(--surface-muted); }\n.user-menu-trigger:active { --presence-surface: color-mix(in oklab, var(--surface-muted), var(--foreground) 8%); background: color-mix(in oklab, var(--surface-muted), var(--foreground) 8%); }\n.user-menu-triggerName { max-width: 11rem; overflow: hidden; font-weight: 500; line-height: 1; text-overflow: ellipsis; white-space: nowrap; }\n.user-menu-chevron { flex: none; margin-left: -2px; color: var(--text-muted); transition: transform var(--duration-spring) var(--ease-spring), color var(--duration-fast) var(--ease-standard); }\n.user-menu-trigger:hover .user-menu-chevron, .user-menu-trigger[data-state=\"open\"] .user-menu-chevron { color: var(--foreground); }\n.user-menu-trigger[data-state=\"open\"] .user-menu-chevron { transform: rotate(180deg); }\n@media (max-width: 639px) {\n  .user-menu-trigger[data-name] { padding-right: 4px; }\n  .user-menu-triggerName, .user-menu-chevron { display: none; }\n}\n\n.user-menu-face { position: relative; display: inline-grid; width: var(--face-size); height: var(--face-size); flex: none; }\n.user-menu-face[data-size=\"sm\"] { --face-size: 32px; --dot-size: 11px; }\n.user-menu-face[data-size=\"md\"] { --face-size: 34px; --dot-size: 10px; }\n.user-menu-portrait { display: block; width: 100%; height: 100%; border-radius: var(--radius-pill); background: var(--surface-muted); object-fit: cover; object-position: 50% 15%; outline: 1px solid color-mix(in oklab, var(--foreground) 9%, transparent); outline-offset: -1px; user-select: none; }\n.user-menu-initials { display: grid; place-items: center; color: var(--text-secondary); font-size: calc(var(--face-size) * .36); font-weight: 500; line-height: 1; }\n.user-menu-face .user-menu-dot { position: absolute; right: -1px; bottom: -1px; box-shadow: 0 0 0 2px var(--presence-surface, var(--surface)); }\n\n/* One mark, three shapes: solid for available, a bar for busy, a ring for away. Color and shape change together, so status never rests on color alone. */\n.user-menu-dot { --dot-color: var(--success); position: relative; display: inline-block; width: var(--dot-size, 10px); height: var(--dot-size, 10px); flex: none; border-radius: var(--radius-pill); background: var(--dot-color); transition: background-color var(--duration-standard) var(--ease-standard), box-shadow var(--duration-fast) var(--ease-standard); }\n.user-menu-dot::before, .user-menu-dot::after { content: \"\"; position: absolute; inset: 0; margin: auto; background: var(--presence-surface, var(--surface)); transition: transform var(--duration-spring) var(--ease-spring), background-color var(--duration-fast) var(--ease-standard); }\n.user-menu-dot::before { width: 46%; height: 46%; border-radius: var(--radius-pill); transform: scale(0); }\n.user-menu-dot::after { width: 58%; height: 22%; min-height: 1.5px; border-radius: 1px; transform: scaleX(0); }\n.user-menu-dot[data-status=\"busy\"] { --dot-color: var(--danger); }\n.user-menu-dot[data-status=\"busy\"]::after { transform: scaleX(1); }\n.user-menu-dot[data-status=\"away\"] { --dot-color: var(--warning); }\n.user-menu-dot[data-status=\"away\"]::before, .user-menu-dot[data-status=\"offline\"]::before { transform: scale(1); }\n.user-menu-dot[data-status=\"offline\"] { --dot-color: var(--text-muted); }\n\n/* The panel scales out of the avatar it belongs to; the component sets the origin once it is placed. */\n.user-menu-panel { --presence-surface: var(--surface-raised); --row: 32px; --inset: 4px; --menu-radius: 10px; --menu-line: color-mix(in oklab, var(--foreground) 9%, transparent); position: fixed; top: 0; left: 0; z-index: 60; box-sizing: border-box; width: 15.5rem; max-width: calc(100vw - 24px); padding: var(--inset); border: .5px solid var(--border); border-radius: var(--menu-radius); background: var(--surface-raised); box-shadow: var(--shadow-floating); color: var(--foreground); font-family: var(--font-body); letter-spacing: -.01em; line-height: 1.3; text-align: left; outline: none; transform-origin: var(--origin-x, 100%) var(--origin-y, 0px); }\n.user-menu-panel[data-inline] { position: absolute; top: calc(100% + 8px); left: auto; }\n.user-menu-panel[data-inline][data-align=\"end\"] { right: 0; }\n.user-menu-panel[data-inline][data-align=\"start\"] { left: 0; }\n.user-menu-panel[data-inline][data-align=\"center\"] { left: 50%; margin-left: -7.75rem; }\n\n.user-menu-header { display: flex; align-items: center; gap: 10px; padding: 8px 8px 8px; }\n.user-menu-identity { display: grid; min-width: 0; flex: 1; gap: 2px; }\n/* The name keeps its room; a long plan or role shrinks and truncates first. */\n.user-menu-nameRow { display: flex; min-width: 0; align-items: center; gap: 6px; }\n.user-menu-name { min-width: 0; flex: 0 1 auto; overflow: hidden; color: var(--foreground); font-size: 13px; font-weight: 500; letter-spacing: -.012em; line-height: 1.25; text-overflow: ellipsis; white-space: nowrap; }\n.user-menu-plan { display: inline-block; min-width: 0; max-width: 55%; flex: 0 100 auto; overflow: hidden; height: 17px; padding: 0 5px; border: .5px solid var(--menu-line); border-radius: 4px; background: color-mix(in oklab, var(--foreground) 4%, transparent); color: var(--text-secondary); font-size: 11px; font-weight: 500; letter-spacing: -.005em; line-height: 16px; text-overflow: ellipsis; white-space: nowrap; }\n.user-menu-email { overflow: hidden; color: var(--text-muted); font-size: 12px; letter-spacing: -.008em; line-height: 1.3; text-overflow: ellipsis; white-space: nowrap; }\n\n.user-menu-list { position: relative; }\n.user-menu-separator { height: .5px; margin: var(--inset) calc(var(--inset) * -1); background: var(--menu-line); }\n@media (max-resolution: 1dppx) { .user-menu-separator { height: 1px; background: color-mix(in oklab, var(--foreground) 6%, transparent); } }\n\n/* One highlight follows the pointer and the keyboard. It is the only hover treatment in the menu. */\n.user-menu-highlight { position: absolute; top: 0; right: 0; left: 0; border-radius: 6px; background: color-mix(in oklab, var(--foreground) 6%, transparent); opacity: 0; pointer-events: none; }\n\n.user-menu-item { position: relative; display: flex; width: 100%; height: var(--row); box-sizing: border-box; align-items: center; gap: 10px; margin: 0; padding: 0 8px; border: 0; border-radius: 6px; background: transparent; color: var(--foreground); font: inherit; font-size: 13px; text-align: left; cursor: pointer; outline: none; user-select: none; -webkit-tap-highlight-color: transparent; transition: color var(--duration-fast) var(--ease-standard); }\n.user-menu-icon { display: inline-grid; width: 16px; flex: none; place-items: center; color: var(--text-secondary); transition: color var(--duration-fast) var(--ease-standard); }\n.user-menu-item:focus .user-menu-icon { color: var(--foreground); }\n.user-menu-itemLabel { position: relative; display: inline-flex; min-width: 0; flex: 1; }\n.user-menu-rise { display: inline-block; white-space: nowrap; }\n/* Sign out is not destructive, so it stays neutral like every other row. */\n@media (hover: none) { .user-menu-item:active { background: var(--surface-muted); } }\n\n.user-menu-keys { display: inline-flex; flex: none; align-items: center; gap: 1px; margin-left: auto; color: var(--text-muted); font-family: var(--font-body); font-size: var(--text-xs); letter-spacing: 0; opacity: .8; font-variant-numeric: tabular-nums; }\n.user-menu-key { display: inline-block; min-width: 1.05em; font: inherit; text-align: center; }\n\n.user-menu-row { position: relative; display: flex; height: 36px; align-items: center; gap: 10px; padding: 0 4px 0 8px; }\n.user-menu-rowLabel { flex: 1; color: var(--foreground); font-size: 13px; }\n.user-menu-row .user-menu-icon .user-menu-dot { --dot-size: 10px; }\n/* The thumb slides under the icons; the group owns the stacking context. */\n.user-menu-segments { --segment: 28px; position: relative; isolation: isolate; display: inline-grid; height: 26px; flex: none; grid-auto-columns: var(--segment); grid-auto-flow: column; padding: 2px; border-radius: 7px; background: color-mix(in oklab, var(--foreground) 5%, transparent); }\n.user-menu-thumb { position: absolute; z-index: -1; top: 2px; bottom: 2px; left: 2px; width: var(--segment); border-radius: 5px; background: var(--surface-raised); box-shadow: 0 1px 1.5px oklch(0% 0 0 / .08), 0 0 0 .5px var(--menu-line); transform: translateX(calc(var(--index) * 100%)); transition: transform var(--duration-spring) var(--ease-spring); }\n.dark .user-menu-thumb { background: color-mix(in oklab, var(--foreground) 20%, var(--surface-raised)); box-shadow: none; }\n.user-menu-segment { display: grid; place-items: center; margin: 0; padding: 0; border: 0; border-radius: 5px; background: transparent; color: var(--text-muted); cursor: pointer; outline: none; -webkit-tap-highlight-color: transparent; transition: color var(--duration-fast) var(--ease-standard); }\n.user-menu-segment .user-menu-dot { --dot-size: 9px; --presence-surface: var(--surface-raised); }\n@media (hover: hover) and (pointer: fine) { .user-menu-segment:hover { color: var(--text-secondary); } }\n.user-menu-segment[aria-checked=\"true\"] { color: var(--foreground); }\n\n.user-menu-spinner { animation: user-menu-user-menu-spin .8s linear infinite; }\n@keyframes user-menu-user-menu-spin { to { transform: rotate(360deg); } }\n\n/* Below 640px the same content rises as a bottom sheet with larger rows. */\n.user-menu-scrim { position: fixed; inset: 0; z-index: 70; background: oklch(0% 0 0 / .32); -webkit-tap-highlight-color: transparent; }\n.user-menu-sheet { --row: 46px; --inset: 10px; position: fixed; top: auto; right: 0; bottom: 0; left: 0; z-index: 71; width: auto; max-width: none; max-height: 88dvh; overflow-y: auto; overscroll-behavior: contain; padding: 8px var(--inset) calc(12px + env(safe-area-inset-bottom)); border-bottom: 0; border-radius: var(--radius-panel) var(--radius-panel) 0 0; }\n.user-menu-handle { display: block; width: 36px; height: 5px; margin: 0 auto 10px; border-radius: var(--radius-pill); background: var(--border-strong); cursor: grab; }\n.user-menu-sheet .user-menu-header { padding: 4px 8px 12px; }\n.user-menu-sheet .user-menu-item, .user-menu-sheet .user-menu-rowLabel { font-size: var(--text-base); }\n.user-menu-sheet .user-menu-row { height: 52px; }\n.user-menu-sheet .user-menu-segments { --segment: 40px; height: 34px; }\n.user-menu-sheet .user-menu-keys { display: none; }\n\n@media (prefers-reduced-motion: reduce) {\n  .user-menu-trigger, .user-menu-chevron, .user-menu-dot, .user-menu-dot::before, .user-menu-dot::after, .user-menu-segment, .user-menu-thumb, .user-menu-item, .user-menu-icon { transition: none; }\n  .user-menu-spinner { animation-duration: 2.4s; }\n}\n\n.user-menu-trigger { min-height: 2.75rem; height: 2.75rem; }\n\n";

function ArcStyle() {
  return <style>{arcCss}</style>;
}


export type UserStatus = "available" | "busy" | "away";
export type ThemePreference = "light" | "dark" | "system";

/** Statuses in menu order. Each one has its own dot shape as well as color: solid, barred, or hollow. */
export const userStatuses: { value: UserStatus; label: string }[] = [
  { value: "available", label: "Available" },
  { value: "busy", label: "Busy" },
  { value: "away", label: "Away" },
];

const themes: { value: ThemePreference; label: string; icon: ReactNode }[] = [
  { value: "light", label: "Light", icon: <Sun size={14} strokeWidth={1.75} aria-hidden="true" /> },
  { value: "dark", label: "Dark", icon: <Moon size={14} strokeWidth={1.75} aria-hidden="true" /> },
  { value: "system", label: "System", icon: <Monitor size={14} strokeWidth={1.75} aria-hidden="true" /> },
];

export interface UserMenuUser { name: string; email: string; plan?: string; avatarSrc?: string; avatarSrcSet?: string }
export interface UserMenuItem { label: string; icon?: ReactNode; keys?: string[]; onSelect?: () => void }

/**
 * The account menu behind a person's photo in an app's top bar. It holds a compact identity header, a short group of account
 * destinations, an inline theme switch, and sign out. On screens narrower than 640px it opens as a bottom sheet instead.
 * Theme and status choices keep the menu open; everything else closes it and returns focus to the trigger.
 * When `onSignOut` returns a promise, the item shows its progress and the menu closes once it settles.
 */
export interface UserMenuProps {
  user: UserMenuUser;
  /** Presence status. Passing `status` or `onStatusChange` shows the presence dot and an inline status switch. */
  status?: UserStatus;
  defaultStatus?: UserStatus;
  onStatusChange?: (status: UserStatus) => void;
  theme?: ThemePreference;
  defaultTheme?: ThemePreference;
  /** Reports the choice. Applying it to the page is up to the app. */
  onThemeChange?: (theme: ThemePreference) => void;
  /** Shows the inline light, dark, and system switch. */
  showTheme?: boolean;
  /** Account destinations with optional shortcut hints, such as ["⌘", ","]. Keep it to three or four. */
  items?: UserMenuItem[];
  onSignOut?: () => void | Promise<unknown>;
  signOutKeys?: string[];
  align?: "start" | "center" | "end";
  /** Shows the name and a chevron beside the avatar from 640px up. */
  showName?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Renders the desktop panel in a portal on the body. Pass false to keep it inside the trigger's wrapper. */
  portal?: boolean;
  /** The trigger button, for returning focus after the menu is swapped out. */
  ref?: Ref<HTMLButtonElement>;
  className?: string;
}

type Highlight = { top: number; height: number; tone?: string; glide: boolean };
type OpenReason = "first" | "last" | "pointer" | null;

const compactQuery = "(max-width: 639px)";
const subscribeCompact = (change: () => void) => { const query = window.matchMedia(compactQuery); query.addEventListener("change", change); return () => query.removeEventListener("change", change); };
const subscribeNothing = () => () => {};
const statusLabel = (status: UserStatus) => userStatuses.find(option => option.value === status)?.label ?? status;
const enter = motionTokens.ease.enter as [number, number, number, number];
const standard = motionTokens.ease.standard as [number, number, number, number];
const exitEase = [0.4, 0, 1, 1] as [number, number, number, number];

/** The panel grows out of the trigger on a critically damped spring; rows follow a beat later. Closing is a short fade. */
const panelMotion: Variants = {
  closed: { opacity: 0, scale: .94 },
  open: { opacity: 1, scale: 1, transition: { type: "spring", visualDuration: .3, bounce: 0, opacity: { duration: motionTokens.duration.fast, ease: enter }, delayChildren: .03, staggerChildren: .016 } },
  exit: { opacity: 0, scale: .97, transition: { duration: motionTokens.duration.instant, ease: exitEase } },
};
const sheetMotion: Variants = {
  closed: { y: "100%" },
  open: { y: 0, transition: { ...motionTokens.spring.smooth, visualDuration: .36, delayChildren: .06, staggerChildren: .02 } },
  exit: { y: "100%", transition: { duration: .22, ease: exitEase } },
};
const stillMotion: Variants = { closed: { opacity: 0 }, open: { opacity: 1, transition: { duration: motionTokens.duration.instant } }, exit: { opacity: 0, transition: { duration: motionTokens.duration.instant } } };
const rowMotion: Variants = { closed: { opacity: 0, y: 3 }, open: { opacity: 1, y: 0, transition: { duration: .2, ease: enter } } };

/** A presence mark that morphs between statuses: the color crossfades while a hole opens for away and a bar slides in for busy. */
export function PresenceDot({ status, className }: { status: UserStatus | "offline"; className?: string }) {
  return <span className={[styles.dot, className].filter(Boolean).join(" ")} data-status={status} aria-hidden="true" />;
}

function Portrait({ user }: { user: UserMenuUser }) {
  const [failed, setFailed] = useState<string>();
  if (!user.avatarSrc || failed === user.avatarSrc) {
    const initials = user.name.trim().split(/\s+/).slice(0, 2).map(part => part[0]?.toUpperCase()).join("");
    return <span className={`${styles.portrait} ${styles.initials}`}>{initials}</span>;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- registry 组件用 img，不引入 next/image
    <img className={styles.portrait} src={user.avatarSrc} srcSet={user.avatarSrcSet} alt="" decoding="async" draggable={false} onError={() => setFailed(user.avatarSrc)} />
  );
}

function Face({ user, status, size }: { user: UserMenuUser; status?: UserStatus; size: "sm" | "md" }) {
  return <span className={styles.face} data-size={size}><Portrait user={user} />{status && <PresenceDot status={status} />}</span>;
}

/** Changing text rises out of a small blur while the old text lifts away. */
function Rise({ text, reduced }: { text: string; reduced: boolean }) {
  return <AnimatePresence mode="popLayout" initial={false}>
    <motion.span key={text} className={styles.rise} initial={reduced ? { opacity: 0 } : { opacity: 0, y: "0.35em", filter: `blur(${motionTokens.blur.subtle}px)` }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: "-0.35em", filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: motionTokens.duration.fast, ease: standard } }}
      transition={reduced ? { duration: 0 } : { duration: motionTokens.duration.standard, ease: enter }}>{text}</motion.span>
  </AnimatePresence>;
}

function Keys({ keys }: { keys: string[] }) {
  return <kbd className={styles.keys} aria-hidden="true">{keys.map((key, index) => <kbd key={`${key}-${index}`} className={styles.key}>{key}</kbd>)}</kbd>;
}

/** A compact inline switch. It is one stop in the menu: up and down pass over it, left and right choose within it. */
function Segmented<T extends string>({ label, icon, value, options, onChange, variants }: { label: string; icon: ReactNode; value: T; options: { value: T; label: string; icon: ReactNode }[]; onChange: (value: T) => void; variants?: Variants }) {
  const index = Math.max(0, options.findIndex(option => option.value === value));
  return <motion.div className={styles.row} data-stop="group" data-label={label} variants={variants}>
    <span className={styles.icon} aria-hidden="true">{icon}</span>
    <span className={styles.rowLabel} aria-hidden="true">{label}</span>
    <div className={styles.segments} role="group" aria-label={label} style={{ "--index": index, "--count": options.length } as CSSProperties}>
      <span className={styles.thumb} aria-hidden="true" />
      {options.map(option => <button key={option.value} type="button" role="menuitemradio" tabIndex={-1} aria-checked={option.value === value} aria-label={option.label} title={option.label}
        className={styles.segment} onClick={() => onChange(option.value)}>{option.icon}</button>)}
    </div>
  </motion.div>;
}

const getStops = (root: HTMLElement | null) => Array.from(root?.querySelectorAll<HTMLElement>("[data-stop]") ?? []);
function focusStop(stop: HTMLElement | undefined) {
  if (!stop) return;
  const target = stop.dataset.stop === "group" ? stop.querySelector<HTMLElement>('[aria-checked="true"]') ?? stop.querySelector<HTMLElement>("button") : stop;
  target?.focus({ preventScroll: true });
}

export function UserMenu({ user, status: statusProp, defaultStatus = "available", onStatusChange, theme: themeProp, defaultTheme = "system", onThemeChange, showTheme = true, items = [], onSignOut, signOutKeys, align = "end", showName = false, open: openProp, defaultOpen = false, onOpenChange, portal = true, ref, className }: UserMenuProps) {
  const id = useId();
  const menuId = `${id}-menu`;
  const triggerId = `${id}-trigger`;
  const preferReduced = useArcReduced();
  const hydrated = useSyncExternalStore(subscribeNothing, () => true, () => false);
  const compact = useSyncExternalStore(subscribeCompact, () => window.matchMedia(compactQuery).matches, () => false);
  const [innerOpen, setInnerOpen] = useState(defaultOpen);
  const [innerStatus, setInnerStatus] = useState(defaultStatus);
  const [innerTheme, setInnerTheme] = useState(defaultTheme);
  const [signingOut, setSigningOut] = useState(false);
  const [highlight, setHighlight] = useState<Highlight | null>(null);
  const open = openProp ?? innerOpen;
  const showStatus = statusProp !== undefined || onStatusChange !== undefined;
  const status = statusProp ?? innerStatus;
  const theme = themeProp ?? innerTheme;
  const rootRef = useRef<HTMLSpanElement>(null);
  const arcLive = useAnimationActive(rootRef);
  const reduced = preferReduced || !arcLive;
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const reason = useRef<OpenReason>(null);
  const typed = useRef({ text: "", timer: 0 });
  const mounted = useRef(true);
  const pending = useRef(false);
  const sheet = hydrated && compact;
  const inline = !portal && !sheet;

  useEffect(() => { mounted.current = true; const current = typed.current; return () => { mounted.current = false; window.clearTimeout(current.timer); }; }, []);

  function setTriggerRef(node: HTMLButtonElement | null) {
    triggerRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) (ref as { current: HTMLButtonElement | null }).current = node;
  }

  function setOpen(next: boolean, why: OpenReason = null) {
    reason.current = next ? why : null;
    if (next) setSigningOut(pending.current);
    setHighlight(null);
    setInnerOpen(next);
    onOpenChange?.(next);
  }
  function close(returnFocus: boolean) {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus({ preventScroll: true });
  }

  // Focus moves in only when a person opened the menu, so a menu that starts open never steals focus or scrolls the page.
  useEffect(() => {
    if (!open) return;
    const why = reason.current;
    reason.current = null;
    if (!why) return;
    const frame = requestAnimationFrame(() => {
      const stops = getStops(listRef.current);
      if (why === "first") focusStop(stops[0]);
      else if (why === "last") focusStop(stops.at(-1));
      else surfaceRef.current?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [open, sheet]);

  // The panel is placed against the trigger and scales from the avatar's center, flipping above when there is no room below.
  useLayoutEffect(() => {
    if (!open || sheet) return;
    const place = () => {
      const panel = surfaceRef.current, trigger = triggerRef.current;
      if (!panel || !trigger) return;
      const rect = trigger.getBoundingClientRect();
      const width = panel.offsetWidth, height = panel.offsetHeight;
      let left: number, top: number;
      if (inline) {
        const root = rootRef.current?.getBoundingClientRect();
        left = (root?.left ?? 0) + panel.offsetLeft;
        top = (root?.top ?? 0) + panel.offsetTop;
      } else {
        const wanted = align === "start" ? rect.left : align === "center" ? rect.left + rect.width / 2 - width / 2 : rect.right - width;
        left = Math.min(Math.max(12, wanted), window.innerWidth - width - 12);
        const below = rect.bottom + 8;
        top = below + height > window.innerHeight - 12 && rect.top - 8 - height > 12 ? rect.top - 8 - height : below;
        panel.style.left = `${left}px`;
        panel.style.top = `${top}px`;
      }
      const faceCenter = rect.left + Math.min(rect.width, 40) / 2;
      const originX = align === "end" && rect.width > 40 ? rect.right - 20 - left : faceCenter - left;
      panel.style.setProperty("--origin-x", `${Math.min(Math.max(0, originX), width)}px`);
      panel.style.setProperty("--origin-y", top < rect.top ? `${height}px` : "0px");
    };
    place();
    if (inline) return;
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => { window.removeEventListener("resize", place); window.removeEventListener("scroll", place, true); };
  }, [open, sheet, inline, align]);

  // Outside presses close the panel. The sheet has its own scrim.
  useEffect(() => {
    if (!open || sheet) return;
    const onPointerDown = (event: globalThis.PointerEvent) => {
      const target = event.target as Node;
      if (surfaceRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      reason.current = null;
      setHighlight(null);
      setInnerOpen(false);
      onOpenChange?.(false);
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [open, sheet, onOpenChange]);

  // The page behind the sheet stays put.
  useEffect(() => {
    if (!open || !sheet) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => { root.style.overflow = previous; };
  }, [open, sheet]);

  function changeStatus(value: UserStatus) { setInnerStatus(value); onStatusChange?.(value); }
  function changeTheme(value: ThemePreference) { setInnerTheme(value); onThemeChange?.(value); }

  function signOut() {
    if (pending.current) return;
    const result = onSignOut?.();
    if (!result || typeof result.then !== "function") { close(true); return; }
    // Async sign out keeps the menu open with its progress on the item, then closes once it settles.
    pending.current = true;
    setSigningOut(true);
    const done = () => { pending.current = false; if (mounted.current) close(false); };
    result.then(done, done);
  }

  function onListFocus(event: FocusEvent<HTMLDivElement>) {
    const stop = event.target instanceof HTMLElement ? event.target.closest<HTMLElement>("[data-stop]") : null;
    if (!stop) { setHighlight(null); return; }
    setHighlight(current => ({ top: stop.offsetTop, height: stop.offsetHeight, tone: stop.dataset.tone, glide: current !== null }));
  }

  // Focus follows a mouse or pen, so the keyboard carries on from wherever the pointer left the highlight.
  function onItemPointerMove(event: PointerEvent<HTMLElement>) {
    if (event.pointerType === "touch") return;
    if (document.activeElement !== event.currentTarget) event.currentTarget.focus({ preventScroll: true });
  }
  // The inline switches are not rows, so the pointer over them releases the highlight instead of dragging it along.
  function onListPointerMove(event: PointerEvent<HTMLElement>) {
    if (event.pointerType === "touch" || !highlight) return;
    const group = event.target instanceof HTMLElement ? event.target.closest<HTMLElement>('[data-stop="group"]') : null;
    if (!group || group.contains(document.activeElement)) return;
    setHighlight(null);
    surfaceRef.current?.focus({ preventScroll: true });
  }
  function onListPointerLeave(event: PointerEvent<HTMLElement>) {
    if (event.pointerType === "touch") return;
    setHighlight(null);
    surfaceRef.current?.focus({ preventScroll: true });
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const stops = getStops(listRef.current);
    const active = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const current = active?.closest<HTMLElement>("[data-stop]") ?? null;
    const index = current ? stops.indexOf(current) : -1;
    const step = (to: HTMLElement | undefined) => { event.preventDefault(); focusStop(to); };
    switch (event.key) {
      case "ArrowDown": return step(stops[(index + 1) % stops.length]);
      case "ArrowUp": return step(stops[index <= 0 ? stops.length - 1 : index - 1]);
      case "Home": return step(stops[0]);
      case "End": return step(stops.at(-1));
      case "Escape": case "Tab": event.preventDefault(); return close(true);
      case "ArrowLeft": case "ArrowRight": {
        if (current?.dataset.stop !== "group") return;
        event.preventDefault();
        const segments = Array.from(current.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]'));
        const at = Math.max(0, segments.findIndex(segment => segment.getAttribute("aria-checked") === "true"));
        const next = segments[(at + (event.key === "ArrowRight" ? 1 : -1) + segments.length) % segments.length];
        next?.focus({ preventScroll: true });
        next?.click();
        return;
      }
    }
    if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey || event.key === " ") return;
    // Typeahead: letters jump to the next row whose label starts with what was typed.
    const memory = typed.current;
    window.clearTimeout(memory.timer);
    memory.text += event.key.toLowerCase();
    memory.timer = window.setTimeout(() => { memory.text = ""; }, 500);
    const ordered = [...stops.slice(index + 1), ...stops.slice(0, index + 1)];
    const search = memory.text.length > 1 && current?.dataset.label?.toLowerCase().startsWith(memory.text) ? [current] : ordered;
    const match = search.find(stop => stop.dataset.label?.toLowerCase().startsWith(memory.text));
    if (match) step(match);
  }

  function onTriggerClick(event: MouseEvent<HTMLButtonElement>) {
    if (open) { close(false); return; }
    setOpen(true, event.detail === 0 ? "first" : "pointer");
  }
  function onTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    setOpen(true, event.key === "ArrowDown" ? "first" : "last");
  }

  function onDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.y > 80 || info.velocity.y > 500) close(true);
  }

  const glide: Transition = highlight?.glide && !reduced ? motionTokens.spring.snappy : { duration: 0 };
  const row = reduced ? undefined : rowMotion;
  const menuProps = { id: menuId, role: "menu", "aria-labelledby": triggerId, tabIndex: -1, onKeyDown };

  const content = <>
    <motion.div className={styles.header} variants={row}>
      <Face user={user} status={showStatus ? status : undefined} size="md" />
      <div className={styles.identity}>
        <div className={styles.nameRow}><span className={styles.name}>{user.name}</span>{user.plan && <span className={styles.plan}>{user.plan}</span>}</div>
        <span className={styles.email} title={user.email}>{user.email}</span>
      </div>
    </motion.div>
    <div ref={listRef} className={styles.list} onFocus={onListFocus} onPointerMove={onListPointerMove} onPointerLeave={onListPointerLeave}>
      <motion.span className={styles.highlight} data-tone={highlight?.tone} aria-hidden="true" initial={false}
        animate={highlight ? { y: highlight.top, height: highlight.height, opacity: 1 } : { opacity: 0 }}
        transition={{ default: glide, opacity: { duration: reduced ? 0 : motionTokens.duration.instant } }} />
      {items.length > 0 && <>
        <div className={styles.separator} role="separator" />
        {items.map(item => <motion.button key={item.label} type="button" role="menuitem" tabIndex={-1} className={styles.item} data-stop="item" data-label={item.label} variants={row}
          onPointerMove={onItemPointerMove} onClick={() => { close(true); item.onSelect?.(); }}>
          <span className={styles.icon} aria-hidden="true">{item.icon}</span>
          <span className={styles.itemLabel}>{item.label}</span>
          {item.keys && <Keys keys={item.keys} />}
        </motion.button>)}
      </>}
      {(showTheme || showStatus) && <>
        <div className={styles.separator} role="separator" />
        {showStatus && <Segmented label="Status" icon={<PresenceDot status={status} />} value={status} onChange={changeStatus}
          options={userStatuses.map(option => ({ ...option, icon: <PresenceDot status={option.value} /> }))} variants={row} />}
        {showTheme && <Segmented label="Theme" icon={<SunMoon size={16} strokeWidth={1.75} />} value={theme} onChange={changeTheme} options={themes} variants={row} />}
      </>}
      <div className={styles.separator} role="separator" />
      <motion.button type="button" role="menuitem" tabIndex={-1} className={styles.item} data-stop="item" data-tone="danger" data-label="Sign out" variants={row}
        aria-busy={signingOut || undefined} onPointerMove={onItemPointerMove} onClick={signOut}>
        <span className={styles.icon} aria-hidden="true">{signingOut ? <LoaderCircle className={styles.spinner} size={16} strokeWidth={1.75} /> : <LogOut size={16} strokeWidth={1.75} />}</span>
        <span className={styles.itemLabel}><Rise text={signingOut ? "Signing out" : "Sign out"} reduced={reduced} /></span>
        {signOutKeys && <Keys keys={signOutKeys} />}
      </motion.button>
    </div>
  </>;

  const panel = <AnimatePresence>
    {open && !sheet && <motion.div key="panel" ref={surfaceRef} {...menuProps} className={styles.panel} data-inline={inline || undefined} data-align={align}
      variants={reduced ? stillMotion : panelMotion} initial="closed" animate="open" exit="exit">
      {content}
    </motion.div>}
  </AnimatePresence>;

  const bottomSheet = <AnimatePresence>
    {open && sheet && <motion.div key="scrim" className={styles.scrim} aria-hidden="true" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: reduced ? .1 : .2, ease: standard }} onClick={() => close(true)} />}
    {open && sheet && <motion.div key="sheet" ref={surfaceRef} {...menuProps} className={`${styles.panel} ${styles.sheet}`} aria-modal="true"
      variants={reduced ? stillMotion : sheetMotion} initial="closed" animate="open" exit="exit"
      drag={reduced ? false : "y"} dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: .04, bottom: .9 }} dragMomentum={false} onDragEnd={onDragEnd}>
      <span className={styles.handle} aria-hidden="true" />
      {content}
    </motion.div>}
  </AnimatePresence>;

  return <ArcQuiet.Provider value={!arcLive}><ArcStyle /><span data-slot="user-menu" data-reduced={preferReduced ? "true" : "false"} data-motion={arcLive && !preferReduced ? "on" : "off"}  ref={rootRef} className={styles.root}>
    <button ref={setTriggerRef} id={triggerId} type="button" className={[styles.trigger, className].filter(Boolean).join(" ")} data-state={open ? "open" : "closed"} data-name={showName || undefined}
      aria-haspopup="menu" aria-expanded={open} aria-controls={open ? menuId : undefined} aria-label={`Account menu, ${user.name}${showStatus ? `, ${statusLabel(status)}` : ""}`}
      onClick={onTriggerClick} onKeyDown={onTriggerKeyDown}>
      <Face user={user} status={showStatus ? status : undefined} size="sm" />
      {showName && <><span className={styles.triggerName}>{user.name}</span><ChevronDown className={styles.chevron} size={16} strokeWidth={1.75} aria-hidden="true" /></>}
    </button>
    {sheet ? createPortal(bottomSheet, document.body) : inline ? panel : hydrated ? createPortal(panel, document.body) : null}
  </span></ArcQuiet.Provider>;
}

export default UserMenu;
