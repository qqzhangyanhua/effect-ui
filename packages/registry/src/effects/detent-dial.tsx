"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface DetentDialProps {
  steps?: number
  value?: number
  onValueChange?: (value: number) => void
  className?: string
}

function angleOf(event: React.PointerEvent, box: DOMRect) {
  return Math.atan2(event.clientY - (box.top + box.height / 2), event.clientX - (box.left + box.width / 2))
}

function DetentDial({ steps = 12, value, onValueChange, className }: DetentDialProps) {
  const reduced = usePrefersReducedMotion()
  const [internal, setInternal] = React.useState(0)
  const current = value ?? internal
  const hostRef = React.useRef<HTMLDivElement>(null)
  const drag = React.useRef<{ startAngle: number; startValue: number } | null>(null)
  const count = Math.max(steps, 2)

  const commit = (next: number) => {
    const clamped = ((next % count) + count) % count
    if (value === undefined) setInternal(clamped)
    onValueChange?.(clamped)
  }

  return (
    <div className={cn("grid place-items-center gap-3", className)}>
      <div
        ref={hostRef}
        role="slider"
        tabIndex={0}
        aria-valuemin={0}
        aria-valuemax={count - 1}
        aria-valuenow={current}
        aria-label="刻度旋钮"
        className="relative grid size-40 place-items-center rounded-full border bg-card shadow-inner"
        onPointerDown={(event) => {
          const box = hostRef.current?.getBoundingClientRect()
          if (!box) return
          event.currentTarget.setPointerCapture(event.pointerId)
          drag.current = { startAngle: angleOf(event, box), startValue: current }
        }}
        onPointerMove={(event) => {
          const box = hostRef.current?.getBoundingClientRect()
          if (!box || !drag.current) return
          let delta = angleOf(event, box) - drag.current.startAngle
          if (delta > Math.PI) delta -= Math.PI * 2
          if (delta < -Math.PI) delta += Math.PI * 2
          commit(drag.current.startValue + Math.round(delta / ((Math.PI * 2) / count)))
        }}
        onPointerUp={() => {
          drag.current = null
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight" || event.key === "ArrowUp") commit(current + 1)
          if (event.key === "ArrowLeft" || event.key === "ArrowDown") commit(current - 1)
        }}
      >
        {Array.from({ length: count }, (_, index) => (
          <span
            key={index}
            aria-hidden
            className={cn(
              "absolute top-2 h-3 w-0.5 origin-[center_4.25rem] rounded-full",
              index === current ? "bg-primary" : "bg-border",
            )}
            style={{ transform: `rotate(${(index / count) * 360}deg)` }}
          />
        ))}
        <span
          className={cn(
            "absolute size-3 rounded-full bg-primary",
            reduced ? "" : "transition-transform duration-150",
          )}
          style={{ transform: `rotate(${(current / count) * 360}deg) translateY(-3.1rem)` }}
        />
        <span className="font-mono text-lg tabular-nums">{current}</span>
      </div>
      <p className="text-xs text-muted-foreground">拖动吸附到刻度，方向键也可调。</p>
    </div>
  )
}

export { DetentDial }
