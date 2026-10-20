"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"
import { MarqueeAlongSvgPath } from "./marquee-along-svg-path"

export interface CurvedLoopProps {
  text?: string
  className?: string
}

const ARC = "M 24 148 Q 270 8 516 148"

function CurvedLoop({ text = "CURVED LOOP · ", className }: CurvedLoopProps) {
  const reduced = usePrefersReducedMotion()
  const [velocity, setVelocity] = React.useState(12)
  const drag = React.useRef<{ x: number } | null>(null)

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
          setVelocity((current) => Math.max(-28, Math.min(28, current + dx * 0.12)))
        }}
        onPointerUp={() => {
          drag.current = null
        }}
        onPointerCancel={() => {
          drag.current = null
        }}
      >
        <MarqueeAlongSvgPath
          path={ARC}
          viewBox="0 0 540 180"
          baseVelocity={reduced ? 0 : velocity}
          repeat={8}
          showPath={false}
          className="min-h-48"
        >
          <span className="font-display text-4xl whitespace-nowrap sm:text-5xl">{text}</span>
        </MarqueeAlongSvgPath>
      </div>
      <p className="text-center text-xs text-muted-foreground">
        {reduced ? "已减弱动效，文字停在弧线上" : `左右拖动改变方向 · ${velocity > 0 ? "→" : "←"} ${Math.abs(velocity).toFixed(0)}`}
      </p>
    </div>
  )
}

export { CurvedLoop }
