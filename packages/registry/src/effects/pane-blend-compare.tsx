"use client"

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

/** Inspired by Photoroom and Azar (via Mobbin), original implementation. */
export interface PaneBlendCompareProps {
  pace?: number
  intensity?: number
  showLabels?: boolean
  className?: string
  onValueChange?: (state: { t: number }) => void
}

const LANE = 320
const STEP = 0.05

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

export function blendFeather(intensity: number) {
  return quantize(0.06 + clamp(intensity, 0, 1) * 0.5)
}

export function blendMask(t: number, feather: number) {
  const left = Math.max(0, t - feather) * 100
  const right = Math.min(1, t + feather) * 100
  return `linear-gradient(90deg, transparent ${left}%, #000 ${right}%)`
}

function capture(event: PointerEvent<HTMLElement>) {
  if (typeof event.currentTarget.setPointerCapture !== "function") return
  try {
    event.currentTarget.setPointerCapture(event.pointerId)
  } catch {
    // jsdom 不一定能捕获指针。
  }
}

export function PaneBlendCompare({
  pace = 1,
  intensity = 0.7,
  showLabels = true,
  className,
  onValueChange,
}: PaneBlendCompareProps) {
  const stageRef = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const gain = clamp(intensity, 0, 1)
  const paceRate = rateOf(pace)
  const feather = blendFeather(gain)
  const ms = reduced ? 0 : Math.round(160 / paceRate)
  const [t, setT] = useState(0.5)
  const [compare, setCompare] = useState(false)
  const [dragging, setDragging] = useState(false)
  const dragRef = useRef(false)
  const tRef = useRef(0.5)
  const onValueRef = useRef(onValueChange)
  const shown = compare ? (t >= 0.5 ? 0 : 1) : t
  const ease = reduced ? "none" : `left ${ms}ms ease, mask-image ${ms}ms ease`

  useEffect(() => {
    onValueRef.current = onValueChange
  }, [onValueChange])

  function commit(value: number) {
    const next = quantize(clamp(value, 0, 1))
    tRef.current = next
    setT(next)
    onValueRef.current?.({ t: next })
  }

  function atFrom(clientX: number) {
    const rect = stageRef.current?.getBoundingClientRect()
    const width = rect && rect.width > 1 ? rect.width : LANE
    const left = rect && rect.width > 1 ? rect.left : 0
    return (clientX - left) / width
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== undefined && event.button !== 0) return
    if ((event.target as HTMLElement).closest("[data-compare-hold]")) return
    dragRef.current = true
    setDragging(true)
    commit(atFrom(event.clientX))
    capture(event)
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return
    commit(atFrom(event.clientX))
  }

  function onPointerUp() {
    if (!dragRef.current) return
    dragRef.current = false
    setDragging(false)
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest("[data-compare-hold]")) return
    if (event.key === "ArrowRight" || event.key === "ArrowUp") commit(tRef.current + STEP)
    else if (event.key === "ArrowLeft" || event.key === "ArrowDown") commit(tRef.current - STEP)
    else if (event.key === "Home") commit(0)
    else if (event.key === "End") commit(1)
    else return
    event.preventDefault()
  }

  const mask = blendMask(shown, feather)

  return (
    <div
      data-slot="pane-blend-compare"
      data-ritual="pane-blend"
      data-blend="soft"
      data-pace={paceRate}
      data-intensity={gain}
      data-feather={feather.toFixed(2)}
      data-t={t.toFixed(2)}
      data-shown={shown.toFixed(2)}
      data-compare={compare ? "on" : "off"}
      data-labels={showLabels ? "on" : "off"}
      data-phase={dragging ? "dragging" : compare ? "compare" : "idle"}
      data-ease={ms}
      data-motion={reduced ? "off" : "on"}
      role="group"
      aria-label="Layout blend"
      onKeyDown={onKeyDown}
      className={cn(
        "w-full max-w-xl rounded-3xl border border-border bg-card p-4 text-card-foreground select-none motion-reduce:transition-none",
        className,
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-foreground">Layout blend</p>
        <p className="text-sm font-medium text-foreground tabular-nums" data-readout="">
          {Math.round(shown * 100)}%
        </p>
      </div>
      <div
        ref={stageRef}
        data-stage=""
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="relative h-56 touch-none overflow-hidden rounded-2xl border border-border bg-background"
      >
        <div data-pane="a" className="absolute inset-0 bg-muted p-4">
          <div className="grid h-full grid-cols-3 gap-2">
            <div className="rounded-xl bg-chart-2" />
            <div className="col-span-2 rounded-xl bg-accent" />
            <div className="col-span-2 rounded-xl bg-chart-3" />
            <div className="rounded-xl bg-chart-1" />
          </div>
          <p className="sr-only">Layout A</p>
        </div>
        <div
          data-pane="b"
          data-mask={mask}
          className="absolute inset-0 bg-card p-4 motion-reduce:transition-none"
          style={{ maskImage: mask, WebkitMaskImage: mask, transition: ease }}
        >
          <div className="grid h-full grid-cols-2 gap-2">
            <div className="rounded-full bg-chart-4" />
            <div className="rounded-full bg-chart-5" />
            <div className="col-span-2 rounded-2xl bg-primary" />
          </div>
          <p className="sr-only">Layout B</p>
        </div>
        {showLabels ? (
          <>
            <span data-label="a" className="absolute top-3 left-3 rounded-full bg-background px-2 py-1 text-xs font-medium text-foreground">
              A
            </span>
            <span data-label="b" className="absolute top-3 right-3 rounded-full bg-background px-2 py-1 text-xs font-medium text-foreground">
              B
            </span>
          </>
        ) : null}
        <div
          data-handle=""
          role="slider"
          aria-label="Blend"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(shown * 100)}
          aria-valuetext={`${Math.round(shown * 100)} percent toward B`}
          tabIndex={0}
          className="absolute inset-y-0 z-10 w-11 -translate-x-1/2 outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
          style={{ left: `${shown * 100}%`, transition: reduced ? "none" : `left ${ms}ms ease` }}
        >
          <span className="absolute inset-y-3 left-1/2 w-1.5 -translate-x-1/2 rounded-full bg-foreground" />
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">Drag the bar. Arrows nudge. Hold Compare.</p>
        <button
          type="button"
          data-compare-hold=""
          aria-pressed={compare}
          onPointerDown={(event) => {
            event.stopPropagation()
            setCompare(true)
          }}
          onPointerUp={() => setCompare(false)}
          onPointerCancel={() => setCompare(false)}
          onPointerLeave={() => setCompare(false)}
          onBlur={() => setCompare(false)}
          onKeyDown={(event) => {
            if (event.key !== " " && event.key !== "Enter") return
            event.preventDefault()
            event.stopPropagation()
            setCompare(true)
          }}
          onKeyUp={(event) => {
            if (event.key !== " " && event.key !== "Enter") return
            setCompare(false)
          }}
          className="min-h-11 rounded-full border border-border bg-background px-3 text-sm font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Compare
        </button>
      </div>
    </div>
  )
}
