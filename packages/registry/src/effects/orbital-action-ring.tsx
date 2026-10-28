"use client"

import { useRef, useState, type KeyboardEvent } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface OrbitalAction {
  id: string
  label: string
}

export interface OrbitalActionRingProps {
  radius?: number
  pace?: number
  count?: number
  actions?: readonly OrbitalAction[]
  className?: string
  onAction?: (id: string) => void
}

const builtIn: readonly OrbitalAction[] = [
  { id: "confirm", label: "确认" },
  { id: "delete", label: "删除" },
  { id: "refresh", label: "刷新" },
  { id: "swap", label: "替换" },
  { id: "pin", label: "固定" },
]

type Phase = "idle" | "open" | "actioned" | "closed"

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

function countOf(count: number) {
  if (!Number.isFinite(count)) return 3
  return Math.min(5, Math.max(3, Math.round(count)))
}

function radiusOf(radius: number) {
  if (!Number.isFinite(radius)) return 92
  return clamp(radius, 64, 160)
}

function polar(index: number, total: number, radius: number) {
  const angle = -Math.PI / 2 + (index / total) * Math.PI * 2
  return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius }
}

export function OrbitalActionRing({
  radius = 92,
  pace = 1,
  count = 3,
  actions = builtIn,
  className,
  onAction,
}: OrbitalActionRingProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const locked = useRef(false)
  const reach = radiusOf(radius)
  const ms = Math.round(420 / rateOf(pace))
  const pool = actions.length > 0 ? actions : builtIn
  const shown = pool.slice(0, Math.min(pool.length, countOf(count)))
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>("idle")
  const showActions = reduced || phase === "open"
  const box = reach * 2 + 36
  const center = box / 2
  const safeIndex = shown.length === 0 ? 0 : index % shown.length

  function openRing() {
    locked.current = false
    setIndex(0)
    setPhase("open")
  }

  function closeRing() {
    locked.current = false
    setPhase("closed")
  }

  function trigger(id: string) {
    if (!reduced && locked.current) return
    if (!reduced) locked.current = true
    onAction?.(id)
    if (!reduced) setPhase("actioned")
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault()
      closeRing()
      return
    }
    const available = reduced || phase === "open"
    if (!available || shown.length === 0) return
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault()
      const delta = event.key === "ArrowRight" ? 1 : -1
      const next = (safeIndex + delta + shown.length) % shown.length
      setIndex(next)
      const id = shown[next]?.id
      ref.current?.querySelector<HTMLButtonElement>(`[data-action="${id}"]`)?.focus()
      return
    }
    if (event.key === "Enter") {
      if ((event.target as HTMLElement).dataset.action) return
      const id = shown[safeIndex]?.id
      if (!id) return
      event.preventDefault()
      trigger(id)
    }
  }

  return (
    <div
      ref={ref}
      data-slot="orbital-action-ring"
      data-radius={reach}
      data-pace={Number.isFinite(pace) ? pace : 1}
      data-count={shown.length}
      data-motion={reduced ? "off" : "on"}
      data-layout={reduced ? "list" : "ring"}
      data-state={phase === "idle" && reduced ? "open" : phase}
      data-index={safeIndex}
      data-open={showActions ? "true" : "false"}
      tabIndex={0}
      onKeyDown={onKeyDown}
      className={cn(
        "relative mx-auto w-full max-w-md rounded-3xl border border-border bg-background p-6 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
        reduced ? "min-h-0" : "min-h-80",
        className,
      )}
    >
      <button
        type="button"
        data-anchor=""
        aria-label="动作锚点"
        aria-expanded={showActions}
        onClick={() => {
          if (reduced) return
          if (phase === "open") closeRing()
          else openRing()
        }}
        className="relative z-10 mx-auto grid size-16 place-items-center rounded-full bg-primary text-sm text-primary-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        锚点
      </button>
      {!reduced && phase === "open" ? (
        <svg
          data-ring=""
          aria-hidden
          width={box}
          height={box}
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-border"
        >
          <circle cx={center} cy={center} r={reach} fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="5 7" />
        </svg>
      ) : null}
      {showActions ? (
        <div className={cn(reduced ? "mt-4 flex flex-col gap-2" : "contents")} data-actions="">
          {shown.map((action, actionIndex) => {
            const point = polar(actionIndex, shown.length, reach)
            const current = actionIndex === safeIndex
            return (
              <button
                key={action.id}
                type="button"
                data-action={action.id}
                aria-label={action.label}
                aria-current={current ? "true" : undefined}
                onClick={(event) => {
                  event.stopPropagation()
                  trigger(action.id)
                }}
                style={
                  reduced
                    ? { transition: "none" }
                    : {
                        position: "absolute",
                        left: "50%",
                        top: "50%",
                        zIndex: 20,
                        transform: `translate(-50%, -50%) translate(${point.x.toFixed(1)}px, ${point.y.toFixed(1)}px) scale(${current ? 1.08 : 1})`,
                        transition: `transform ${ms}ms cubic-bezier(0.18, 1.25, 0.4, 1)`,
                      }
                }
                className={cn(
                  "rounded-full border border-border bg-card px-4 py-2 text-sm text-card-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
                  action.id === "delete" && "text-destructive",
                  reduced && "w-full text-left",
                )}
              >
                {action.label}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
