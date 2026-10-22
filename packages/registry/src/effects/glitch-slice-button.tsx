"use client"

// Ported from Uiverse galaxy（MIT，(c) 2023 Uiverse.io, author namecho）— https://github.com/uiverse-io/galaxy/blob/main/Buttons/namecho_slippery-moth-23.html. Modified for effect-ui.

import { useRef, type ButtonHTMLAttributes, type CSSProperties } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

const CSS = `
[data-slot="glitch-slice-button"] {
  --slice-0: inset(50% 50% 50% 50%);
  --slice-1: inset(80% -6px 0 0);
  --slice-2: inset(50% -6px 30% 0);
  --slice-3: inset(10% -6px 85% 0);
  --slice-4: inset(40% -6px 43% 0);
  --slice-5: inset(80% -6px 5% 0);
}
[data-slot="glitch-slice-button"]::after {
  content: attr(data-label);
  position: absolute;
  inset: 0;
  display: block;
  padding: inherit;
  letter-spacing: inherit;
  line-height: inherit;
  font: inherit;
  color: inherit;
  background: linear-gradient(45deg, transparent 3%, var(--glitch-ghost) 3%, var(--glitch-ghost) 5%, var(--glitch-slice) 5%);
  text-shadow: -3px -3px 0 var(--glitch-accent), 3px 3px 0 var(--glitch-ghost);
  clip-path: var(--slice-0);
  pointer-events: none;
}
[data-slot="glitch-slice-button"][data-motion="on"]:hover::after {
  animation: glitch-slice-button-glitch 1s steps(2, end);
}
@keyframes glitch-slice-button-glitch {
  0% { clip-path: var(--slice-1); transform: translate(-20px, -10px); }
  10% { clip-path: var(--slice-3); transform: translate(10px, 10px); }
  20% { clip-path: var(--slice-1); transform: translate(-10px, 10px); }
  30% { clip-path: var(--slice-3); transform: translate(0, 5px); }
  40% { clip-path: var(--slice-2); transform: translate(-5px, 0); }
  50% { clip-path: var(--slice-3); transform: translate(5px, 0); }
  60% { clip-path: var(--slice-4); transform: translate(5px, 10px); }
  70% { clip-path: var(--slice-2); transform: translate(-10px, 10px); }
  80% { clip-path: var(--slice-5); transform: translate(20px, -10px); }
  90% { clip-path: var(--slice-1); transform: translate(-10px, 0); }
  100% { clip-path: var(--slice-1); transform: translate(0); }
}
`

export interface GlitchSliceButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 切片层文字，与按钮可见文字一致。 */
  label: string
  /** 依次是切片色、错位色、强调色。不传时使用主题色。 */
  colors?: string[]
}

export function GlitchSliceButton({
  label,
  colors,
  className,
  style,
  type = "button",
  children,
  ...props
}: GlitchSliceButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const reduced = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const slice = colors?.[0] ?? "var(--destructive)"
  const ghost = colors?.[1] ?? "var(--primary)"
  const accent = colors?.[2] ?? "var(--accent)"
  const painted = {
    "--glitch-slice": slice,
    "--glitch-ghost": ghost,
    "--glitch-accent": accent,
    ...style,
  } as CSSProperties

  return (
    <button
      {...props}
      ref={ref}
      className={cn(
        "relative cursor-pointer border-0 bg-[linear-gradient(45deg,transparent_5%,var(--glitch-slice)_5%)] px-5 py-4 text-lg tracking-[3px] text-white shadow-[6px_0_0_var(--glitch-ghost)]",
        className,
      )}
      data-label={label}
      data-motion={motionOn && !reduced ? "on" : "off"}
      data-reduced={reduced ? "true" : "false"}
      data-slot="glitch-slice-button"
      style={painted}
      type={type}
    >
      <style>{CSS}</style>
      {children ?? label}
    </button>
  )
}
