"use client"

// Ported from Cult UI (MIT, (c) 2023 Jordan-Gilliam) — https://github.com/nolly-studio/cult-ui/blob/main/apps/www/registry/default/ui/halo-badge.tsx. Modified for effect-ui.

import { useRef, useState, type HTMLAttributes, type ReactNode } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

type HaloBadgeVariant = "default" | "secondary" | "destructive" | "outline"

const rims = {
  default: {
    primary: "linear-gradient(90deg, #ff0080, #7928ca, #00d4ff, #0070f3)",
    secondary: "linear-gradient(90deg, #ff4d4d, #f9cb28, #ff0080)",
    tertiary: "linear-gradient(90deg, #0070f3, #00d4ff, #7928ca)",
  },
  success: {
    primary: "linear-gradient(90deg, #047857, #059669, #10b981, #14b8a6, #0d9488)",
    secondary: "linear-gradient(90deg, #34d399, #6ee7b7, #2dd4bf, #5eead4)",
    tertiary: "linear-gradient(90deg, #065f46, #047857, #0f766e)",
  },
  destructive: {
    primary: "linear-gradient(90deg, #991b1b, #dc2626, #e11d48, #f43f5e, #be123c)",
    secondary: "linear-gradient(90deg, #fb7185, #fda4af, #f87171, #fecdd3)",
    tertiary: "linear-gradient(90deg, #7f1d1d, #b91c1c, #dc2626)",
  },
} as const

const labels: Record<HaloBadgeVariant, string> = {
  default: "text-primary",
  secondary: "text-muted-foreground",
  destructive: "text-destructive",
  outline: "text-foreground",
}

export interface HaloBadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  children?: ReactNode
  variant?: HaloBadgeVariant
  live?: boolean
  layout?: boolean
  tabularNums?: boolean
  translucent?: boolean
  interactive?: boolean
  pressScale?: boolean
}

export function HaloBadge({
  children,
  className,
  variant = "default",
  live = false,
  layout = true,
  tabularNums = false,
  translucent = true,
  interactive = true,
  pressScale = true,
  ...props
}: HaloBadgeProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const reduced = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const moving = motionOn && !reduced
  const [hovered, setHovered] = useState(false)
  const rim = variant === "destructive" ? rims.destructive : rims.default
  const emphasis = interactive && hovered
  const idle = translucent ? (emphasis ? 0.92 : 0.72) : emphasis ? 0.78 : 0.5
  const text = typeof children === "string" || typeof children === "number" ? String(children) : ""
  const single = tabularNums && !live && text.length === 1
  const multi = tabularNums && !live && text.length > 1
  const fill = translucent
    ? "linear-gradient(to bottom, color-mix(in oklch, var(--card) 82%, transparent), color-mix(in oklch, var(--card) 70%, transparent))"
    : "linear-gradient(to bottom, var(--card), color-mix(in oklch, var(--card) 94%, var(--muted)))"
  const blob = moving
    ? { duration: 6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" as const }
    : { duration: 0 }

  return (
    <span
      {...props}
      ref={ref}
      className={cn("relative inline-flex max-w-full items-center leading-none", className)}
      data-motion={moving ? "on" : "off"}
      data-reduced={reduced ? "true" : "false"}
      data-slot="halo-badge"
      onMouseEnter={(event) => {
        setHovered(true)
        props.onMouseEnter?.(event)
      }}
      onMouseLeave={(event) => {
        setHovered(false)
        props.onMouseLeave?.(event)
      }}
    >
      <motion.span className="inline-flex" layout={layout && moving} transition={{ type: "spring", bounce: 0, duration: moving ? 0.32 : 0 }}>
      {translucent ? (
        <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
          <span
            className="absolute inset-0 blur-2xl"
            style={{
              opacity: reduced ? 0.38 : 0.5,
              background:
                "radial-gradient(90% 70% at 50% 100%, rgba(255,0,128,0.28), rgba(121,40,202,0.12) 48%, transparent 62%)",
            }}
          />
        </span>
      ) : null}
      <span className="relative z-[1] inline-flex rounded-full p-px">
        <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-full" style={{ opacity: idle }}>
          <motion.span
            animate={{ left: moving ? ["-5%", "75%", "-5%"] : "-5%" }}
            className="absolute -bottom-2 h-10 w-28 blur-xl"
            style={{ background: rim.primary }}
            transition={{ ...blob, duration: moving ? 6 : 0 }}
          />
          <motion.span
            animate={{ left: moving ? ["65%", "10%", "65%"] : "65%" }}
            className="absolute -bottom-1.5 h-8 w-20 blur-lg"
            style={{ background: rim.secondary }}
            transition={{ ...blob, duration: moving ? 5 : 0 }}
          />
          <motion.span
            animate={{ left: moving ? ["25%", "55%", "25%"] : "25%" }}
            className="absolute -bottom-1 h-6 w-16 blur-md"
            style={{ background: rim.tertiary }}
            transition={{ ...blob, duration: moving ? 4 : 0 }}
          />
        </span>
        <span
          className={cn(
            "relative z-[1] inline-flex items-center justify-center gap-1 rounded-full border border-border px-2 text-[0.625rem] font-medium leading-none tracking-tight",
            labels[variant],
            single ? "size-5 px-0" : multi ? "h-5 min-w-5 px-1.5" : "h-5 px-2",
            interactive && pressScale && moving && "active:scale-[0.96]",
            translucent && "backdrop-blur-xl",
          )}
          style={{ background: fill }}
        >
          {live ? (
            <motion.span
              animate={moving ? { opacity: [0.35, 1, 0.35] } : { opacity: 1 }}
              aria-hidden
              className="size-1.5 shrink-0 rounded-full bg-current"
              data-part="live"
              transition={moving ? { duration: 1.15, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY } : { duration: 0 }}
            />
          ) : null}
          <span className={cn("inline-flex items-center leading-none", tabularNums && "tabular-nums")}>{children}</span>
        </span>
      </span>
      </motion.span>
    </span>
  )
}
