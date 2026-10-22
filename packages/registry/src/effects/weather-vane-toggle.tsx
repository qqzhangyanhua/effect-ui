"use client"

// Ported from Framekit UI (MIT, (c) 2026 Framekit UI contributors) — https://github.com/Sid9022/framekit-ui/blob/master/src/components/ui/weather-vane-toggle.tsx

import { useRef, useState } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface WeatherVaneToggleProps {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  id?: string
  color?: string
  angle?: number
  duration?: number
  intensity?: number
  className?: string
  "aria-label"?: string
}

export function WeatherVaneToggle({
  checked,
  defaultChecked = false,
  onCheckedChange,
  disabled,
  id,
  color = "var(--primary)",
  angle = 48,
  duration = 480,
  intensity = 1,
  className,
  ...rest
}: WeatherVaneToggleProps) {
  const rootRef = useRef<HTMLButtonElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef)
  const moving = live && !reduced
  const [uncontrolled, setUncontrolled] = useState(defaultChecked)
  const on = checked ?? uncontrolled
  const gap = Math.max(4, 14 / Math.max(0.4, intensity))

  const toggle = () => {
    if (disabled) return
    const next = !on
    if (checked === undefined) setUncontrolled(next)
    onCheckedChange?.(next)
  }

  return (
    <button
      ref={rootRef}
      id={id}
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      data-motion={moving ? "on" : "off"}
      onClick={toggle}
      className={cn(
        "relative flex h-20 w-28 flex-col items-center justify-center overflow-hidden rounded-2xl border border-border bg-card text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 motion-reduce:transition-none",
        className,
      )}
      style={{
        backgroundImage: on
          ? `repeating-linear-gradient(90deg, color-mix(in oklab, ${color} 35%, var(--muted)) 0 1px, var(--card) 1px ${gap}px)`
          : `repeating-linear-gradient(90deg, var(--border) 0 1px, var(--card) 1px ${gap * 2}px)`,
        transition: reduced || !live ? undefined : `background-image ${duration}ms ease`,
      }}
      {...rest}
    >
      <span aria-hidden className="mb-1 h-8 w-0.5 rounded bg-muted-foreground" />
      <span
        aria-hidden
        className="absolute top-5 text-lg motion-reduce:transition-none"
        style={{
          color,
          transform: `rotate(${on ? angle : -28}deg)`,
          transition: moving ? `transform ${duration}ms cubic-bezier(.34,1.4,.64,1)` : undefined,
        }}
      >
        ➤
      </span>
      <span className="mt-6 font-mono text-[9px] tracking-[0.14em] text-muted-foreground uppercase">{on ? "Breezy" : "Still"}</span>
    </button>
  )
}
