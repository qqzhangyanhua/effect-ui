"use client"

import { useId, useRef, useState, type KeyboardEvent } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface RadialHotspot {
  id: string
  title: string
  detail: string
}

export interface RadialHotspotLabelsProps {
  spread?: number
  duration?: number
  lineOpacity?: number
  hotspots?: readonly RadialHotspot[]
  className?: string
  onOpenChange?: (id: string | null) => void
}

const builtIn: readonly RadialHotspot[] = [
  { id: "core", title: "核心", detail: "中间这一块先被看见，标签只负责说明它。" },
  { id: "orbit", title: "轨道", detail: "说明沿着半径散开，不盖住中心。" },
  { id: "signal", title: "信号", detail: "连线表示关系。点开才展开这段话。" },
  { id: "edge", title: "边缘", detail: "触屏和鼠标都要点一下，悬停不会自己展开。" },
  { id: "field", title: "场域", detail: "方向键在标签之间移动，Esc 收起说明。" },
]

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function place(index: number, count: number, spread: number) {
  const turn = -Math.PI / 2 + (index / count) * Math.PI * 2
  const radius = 31 * spread
  return {
    x: 50 + Math.cos(turn) * radius,
    y: 50 + Math.sin(turn) * radius,
  }
}

export function RadialHotspotLabels({
  spread = 1,
  duration = 420,
  lineOpacity = 0.55,
  hotspots = builtIn,
  className,
  onOpenChange,
}: RadialHotspotLabelsProps) {
  const reduced = usePrefersReducedMotion()
  const rootRef = useRef<HTMLDivElement>(null)
  const baseId = useId()
  const [open, setOpen] = useState<string | null>(null)
  const items = hotspots.length > 0 ? hotspots : builtIn
  const reach = clamp(spread, 0.7, 1.3)
  const ms = Math.round(clamp(duration, 160, 900))
  const ink = clamp(lineOpacity, 0.1, 1)

  function select(id: string | null) {
    setOpen(id)
    onOpenChange?.(id)
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === "Escape") {
      event.preventDefault()
      select(null)
      return
    }
    const forward = event.key === "ArrowRight" || event.key === "ArrowDown"
    const backward = event.key === "ArrowLeft" || event.key === "ArrowUp"
    if (!forward && !backward) return
    event.preventDefault()
    const next = (index + (forward ? 1 : -1) + items.length) % items.length
    const target = rootRef.current?.querySelector<HTMLButtonElement>(`[data-hotspot="${items[next]?.id}"]`)
    target?.focus()
  }

  return (
    <div
      data-slot="radial-hotspot-labels"
      data-spread={reach}
      data-duration={ms}
      data-line-opacity={ink}
      data-motion={reduced ? "off" : "on"}
      data-open={open ?? ""}
      ref={rootRef}
      className={cn("relative mx-auto aspect-square w-full max-w-xl motion-reduce:transition-none", className)}
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 size-full" aria-hidden>
        {items.map((item, index) => {
          const point = place(index, items.length, reach)
          const active = open === item.id
          return (
            <line
              key={item.id}
              x1="50"
              y1="50"
              x2={point.x}
              y2={point.y}
              stroke="var(--primary)"
              strokeWidth={active ? 0.7 : 0.35}
              strokeOpacity={active ? 1 : ink}
              style={{ transitionDuration: reduced ? "0ms" : `${ms}ms` }}
              className="transition-[stroke-width,stroke-opacity] motion-reduce:transition-none"
            />
          )
        })}
      </svg>
      <div className="absolute top-1/2 left-1/2 z-10 grid size-24 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-border bg-card text-card-foreground shadow-sm">
        <h2 className="font-display text-lg tracking-tight">焦点</h2>
      </div>
      {items.map((item, index) => {
        const point = place(index, items.length, reach)
        const expanded = open === item.id
        const panelId = `${baseId}-${item.id}`
        return (
          <div
            key={item.id}
            className="absolute z-10"
            style={{ left: `${point.x}%`, top: `${point.y}%`, transform: "translate(-50%, -50%)" }}
          >
            <button
              type="button"
              data-hotspot={item.id}
              aria-expanded={expanded}
              aria-controls={panelId}
              onClick={() => select(expanded ? null : item.id)}
              onKeyDown={(event) => onKeyDown(event, index)}
              className={cn(
                "rounded-full border border-border bg-background px-3 py-1.5 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring",
                expanded && "border-primary bg-primary text-primary-foreground",
              )}
            >
              {item.title}
            </button>
            {expanded ? (
              <div
                id={panelId}
                role="region"
                aria-label={item.title}
                style={{ transitionDuration: reduced ? "0ms" : `${ms}ms` }}
                className="absolute top-full left-1/2 z-20 mt-2 w-44 -translate-x-1/2 rounded-xl border border-border bg-popover p-3 text-left text-sm text-popover-foreground shadow-sm motion-reduce:transition-none"
              >
                {item.detail}
              </div>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
