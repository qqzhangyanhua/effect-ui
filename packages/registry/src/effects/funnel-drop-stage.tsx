"use client"

import { useEffect, useRef, useState, type KeyboardEvent } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

/** Inspired by Squarespace and Monarch (via Mobbin), original implementation. */
export interface FunnelDropStageProps {
  pace?: number
  intensity?: number
  showDrop?: boolean
  className?: string
  onValueChange?: (state: { activeIndex: number }) => void
}

export interface FunnelStage {
  id: string
  label: string
  count: number
}

export const FUNNEL_STAGES: readonly FunnelStage[] = [
  { id: "visits", label: "Visits", count: 1280 },
  { id: "viewed", label: "Viewed", count: 860 },
  { id: "cart", label: "Cart", count: 340 },
  { id: "buy", label: "Buy", count: 120 },
]

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function quantize(value: number) {
  return Math.round(value * 100) / 100
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

export function funnelDropRatio(index: number, stages: readonly FunnelStage[] = FUNNEL_STAGES) {
  if (index <= 0) return 0
  const prev = stages[index - 1]?.count ?? 0
  const curr = stages[index]?.count ?? 0
  if (prev <= 0) return 0
  return clamp((prev - curr) / prev, 0, 1)
}

export function funnelDropPercent(index: number, stages: readonly FunnelStage[] = FUNNEL_STAGES) {
  return Math.round(funnelDropRatio(index, stages) * 100)
}

export function funnelWidth(count: number, max: number, intensity: number) {
  const raw = max <= 0 ? 1 : count / max
  const gain = clamp(intensity, 0, 1)
  const flat = 0.92
  const steep = 0.46 + 0.54 * raw
  return quantize(flat * (1 - gain) + steep * gain)
}

export function FunnelDropStage({
  pace = 1,
  intensity = 0.7,
  showDrop = true,
  className,
  onValueChange,
}: FunnelDropStageProps) {
  const reduced = usePrefersReducedMotion()
  const gain = clamp(intensity, 0, 1)
  const paceRate = rateOf(pace)
  const ms = reduced ? 0 : Math.round(220 / paceRate)
  const max = Math.max(...FUNNEL_STAGES.map((stage) => stage.count))
  const [index, setIndex] = useState(0)
  const [locked, setLocked] = useState<number | null>(null)
  const indexRef = useRef(0)
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([])
  const onValueRef = useRef(onValueChange)
  const safe = clamp(index, 0, FUNNEL_STAGES.length - 1)
  const stage = FUNNEL_STAGES[safe] ?? FUNNEL_STAGES[0]
  const drop = funnelDropPercent(safe)

  useEffect(() => {
    onValueRef.current = onValueChange
  }, [onValueChange])

  function go(next: number) {
    const value = clamp(next, 0, FUNNEL_STAGES.length - 1)
    indexRef.current = value
    setIndex(value)
    buttonRefs.current[value]?.focus()
    onValueRef.current?.({ activeIndex: value })
  }

  function choose(next: number) {
    go(next)
    setLocked(clamp(next, 0, FUNNEL_STAGES.length - 1))
  }

  function focusedStage(event: KeyboardEvent<HTMLDivElement>) {
    const target = event.target
    if (!(target instanceof Element)) return indexRef.current
    const id = target.closest("[data-stage]")?.getAttribute("data-stage")
    const found = FUNNEL_STAGES.findIndex((item) => item.id === id)
    return found >= 0 ? found : indexRef.current
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const current = focusedStage(event)
    if (event.key === "ArrowDown" || event.key === "ArrowRight") go(current + 1)
    else if (event.key === "ArrowUp" || event.key === "ArrowLeft") go(current - 1)
    else if (event.key === "Home") go(0)
    else if (event.key === "End") go(FUNNEL_STAGES.length - 1)
    else if (event.key === "Enter") {
      indexRef.current = current
      setIndex(current)
      setLocked(current)
      onValueRef.current?.({ activeIndex: current })
    } else return
    event.preventDefault()
  }

  if (!stage) return null

  return (
    <div
      data-slot="funnel-drop-stage"
      data-ritual="funnel-drop"
      data-pace={paceRate}
      data-intensity={gain}
      data-active={safe}
      data-locked={locked === null ? "off" : String(locked)}
      data-drop={showDrop ? "on" : "off"}
      data-drop-value={drop}
      data-ease={ms}
      data-motion={reduced ? "off" : "on"}
      role="group"
      aria-label="Funnel stages"
      onKeyDown={onKeyDown}
      className={cn(
        "w-full max-w-xl rounded-3xl border border-border bg-card p-4 text-card-foreground select-none motion-reduce:transition-none",
        className,
      )}
    >
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-foreground">Funnel</p>
          <p className="text-xs text-muted-foreground">Visits to Buy</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold text-foreground tabular-nums" data-count="">
            {stage.count}
          </p>
          {showDrop ? (
            <p className="text-sm text-foreground">{safe === 0 ? "First stage" : `${drop}% drop`}</p>
          ) : (
            <p className="text-sm text-muted-foreground">Counts only</p>
          )}
        </div>
      </div>
      <div className="flex flex-col items-center gap-0">
        {FUNNEL_STAGES.map((item, itemIndex) => {
          const width = funnelWidth(item.count, max, gain)
          const prev = itemIndex > 0 ? funnelWidth(FUNNEL_STAGES[itemIndex - 1]?.count ?? item.count, max, gain) : width
          const active = itemIndex === safe
          return (
            <div key={item.id} className="flex w-full flex-col items-center">
              {itemIndex > 0 ? (
                <div
                  data-bridge={itemIndex}
                  data-emphasis={active ? "on" : "off"}
                  className={cn("my-1 h-2 rounded-sm motion-reduce:transition-none", active ? "bg-primary" : "bg-border")}
                  style={{
                    width: `${Math.min(prev, width) * 100}%`,
                    transition: reduced ? "none" : `width ${ms}ms ease, background-color ${ms}ms ease`,
                  }}
                />
              ) : null}
              <button
                ref={(node) => {
                  buttonRefs.current[itemIndex] = node
                }}
                type="button"
                data-stage={item.id}
                data-width={width.toFixed(2)}
                aria-pressed={active}
                onClick={() => choose(itemIndex)}
                className={cn(
                  "min-h-11 rounded-xl px-3 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
                  active ? "bg-primary text-primary-foreground" : "border border-border bg-muted text-foreground",
                )}
                style={{
                  width: `${width * 100}%`,
                  transition: reduced ? "none" : `width ${ms}ms ease, background-color ${ms}ms ease`,
                }}
              >
                {item.label}
              </button>
            </div>
          )
        })}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">Choose a stage. Arrows move. Enter locks.</p>
      <p className="sr-only" aria-live="polite">
        {stage.label} {stage.count}
        {showDrop && safe > 0 ? `, ${drop}% drop` : ""}
      </p>
    </div>
  )
}
