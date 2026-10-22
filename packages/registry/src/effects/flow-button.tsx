"use client"

// Ported from Spell UI (MIT, (c) 2025 Spell UI) — https://github.com/xxtomm/spell-ui/blob/main/registry/spell-ui/flow-button.tsx

import { useId, useRef, useState, type ElementType, type PointerEvent, type ReactNode } from "react"
import { Slot } from "@radix-ui/react-slot"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface FlowButtonProps {
  children?: ReactNode
  color?: string
  duration?: number
  size?: number
  intensity?: number
  asChild?: boolean
  className?: string
}

function cssName(id: string) {
  return `flow-${id.replace(/[^a-zA-Z0-9_-]/g, "")}`
}

export function FlowButton({
  children = "Continue",
  color = "var(--primary)",
  duration = 1200,
  size = 36,
  intensity = 1,
  asChild = false,
  className,
}: FlowButtonProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const live = useAnimationActive(rootRef)
  const reduced = usePrefersReducedMotion()
  const [armed, setArmed] = useState(false)
  const animation = cssName(useId())
  const Comp = (asChild ? Slot : "button") as ElementType
  const moving = armed && live && !reduced
  const stroke = Math.max(1, intensity)

  function armFromPointer(event: PointerEvent<HTMLElement>, next: boolean) {
    if (event.pointerType === "touch") return
    setArmed(next)
  }

  return (
    <div ref={rootRef} className="relative inline-flex">
      <style>{`@keyframes ${animation} { to { stroke-dashoffset: -28; } }`}</style>
      <svg viewBox="0 0 200 40" preserveAspectRatio="none" aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full">
        <rect
          x="1.5"
          y="1.5"
          width="197"
          height="37"
          rx="19"
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={`${8 * intensity} ${5 * intensity}`}
          pathLength={100}
          className="motion-reduce:[animation:none]"
          style={{
            opacity: armed ? 1 : 0.72,
            animationName: moving ? animation : "none",
            animationDuration: `${Math.max(200, duration)}ms`,
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
            animationPlayState: moving ? "running" : "paused",
          }}
        />
      </svg>
      <Comp
        type={asChild ? undefined : "button"}
        className={cn(
          "relative inline-flex items-center justify-center rounded-full bg-muted px-4 font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring",
          className,
        )}
        style={{ height: `${size}px`, fontSize: `${Math.max(12, Math.round(size * 0.38))}px` }}
        onFocus={() => setArmed(true)}
        onBlur={() => setArmed(false)}
        onPointerEnter={(event: PointerEvent<HTMLElement>) => armFromPointer(event, true)}
        onPointerLeave={(event: PointerEvent<HTMLElement>) => armFromPointer(event, false)}
        onPointerDown={(event: PointerEvent<HTMLElement>) => {
          if (event.pointerType === "touch") setArmed(true)
        }}
        onPointerUp={(event: PointerEvent<HTMLElement>) => {
          if (event.pointerType === "touch") setArmed(false)
        }}
      >
        {children}
      </Comp>
    </div>
  )
}
