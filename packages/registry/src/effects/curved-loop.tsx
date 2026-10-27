"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { textStyle } from "@/lib/text-style"
import { cn } from "@/lib/cn"

export interface CurvedLoopProps {
  text?: string
  className?: string
  /** 沿弧线的速度倍率。不传时起始速度仍是 12。 */
  speed?: number
  fontSize?: number
  fontWeight?: number
  letterSpacing?: number
  align?: "left" | "center" | "right"
}

const ARC = "M 24 148 Q 270 8 516 148"

function CurvedLoop({
  text = "CURVED LOOP · ",
  className,
  speed,
  fontSize,
  fontWeight,
  letterSpacing,
  align,
}: CurvedLoopProps) {
  const reduced = usePrefersReducedMotion()
  const pathId = React.useId().replace(/:/g, "")
  const base = speed === undefined || !Number.isFinite(speed) ? 12 : 12 * speed
  const [dragged, setDragged] = React.useState<{ base: number; velocity: number } | null>(null)
  const velocity = dragged !== null && dragged.base === base ? dragged.velocity : base
  const drag = React.useRef<{ x: number } | null>(null)
  const motionSpeed = reduced ? 0 : velocity
  const seconds = motionSpeed === 0 ? 0 : Math.max(2, 36 / Math.abs(motionSpeed))
  const forward = motionSpeed >= 0

  return (
    <div data-slot="curved-loop" className={cn("w-full", className)}>
      <div
        className="cursor-ew-resize touch-none"
        onPointerDown={(event) => {
          drag.current = { x: event.clientX }
          event.currentTarget.setPointerCapture(event.pointerId)
        }}
        onPointerMove={(event) => {
          const previous = drag.current
          if (!previous || reduced) return
          const dx = event.clientX - previous.x
          drag.current = { x: event.clientX }
          setDragged((current) => {
            const start = current !== null && current.base === base ? current.velocity : base
            return { base, velocity: Math.max(-28, Math.min(28, start + dx * 0.12)) }
          })
        }}
        onPointerUp={() => {
          drag.current = null
        }}
        onPointerCancel={() => {
          drag.current = null
        }}
      >
        <svg viewBox="0 0 540 180" className="min-h-48 w-full" role="img" aria-label={text}>
          <defs>
            <path id={pathId} d={ARC} fill="none" />
          </defs>
          <text
            className="fill-current font-display text-4xl sm:text-5xl"
            style={textStyle(undefined, fontSize, fontWeight, letterSpacing, align)}
          >
            <textPath href={`#${pathId}`}>
              {text.repeat(4)}
              {seconds > 0 ? (
                <animate
                  attributeName="startOffset"
                  from={forward ? "0%" : "-100%"}
                  to={forward ? "-100%" : "0%"}
                  dur={`${seconds}s`}
                  repeatCount="indefinite"
                />
              ) : null}
            </textPath>
          </text>
        </svg>
      </div>
      <p className="text-center text-xs text-muted-foreground">
        {reduced ? "已减弱动效，文字停在弧线上" : `左右拖动改变方向 · ${velocity > 0 ? "→" : "←"} ${Math.abs(velocity).toFixed(0)}`}
      </p>
    </div>
  )
}

export { CurvedLoop }
