"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface WarmTooltipProps {
  content: React.ReactNode
  children: React.ReactElement
  delay?: number
  side?: "top" | "right" | "bottom" | "left"
  glow?: boolean
  intensity?: number
  className?: string
  ref?: React.Ref<HTMLDivElement>
}

const sideClass = {
  top: "bottom-full left-1/2 mb-2 -translate-x-1/2",
  right: "left-full top-1/2 ml-2 -translate-y-1/2",
  bottom: "top-full left-1/2 mt-2 -translate-x-1/2",
  left: "right-full top-1/2 mr-2 -translate-y-1/2",
} as const

function WarmTooltip({
  content,
  children,
  delay = 200,
  side = "top",
  glow = false,
  intensity,
  className,
  ref,
}: WarmTooltipProps) {
  const reduced = usePrefersReducedMotion()
  const showGlow = glow && !reduced
  const glowStrength = intensity === undefined || intensity === 1 ? 1 : intensity
  const [open, setOpen] = React.useState(false)
  const timer = React.useRef<number | null>(null)

  const clearTimer = () => {
    if (timer.current === null) return
    window.clearTimeout(timer.current)
    timer.current = null
  }

  const show = () => {
    clearTimer()
    timer.current = window.setTimeout(() => setOpen(true), reduced ? 0 : delay)
  }

  const hide = () => {
    clearTimer()
    setOpen(false)
  }

  React.useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current)
    },
    [],
  )

  return (
    <div
      ref={ref}
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {open ? (
        <span
          role="tooltip"
          data-glow={showGlow ? "true" : "false"}
          className={cn(
            "absolute z-50 rounded-md border bg-popover px-2 py-1 text-xs text-popover-foreground",
            sideClass[side],
            reduced && "animate-none duration-0",
            showGlow &&
              glowStrength === 1 &&
              "shadow-[0_0_24px_color-mix(in_oklab,var(--primary)_55%,transparent)]",
            className,
          )}
          style={
            showGlow && glowStrength !== 1
              ? {
                  boxShadow: `0 0 ${24 * glowStrength}px color-mix(in oklab, var(--primary) ${Math.round(55 * glowStrength)}%, transparent)`,
                }
              : undefined
          }
        >
          {content}
        </span>
      ) : null}
    </div>
  )
}

export { WarmTooltip }
