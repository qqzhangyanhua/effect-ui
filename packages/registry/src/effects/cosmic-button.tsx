"use client"

// Ported from Cult UI (MIT, (c) 2023 Jordan-Gilliam) — https://github.com/nolly-studio/cult-ui/blob/main/apps/www/registry/default/ui/cosmic-button.tsx. Modified for effect-ui.

import { useRef, type ButtonHTMLAttributes, type ReactNode } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface CosmicButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  as?: "a" | "button"
  href?: string
  children: ReactNode
}

export function CosmicButton({ as = "a", href, className, children, ...props }: CosmicButtonProps) {
  const ref = useRef<HTMLAnchorElement & HTMLButtonElement>(null)
  const reduced = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const moving = motionOn && !reduced
  const classNames = cn(
    "group/cosmic relative inline-flex min-h-11 min-w-11 items-center justify-center gap-3 rounded-[15px] p-[3px] transition-transform",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#adfa1b] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#0c0912]",
    className,
  )
  const content = (
    <>
      <style>
        {`@keyframes cosmic-button-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes cosmic-button-spin-slow { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
[data-slot="cosmic-button"][data-motion="on"] [data-part="spin"] { animation: cosmic-button-spin 3s linear infinite; }
[data-slot="cosmic-button"][data-motion="on"] [data-part="spin-slow"] { animation: cosmic-button-spin-slow 5s linear infinite; }`}
      </style>
      <span className="absolute inset-0 overflow-hidden rounded-[15px] transition-all duration-300 ease-out group-hover/cosmic:inset-[-3px]">
        <span className="absolute inset-[-200%] bg-[conic-gradient(from_0deg,#adfa1b,#c9ff63,#efffb7,#8cd413,#6f9f19,#92d61b,#adfa1b)] opacity-95" data-part="spin" />
      </span>
      <span className="absolute inset-0 overflow-hidden rounded-[15px] opacity-45 mix-blend-soft-light transition-all duration-300 ease-out group-hover/cosmic:inset-[-3px] dark:opacity-60 dark:mix-blend-overlay">
        <span className="absolute inset-[-200%] bg-[conic-gradient(from_180deg,#efffb7_0%,transparent_30%,#adfa1b_50%,transparent_70%,#7fbf17_100%)]" data-part="spin-slow" />
      </span>
      <span className="relative z-10 flex items-center gap-3 rounded-[12px] bg-muted px-5 py-2.5 text-base font-medium tracking-wide text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.72),inset_0_-1px_0_rgba(15,23,42,0.08),0_1px_1px_rgba(15,23,42,0.08),0_8px_24px_rgba(15,23,42,0.14)] transition-all duration-300 group-hover/cosmic:shadow-[inset_0_1px_0_rgba(255,255,255,0.82),inset_0_-1px_0_rgba(15,23,42,0.12),0_2px_6px_rgba(15,23,42,0.14),0_12px_34px_rgba(15,23,42,0.2)] active:scale-[0.98] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),inset_0_-1px_0_rgba(0,0,0,0.5),0_1px_1px_rgba(0,0,0,0.45),0_10px_28px_rgba(0,0,0,0.35)] dark:group-hover/cosmic:shadow-[inset_0_1px_0_rgba(255,255,255,0.16),inset_0_-1px_0_rgba(0,0,0,0.6),0_2px_6px_rgba(0,0,0,0.55),0_14px_34px_rgba(0,0,0,0.42)]">
        {children}
      </span>
    </>
  )
  if (as === "button") {
    return (
      <button
        {...props}
        ref={ref}
        className={classNames}
        data-motion={moving ? "on" : "off"}
        data-reduced={reduced ? "true" : "false"}
        data-slot="cosmic-button"
        type="button"
      >
        {content}
      </button>
    )
  }
  return (
    <a
      ref={ref}
      className={classNames}
      data-motion={moving ? "on" : "off"}
      data-reduced={reduced ? "true" : "false"}
      data-slot="cosmic-button"
      href={href ?? "#"}
    >
      {content}
    </a>
  )
}
