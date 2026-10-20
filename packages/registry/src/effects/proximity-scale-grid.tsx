"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface ProximityScaleGridProps {
  className?: string
}

type CellShape = "dot" | "square" | "plus"

const SHAPES: CellShape[] = ["dot", "square", "plus"]
const SHAPE_LABEL: Record<CellShape, string> = { dot: "圆点", square: "方块", plus: "加号" }

function mix(from: number, to: number, amount: number) {
  return from + (to - from) * amount
}

function ProximityScaleGrid({ className }: ProximityScaleGridProps) {
  const reduced = usePrefersReducedMotion()
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [shape, setShape] = React.useState<CellShape>("dot")
  const target = React.useRef({ x: -999, y: -999 })
  const current = React.useRef({ x: -999, y: -999 })

  const draw = React.useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const width = Math.max(1, Math.floor(rect.width * dpr))
    const height = Math.max(1, Math.floor(rect.height * dpr))
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width
      canvas.height = height
    }
    const context = canvas.getContext("2d")
    if (!context) return
    context.setTransform(dpr, 0, 0, dpr, 0, 0)
    context.clearRect(0, 0, rect.width, rect.height)
    const cols = 18
    const rows = 9
    const gapX = rect.width / cols
    const gapY = rect.height / rows
    const pointer = reduced ? { x: -9999, y: -9999 } : current.current
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const x = gapX * (col + 0.5)
        const y = gapY * (row + 0.5)
        const distance = Math.hypot(x - pointer.x, y - pointer.y)
        const influence = reduced ? 0 : 1 - Math.min(Math.max((distance - 28) / 140, 0), 1)
        const scale = 0.55 + influence * influence * (3 - 2 * influence) * 1.35
        const hue = mix(222, 168, influence)
        context.fillStyle = `hsl(${hue} 82% ${mix(62, 70, influence)}%)`
        context.save()
        context.translate(x, y)
        context.scale(scale, scale)
        const kind = shape
        if (kind === "dot") {
          context.beginPath()
          context.arc(0, 0, 3.2, 0, Math.PI * 2)
          context.fill()
        } else if (kind === "square") {
          context.fillRect(-3.2, -3.2, 6.4, 6.4)
        } else {
          context.fillRect(-3.4, -1, 6.8, 2)
          context.fillRect(-1, -3.4, 2, 6.8)
        }
        context.restore()
      }
    }
  }, [reduced, shape])

  const wakeRef = React.useRef<() => void>(() => {})

  React.useEffect(() => {
    let frameId = 0
    let active = false
    function step() {
      const from = current.current
      const to = target.current
      const before = Math.hypot(from.x - to.x, from.y - to.y)
      from.x += (to.x - from.x) * 0.18
      from.y += (to.y - from.y) * 0.18
      draw()
      const after = Math.hypot(from.x - to.x, from.y - to.y)
      if (after < 0.35 && before < 0.35) {
        active = false
        return
      }
      frameId = window.requestAnimationFrame(step)
    }
    wakeRef.current = () => {
      if (reduced) {
        draw()
        return
      }
      if (active) return
      active = true
      frameId = window.requestAnimationFrame(step)
    }
    draw()
    return () => window.cancelAnimationFrame(frameId)
  }, [draw, reduced])

  return (
    <div data-slot="proximity-scale-grid" className={cn("w-full space-y-3", className)}>
      <div role="radiogroup" aria-label="格子形状" className="flex gap-2">
        {SHAPES.map((item) => (
          <button
            key={item}
            type="button"
            role="radio"
            aria-checked={shape === item}
            className={cn(
              "rounded-md border px-2 py-1 text-xs outline-none focus-visible:ring-2 focus-visible:ring-primary",
              shape === item && "bg-primary text-primary-foreground",
            )}
            onClick={() => setShape(item)}
          >
            {SHAPE_LABEL[item]}
          </button>
        ))}
      </div>
      <canvas
        ref={canvasRef}
        aria-label="邻近缩放网格。指针附近的格子放大并变色。"
        className="h-72 w-full rounded-xl border bg-slate-950"
        onPointerMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect()
          target.current = { x: event.clientX - rect.left, y: event.clientY - rect.top }
          wakeRef.current()
        }}
        onPointerLeave={() => {
          target.current = { x: -999, y: -999 }
          wakeRef.current()
        }}
      />
    </div>
  )
}

export { ProximityScaleGrid }
