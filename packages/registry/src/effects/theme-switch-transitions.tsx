"use client";

// Ported from Arc Library (MIT, (c) 2026 Elia Kuratli) — https://github.com/kuratlielia/arc-library/blob/main/registry/components/theme-switch/theme-switch.tsx

import { useAnimationActive } from "@/hooks/use-animation-active";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

import { useEffect, useState , createContext, useContext, useRef} from "react";
import { AnimatePresence, motion } from "motion/react";
import { Moon, Sun } from "lucide-react";
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

const styles: Record<string, string> = new Proxy({} as Record<string, string>, { get: (_target, key) => (typeof key === "string" ? "theme-switch-transitions-" + key : "") });

const arcCss = ":where([class^=\"theme-switch-transitions-\"], [class*=\" theme-switch-transitions-\"]) {\n  --surface: var(--background);\n  --surface-raised: var(--popover);\n  --surface-muted: var(--muted);\n  --text-secondary: var(--muted-foreground);\n  --text-muted: var(--muted-foreground);\n  --border-subtle: color-mix(in oklab, var(--border) 65%, var(--background));\n  --border-strong: color-mix(in oklab, var(--foreground) 28%, var(--border));\n  --accent: var(--primary);\n  --accent-strong: var(--primary);\n  --accent-foreground: var(--primary-foreground);\n  --accent-subtle: color-mix(in oklab, var(--primary) 12%, transparent);\n  --danger: var(--destructive);\n  --success: var(--primary);\n  --warning: var(--destructive);\n  --control-on: var(--primary);\n  --control-glyph: var(--primary-foreground);\n  --shadow-resting: 0 1px 2px oklch(0% 0 0 / .035);\n  --shadow-raised: 0 6px 18px oklch(0% 0 0 / .065), 0 1px 3px oklch(0% 0 0 / .035);\n  --shadow-floating: 0 20px 48px oklch(0% 0 0 / .105), 0 3px 10px oklch(0% 0 0 / .045);\n  --radius-control: 1.125rem;\n  --radius-panel: 1.625rem;\n  --radius-surface: 2.125rem;\n  --radius-pill: 9999px;\n  --control-height-sm: 2.25rem;\n  --control-height-md: 2.75rem;\n  --control-height-lg: 3.125rem;\n  --space-1: .25rem; --space-2: .5rem; --space-3: .75rem; --space-4: 1rem;\n  --space-5: 1.25rem; --space-6: 1.5rem; --space-8: 2rem;\n  --text-xs: .75rem; --text-sm: .875rem; --text-base: 1rem;\n  --tracking-body: -.01em; --leading-body: 1.4;\n  --font-body: inherit; --font-display: inherit;\n  --ease-enter: cubic-bezier(.16, 1, .3, 1);\n  --ease-standard: cubic-bezier(.22, 1, .36, 1);\n  --ease-exit: cubic-bezier(.7, 0, .84, 0);\n  --ease-in-out: cubic-bezier(.65, 0, .35, 1);\n  --ease-spring: linear(0, 0.0213, 0.0739, 0.1443, 0.2235, 0.305, 0.3849, 0.4606, 0.5305, 0.594, 0.6508, 0.7011, 0.7452, 0.7836, 0.8168, 0.8454, 0.8699, 0.8907, 0.9084, 0.9234, 0.9361, 0.9467, 0.9557, 0.9632, 0.9694, 0.9747, 0.979, 0.9826, 0.9857, 0.9882, 0.9902, 0.992, 0.9934, 0.9946, 0.9955, 0.9963, 1);\n  --duration-instant: 120ms; --duration-fast: 160ms; --duration-standard: 240ms; --duration-considered: 480ms; --duration-spring: 580ms;\n  --series-1: var(--primary);\n  --series-2: #7128a5;\n  --series-3: #e58f00;\n  --series-4: #009e84;\n  color: var(--foreground);\n}\n.dark :where([class^=\"theme-switch-transitions-\"], [class*=\" theme-switch-transitions-\"]) { --series-1: #55adff; --series-2: #9c37be; --series-3: #e66e00; --series-4: #00a861; }\n@supports (color: oklch(from red clamp(.4, l * sign(max(c - .02, 0)) + .5, .8) c h)) {\n  :where([class^=\"theme-switch-transitions-\"], [class*=\" theme-switch-transitions-\"]) {\n    --series-1: oklch(from var(--accent) calc(l * sign(max(c - .02, 0)) + .58 * (1 - sign(max(c - .02, 0)))) calc(c * sign(max(c - .02, 0)) + .15 * (1 - sign(max(c - .02, 0)))) calc(h * sign(max(c - .02, 0)) + 250 * (1 - sign(max(c - .02, 0)))));\n    --series-2: oklch(from var(--accent) clamp(.45, l * sign(max(c - .02, 0)) + .58 * (1 - sign(max(c - .02, 0))) - 0.25, .76) .19 calc(h * sign(max(c - .02, 0)) + 250 * (1 - sign(max(c - .02, 0))) + 57));\n    --series-3: oklch(from var(--accent) clamp(.45, l * sign(max(c - .02, 0)) + .58 * (1 - sign(max(c - .02, 0))) + 0.14, .76) .18 calc(h * sign(max(c - .02, 0)) + 250 * (1 - sign(max(c - .02, 0))) + 184));\n    --series-4: oklch(from var(--accent) clamp(.45, l * sign(max(c - .02, 0)) + .58 * (1 - sign(max(c - .02, 0))), .76) .21 calc(h * sign(max(c - .02, 0)) + 250 * (1 - sign(max(c - .02, 0))) + 292));\n  }\n  .dark :where([class^=\"theme-switch-transitions-\"], [class*=\" theme-switch-transitions-\"]) {\n    --series-1: oklch(from var(--accent) calc(l * sign(max(c - .02, 0)) + .73 * (1 - sign(max(c - .02, 0)))) calc(c * sign(max(c - .02, 0)) + .15 * (1 - sign(max(c - .02, 0)))) calc(h * sign(max(c - .02, 0)) + 250 * (1 - sign(max(c - .02, 0)))));\n    --series-2: oklch(from var(--accent) clamp(.485, l * sign(max(c - .02, 0)) + .73 * (1 - sign(max(c - .02, 0))) - 0.19, .665) .21 calc(h * sign(max(c - .02, 0)) + 250 * (1 - sign(max(c - .02, 0))) + 66));\n    --series-3: oklch(from var(--accent) clamp(.485, l * sign(max(c - .02, 0)) + .73 * (1 - sign(max(c - .02, 0))) + 0.02, .665) .21 calc(h * sign(max(c - .02, 0)) + 250 * (1 - sign(max(c - .02, 0))) + 175));\n    --series-4: oklch(from var(--accent) clamp(.485, l * sign(max(c - .02, 0)) + .73 * (1 - sign(max(c - .02, 0))) - 0.1, .665) .18 calc(h * sign(max(c - .02, 0)) + 250 * (1 - sign(max(c - .02, 0))) + 270));\n  }\n}\n/* Each transition uses the same library Button, which owns the press scale; this file only animates the icon in place. */\n.theme-switch-transitions-themeSwitch {\n  position: relative;\n  width: auto;\n  padding-inline: var(--space-3);\n}\n.theme-switch-transitions-iconOnly { width: 38px; min-width: 38px; height: 38px; min-height: 38px; border-radius: 12px; padding: 0; }\n@media (hover: hover) and (pointer: fine) {\n  .theme-switch-transitions-themeSwitch:hover:not(:disabled) { border-color: var(--border-strong); }\n  .theme-switch-transitions-iconOnly:hover:not(:disabled) { background: var(--surface-muted); box-shadow: none; }\n}\n.theme-switch-transitions-iconWrap {\n  position: relative;\n  display: inline-grid;\n  width: 20px;\n  height: 20px;\n  flex: 0 0 20px;\n  place-items: center;\n}\n/* The nudge only eases once the switch has settled, so a theme that arrives during hydration lands without motion. */\n.theme-switch-transitions-settled .theme-switch-transitions-iconWrap { transition: transform var(--duration-spring) var(--ease-spring); }\n.theme-switch-transitions-icon { position: absolute; display: grid; width: 18px; height: 18px; place-items: center; }\n.theme-switch-transitions-label { white-space: nowrap; }\n/* Each variant nudges the icon the way its page transition travels, and eases back when the theme returns. */\n.theme-switch-transitions-themeSwitch.theme-switch-transitions-reveal[data-theme=\"dark\"] .theme-switch-transitions-iconWrap { transform: scale(1.08); }\n.theme-switch-transitions-themeSwitch.theme-switch-transitions-eclipse[data-theme=\"dark\"] .theme-switch-transitions-iconWrap { transform: translateX(-2px); }\n.theme-switch-transitions-themeSwitch.theme-switch-transitions-split[data-theme=\"dark\"] .theme-switch-transitions-iconWrap { transform: translateX(1px); }\n.theme-switch-transitions-themeSwitch.theme-switch-transitions-rise[data-theme=\"dark\"] .theme-switch-transitions-iconWrap { transform: translateY(-2px); }\n@media (prefers-reduced-motion: reduce) {\n  .theme-switch-transitions-settled .theme-switch-transitions-iconWrap { transition: none; }\n}\n\n.theme-switch-transitions-themeSwitch { display: inline-flex; min-height: 2.75rem; align-items: center; justify-content: center; gap: var(--space-2); border: 1px solid var(--border); border-radius: var(--radius-control); padding-inline: var(--space-3); background: var(--surface); color: var(--foreground); font: inherit; font-size: var(--text-sm); font-weight: 500; line-height: var(--leading-body); cursor: pointer; }\n.theme-switch-transitions-themeSwitch:active:not(:disabled) { background: var(--surface-muted); }\n.theme-switch-transitions-iconOnly { width: 2.75rem; min-width: 2.75rem; height: 2.75rem; min-height: 2.75rem; }\n\n";

function ArcStyle() {
  return <style>{arcCss}</style>;
}


export type ThemeSwitchVariant = "reveal" | "eclipse" | "split" | "rise";
export type Theme = "light" | "dark";

export interface ThemeSwitchProps {
  theme: Theme;
  variant?: ThemeSwitchVariant;
  onThemeChange: (next: Theme, variant: ThemeSwitchVariant, trigger: HTMLElement) => void;
  label?: string;
  iconOnly?: boolean;
}

/** Rotation and scale ride the spring; opacity and blur tween so the blur never overshoots below zero. */
const iconSpring = { ...motionTokens.spring.snappy, opacity: { duration: motionTokens.duration.fast, ease: motionTokens.ease.enter }, filter: { duration: motionTokens.duration.fast, ease: motionTokens.ease.enter } } as const;
const iconExit = { duration: motionTokens.duration.fast, ease: motionTokens.ease.standard } as const;
const blur = `blur(${motionTokens.blur.subtle}px)`;

/** A stored preference usually reaches the theme prop just after hydration. That correction swaps the icon in place;
 *  only changes after the first painted frames animate, so a page that loads in dark mode never spins its switches. */
function useSettled() {
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    let second = 0;
    const first = requestAnimationFrame(() => { second = requestAnimationFrame(() => setSettled(true)); });
    return () => { cancelAnimationFrame(first); cancelAnimationFrame(second); };
  }, []);
  return settled;
}

/** Both icons turn the same way (clockwise into dark, back out of it), so the swap reads as one rotation rather than two fades. */
function ThemeIcon({ theme, reduced, settled }: { theme: Theme; reduced: boolean; settled: boolean }) {
  const Icon = theme === "light" ? Sun : Moon;
  const angle = theme === "light" ? 30 : -30;
  return (
    <AnimatePresence initial={false} mode="popLayout">
      <motion.span
        key={theme}
        className={styles.icon}
        initial={!settled ? false : reduced ? { opacity: 0 } : { opacity: 0, scale: .7, rotate: angle, filter: blur }}
        animate={{ opacity: 1, scale: 1, rotate: 0, filter: "blur(0px)" }}
        exit={!settled ? { opacity: 0, transition: { duration: 0 } } : reduced ? { opacity: 0, transition: { duration: motionTokens.duration.instant } } : { opacity: 0, scale: .7, rotate: angle, filter: blur, transition: iconExit }}
        transition={reduced ? { duration: motionTokens.duration.instant } : iconSpring}
        aria-hidden="true"
      >
        <Icon size={16} strokeWidth={1.75} />
      </motion.span>
    </AnimatePresence>
  );
}

export function ThemeSwitch({ theme, variant = "reveal", onThemeChange, label, iconOnly = false }: ThemeSwitchProps) {
  const preferReduced = useArcReduced();
  const hostRef = useRef<HTMLButtonElement>(null);
  const arcLive = useAnimationActive(hostRef);
  const reduced = preferReduced || !arcLive;
  const settled = useSettled();
  const next = theme === "light" ? "dark" : "light";
  const classes = [styles.themeSwitch, styles[variant], iconOnly ? styles.iconOnly : "", settled ? styles.settled : ""].join(" ");

  return (
    <ArcQuiet.Provider value={!arcLive}><ArcStyle /><button data-slot="theme-switch-transitions" data-reduced={preferReduced ? "true" : "false"} data-motion={arcLive && !preferReduced ? "on" : "off"} 
      ref={hostRef}
      type="button"
      className={classes}
      data-theme={theme}
      aria-label={label ?? `Switch to ${next} mode`}
      aria-pressed={theme === "dark"}
      onClick={event => onThemeChange(next, variant, event.currentTarget)}
    >
      <span className={styles.iconWrap}><ThemeIcon theme={theme} reduced={reduced} settled={settled} /></span>
      {!iconOnly && <span className={styles.label}>Switch theme</span>}
    </button></ArcQuiet.Provider>
  );
}

export default ThemeSwitch;
