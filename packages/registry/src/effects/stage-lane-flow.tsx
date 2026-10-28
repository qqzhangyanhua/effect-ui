"use client"

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export type StageLanes = "3" | "4"
export type StageName = "Awake" | "REM" | "Light" | "Deep"

export interface StageLaneFlowProps {
  pace?: number
  intensity?: number
  lanes?: StageLanes
  flow?: boolean
  className?: string
  onValueChange?: (t: number) => void
}

const START = 0.3
const CHART = 320

const SCRIPT: readonly { from: number; to: number; stage: StageName }[] = [
  { from: 0, to: 0.08, stage: "Awake" },
  { from: 0.08, to: 0.2, stage: "Light" },
  { from: 0.2, to: 0.36, stage: "Deep" },
  { from: 0.36, to: 0.48, stage: "REM" },
  { from: 0.48, to: 0.6, stage: "Light" },
  { from: 0.6, to: 0.74, stage: "Deep" },
  { from: 0.74, to: 0.86, stage: "REM" },
  { from: 0.86, to: 1, stage: "Light" },
]

const TONE: Record<StageName, string> = {
  Awake: "bg-chart-4",
  REM: "bg-chart-1",
  Light: "bg-chart-2",
  Deep: "bg-chart-3",
}

interface Box {
  left: number
  width: number
}

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function quantize(value: number) {
  return Math.round(clamp(value, 0, 1) * 100) / 100
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

export function stageLanes(lanes: string): StageName[] {
  if (lanes === "3") return ["Awake", "Light", "Deep"]
  return ["Awake", "REM", "Light", "Deep"]
}

function shownStage(stage: StageName, lanes: string): StageName {
  if (lanes === "3" && stage === "REM") return "Light"
  return stage
}

export function stageAt(t: number, lanes: string): StageName {
  const u = clamp(t, 0, 1)
  const found = SCRIPT.find((segment, index) => u >= segment.from && (u < segment.to || index === SCRIPT.length - 1))
  return shownStage(found?.stage ?? "Light", lanes)
}

export function stageShare(stage: string, lanes: string) {
  let total = 0
  for (const segment of SCRIPT) {
    if (shownStage(segment.stage, lanes) === stage) total += segment.to - segment.from
  }
  return Math.round(total * 100)
}

export function stageClock(t: number) {
  const minutes = Math.round(22 * 60 + clamp(t, 0, 1) * 8 * 60) % (24 * 60)
  const hour = Math.floor(minutes / 60)
  const minute = minutes % 60
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
}

export function stageFromPointer(clientX: number, rect: Box) {
  const width = rect.width > 0 ? rect.width : CHART
  const left = rect.width > 0 ? rect.left : 0
  return quantize((clientX - left) / width)
}

function capture(event: PointerEvent<Element>) {
  if (typeof event.currentTarget.setPointerCapture !== "function") return
  try {
    event.currentTarget.setPointerCapture(event.pointerId)
  } catch {
    // jsdom 不一定能捕获指针。
  }
}

export function StageLaneFlow({
  pace = 1,
  intensity = 0.65,
  lanes = "4",
  flow = false,
  className,
  onValueChange,
}: StageLaneFlowProps) {
  const ref = useRef<HTMLDivElement>(null)
  const frame = useRef(0)
  const dragRef = useRef(false)
  const tRef = useRef(START)
  const onValueRef = useRef(onValueChange)
  const liveRef = useRef(false)
  const reducedRef = useRef(false)
  const rateRef = useRef(1)
  const flowRef = useRef(false)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const gain = clamp(intensity, 0, 1)
  const rate = rateOf(pace)
  const names = stageLanes(lanes)
  const flowing = flow && !reduced && live
  const [t, setT] = useState(START)
  const [filter, setFilter] = useState<StageName | null>(null)
  const [shift, setShift] = useState(0)
  const [dragging, setDragging] = useState(false)
  const stage = stageAt(t, lanes)
  const share = stageShare(stage, lanes)
  const clock = stageClock(t)
  const ease = reduced ? 0 : Math.round(160 / rate)
  const phase = dragging ? (reduced ? "idle" : "scrubbing") : "labeled"

  useEffect(() => {
    onValueRef.current = onValueChange
    liveRef.current = live
    reducedRef.current = reduced
    rateRef.current = rate
    flowRef.current = flowing
  }, [onValueChange, live, reduced, rate, flowing])

  function commit(next: number) {
    const value = quantize(next)
    tRef.current = value
    setT(value)
    onValueRef.current?.(value)
  }

  useEffect(() => {
    if (!flowing) {
      window.cancelAnimationFrame(frame.current)
      frame.current = 0
      return
    }
    const tick = () => {
      if (!liveRef.current || reducedRef.current || !flowRef.current) {
        frame.current = 0
        return
      }
      setShift((value) => (value + 2 * rateRef.current) % 48)
      frame.current = window.requestAnimationFrame(tick)
    }
    frame.current = window.requestAnimationFrame(tick)
    return () => {
      window.cancelAnimationFrame(frame.current)
      frame.current = 0
    }
  }, [flowing])

  function read(event: PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    return stageFromPointer(event.clientX, rect)
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== undefined && event.button !== 0) return
    dragRef.current = true
    setDragging(true)
    commit(read(event))
    capture(event)
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return
    commit(read(event))
  }

  function onPointerUp() {
    if (!dragRef.current) return
    dragRef.current = false
    setDragging(false)
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault()
      commit(tRef.current + 0.02)
    } else if (event.key === "ArrowLeft") {
      event.preventDefault()
      commit(tRef.current - 0.02)
    } else if (event.key === "Home") {
      event.preventDefault()
      commit(0)
    } else if (event.key === "End") {
      event.preventDefault()
      commit(1)
    }
  }

  return (
    <div
      ref={ref}
      data-slot="stage-lane-flow"
      data-ritual="stage-lanes"
      data-pace={rate}
      data-intensity={gain}
      data-lanes={names.length}
      data-flow={flowing ? "on" : "off"}
      data-t={quantize(t).toFixed(2)}
      data-stage={stage}
      data-share={share}
      data-time={clock}
      data-filter={filter ?? "none"}
      data-shift={shift}
      data-state={phase}
      data-ease={ease}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      className={cn(
        "w-full max-w-md rounded-3xl border border-border bg-card p-3 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <div className="mb-2 flex items-end justify-between">
        <p className="text-sm text-muted-foreground">Night</p>
        <p role="status" className="text-right text-sm font-semibold text-foreground">
          {stage} · {share}% · {clock}
        </p>
      </div>
      <div
        role="slider"
        aria-label="Sleep stages"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(t * 100)}
        aria-valuetext={`${stage} ${share}%`}
        tabIndex={0}
        data-part="chart"
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="relative touch-none rounded-2xl border border-border bg-muted/40 p-2 outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="flex flex-col gap-1">
          {names.map((name) => (
            <div
              key={name}
              data-lane={name}
              data-dim={filter && filter !== name ? "on" : "off"}
              className="relative h-6"
              style={{ opacity: filter && filter !== name ? 0.25 : 0.45 + gain * 0.55 }}
            >
              {SCRIPT.map((segment) =>
                shownStage(segment.stage, lanes) === name ? (
                  <span
                    key={`${name}-${segment.from}`}
                    data-block
                    data-stage={name}
                    className={cn("absolute top-1 bottom-1 rounded-md", TONE[name])}
                    style={{ left: `${segment.from * 100}%`, width: `${(segment.to - segment.from) * 100}%` }}
                  />
                ) : null,
              )}
            </div>
          ))}
        </div>
        <motion.span
          data-playhead
          className="absolute inset-y-2 w-0.5 bg-foreground motion-reduce:transition-none"
          style={{ left: `${t * 100}%`, transition: reduced ? "none" : `left ${ease}ms linear` }}
        />
        <svg data-part="flow" viewBox="0 0 320 112" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
          <path
            d="M8 20 H300 M8 48 H300 M8 76 H300"
            fill="none"
            stroke="var(--foreground)"
            strokeWidth={1}
            strokeDasharray="6 8"
            strokeDashoffset={shift}
            opacity={0.35}
          />
        </svg>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {names.map((name) => (
          <button
            key={name}
            type="button"
            aria-pressed={filter === name}
            onClick={() => setFilter((current) => (current === name ? null : name))}
            className={cn(
              "inline-flex items-center gap-1 rounded-full border border-border px-2 py-1 text-xs",
              filter === name ? "bg-foreground text-background" : "text-foreground",
            )}
          >
            <span className={cn("size-2 rounded-full", TONE[name])} />
            {name}
          </button>
        ))}
      </div>
      {reduced ? (
        <input
          type="range"
          aria-label="Stage time"
          min={0}
          max={100}
          value={Math.round(t * 100)}
          onChange={(event) => commit(Number(event.target.value) / 100)}
          className="mt-2 w-full"
        />
      ) : null}
    </div>
  )
}
