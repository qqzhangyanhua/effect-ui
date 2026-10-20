"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface ThumbnailFlowPathProps {
  className?: string
}

const TILES = [
  { id: "a", label: "01", hue: 262 },
  { id: "b", label: "02", hue: 190 },
  { id: "c", label: "03", hue: 24 },
  { id: "d", label: "04", hue: 330 },
  { id: "e", label: "05", hue: 152 },
  { id: "f", label: "06", hue: 48 },
]

const PATH = "M 36 210 C 140 20, 260 20, 340 180 S 560 340, 700 120"

function ThumbnailFlowPath({ className }: ThumbnailFlowPathProps) {
  const reduced = usePrefersReducedMotion()
  const [phase, setPhase] = React.useState<"stack" | "fly" | "grid">(reduced ? "grid" : "stack")
  const done = React.useRef(0)

  React.useEffect(() => {
    if (reduced) return
    const id = window.setTimeout(() => setPhase("fly"), 240)
    return () => window.clearTimeout(id)
  }, [reduced])

  React.useEffect(() => {
    if (phase !== "fly") return
    const id = window.setTimeout(() => setPhase("grid"), 2800)
    return () => window.clearTimeout(id)
  }, [phase])

  const replay = () => {
    if (reduced) {
      setPhase("grid")
      return
    }
    done.current = 0
    setPhase("stack")
    window.setTimeout(() => setPhase("fly"), 40)
  }

  return (
    <div data-slot="thumbnail-flow-path" className={cn("w-full space-y-3", className)}>
      <style>
        {`@keyframes effect-ui-offset-fly { to { offset-distance: 100%; } }`}
      </style>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {phase === "grid" ? "已经落进网格。" : "缩略图沿着 S 形路径飞过。"}
        </p>
        <button
          type="button"
          className="rounded-md border px-3 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
          onClick={replay}
        >
          再飞一次
        </button>
      </div>
      <div className="relative h-80 overflow-hidden rounded-xl border bg-background">
        <div className={cn("h-full", phase === "grid" ? "grid grid-cols-3 gap-3 p-4" : "relative")}>
          {TILES.map((tile, index) => (
            <div
              key={tile.id}
              className={cn(
                "flex items-end rounded-lg p-2 text-sm font-medium text-white",
                phase === "grid" ? "h-24" : "absolute size-16",
              )}
              style={{
                background: `linear-gradient(145deg, hsl(${tile.hue} 55% 34%), hsl(${tile.hue} 72% 54%))`,
                offsetPath: phase === "fly" ? `path("${PATH}")` : undefined,
                offsetRotate: phase === "fly" ? "0deg" : undefined,
                offsetDistance: phase === "fly" ? "0%" : undefined,
                animation: phase === "fly" && !reduced ? `effect-ui-offset-fly 1.35s ease-in-out ${index * 0.12}s forwards` : undefined,
                left: phase === "stack" ? 24 + index * 10 : undefined,
                top: phase === "stack" ? 28 + index * 8 : undefined,
              }}
              onAnimationEnd={() => {
                done.current += 1
                if (done.current >= TILES.length) setPhase("grid")
              }}
            >
              {tile.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export { ThumbnailFlowPath }
