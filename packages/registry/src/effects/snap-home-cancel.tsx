"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

/**
 * Inspired by Spotify, Acorns, Beli, and Weverse (via Mobbin), original implementation.
 * https://mobbin.com/screens/e0486c16-d841-442f-8172-e020cf712e19
 * https://mobbin.com/flows/b458d01d-3bf1-4489-a17c-f9902cb42bc0
 * https://mobbin.com/screens/e9c035fc-58e0-4747-9e92-57e1e1940ada
 * https://mobbin.com/flows/65e7bf52-fd2d-4ead-b2a5-898f15ecc374
 */

export interface SnapHomeCancelProps {
  pace?: number
  intensity?: number
  style?: SnapStyle
  origin?: OriginKind
  className?: string
  onValueChange?: (state: { phase: SnapPhase }) => void
}

export type SnapStyle = "snap" | "fade"
export type OriginKind = "slot" | "lift"
export type SnapPhase = "empty" | "rest" | "dragging" | "returning" | "placed"

interface Row {
  id: string
  label: string
}

interface Flight {
  progress: number
  still: boolean
}

const SEED: readonly Row[] = [
  { id: "a", label: "Item A" },
  { id: "b", label: "Item B" },
  { id: "c", label: "Item C" },
  { id: "d", label: "Item D" },
]

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function paceRate(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

function easeOut(progress: number) {
  const t = clamp(progress, 0, 1)
  return 1 - (1 - t) * (1 - t)
}

function cloneRows() {
  return SEED.map((row) => ({ ...row }))
}

export function awayShift(intensity: number) {
  return Math.round((16 + clamp(intensity, 0, 1) * 32) * 10) / 10
}

export function returnStep(pace: number) {
  const frames = clamp(14 / paceRate(pace), 8, 20)
  return Math.round((1 / frames) * 1000) / 1000
}

export function returnShift(progress: number, intensity: number, style: SnapStyle, still: boolean) {
  if (still || style === "fade") return 0
  return Math.round((1 - easeOut(progress)) * awayShift(intensity) * 10) / 10
}

export function returnOpacity(progress: number, style: SnapStyle, still: boolean) {
  if (still) return 0
  if (style === "snap") return 0.9
  return Math.round((1 - clamp(progress, 0, 1)) * 1000) / 1000
}

export function SnapHomeCancel({
  pace = 1,
  intensity = 0.36,
  style = "snap",
  origin = "slot",
  className,
  onValueChange,
}: SnapHomeCancelProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const raf = useRef(0)
  const gen = useRef(0)
  const homeRef = useRef<string | null>(null)
  const rowsRef = useRef(new Map<string, HTMLButtonElement>())
  const onValueRef = useRef(onValueChange)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef)
  const [rows, setRows] = useState<Row[]>(cloneRows)
  const [empty, setEmpty] = useState(false)
  const [homeId, setHomeId] = useState<string | null>(null)
  const [flight, setFlight] = useState<Flight | null>(null)
  const [phase, setPhase] = useState<SnapPhase>("rest")
  const shownPhase: SnapPhase = empty && phase !== "dragging" && phase !== "returning" ? "empty" : phase

  if (!live && (phase === "dragging" || phase === "returning")) {
    setPhase(empty ? "empty" : "rest")
    setFlight(null)
    setHomeId(null)
  }

  useEffect(() => {
    onValueRef.current = onValueChange
  }, [onValueChange])

  useEffect(() => {
    onValueRef.current?.({ phase: shownPhase })
  }, [shownPhase])

  useEffect(() => {
    return () => {
      gen.current += 1
      cancelAnimationFrame(raf.current)
    }
  }, [])

  useEffect(() => {
    if (live && !reduced) return
    gen.current += 1
    cancelAnimationFrame(raf.current)
  }, [live, reduced])

  function stop() {
    gen.current += 1
    cancelAnimationFrame(raf.current)
  }

  function focusHome(id: string | null) {
    if (!id) return
    rowsRef.current.get(id)?.focus()
  }

  function finishHome(id: string | null) {
    stop()
    homeRef.current = null
    setHomeId(null)
    setFlight(null)
    setPhase(empty ? "empty" : "rest")
    focusHome(id)
  }

  function start() {
    if (empty) return
    const id = rows.some((row) => row.id === "b") ? "b" : rows[0]?.id
    if (!id) return
    stop()
    homeRef.current = id
    setHomeId(id)
    setPhase("dragging")
    setFlight({ progress: 0, still: reduced || !live })
  }

  function cancel() {
    const id = homeRef.current
    if (!id || (phase !== "dragging" && phase !== "returning")) return
    if (reduced || !live) {
      finishHome(id)
      return
    }
    stop()
    const token = gen.current
    const step = returnStep(pace)
    let progress = 0
    setPhase("returning")
    setFlight({ progress: 0, still: false })
    const tick = () => {
      if (token !== gen.current) return
      progress = Math.min(1, Math.round((progress + step) * 1000) / 1000)
      if (progress >= 1) {
        finishHome(id)
        return
      }
      setFlight({ progress, still: false })
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
  }

  useEffect(() => {
    if (phase !== "dragging" && phase !== "returning") return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      event.preventDefault()
      cancel()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  })

  function place() {
    const id = homeRef.current
    if (!id || empty) return
    const nextIds = rows.map((row) => row.id).filter((item) => item !== id)
    nextIds.push(id)
    const byId = new Map(rows.map((row) => [row.id, row]))
    stop()
    homeRef.current = null
    setRows(nextIds.map((item) => byId.get(item) ?? { id: item, label: item }))
    setHomeId(null)
    setFlight(null)
    setPhase("placed")
    focusHome(id)
  }

  const away = awayShift(intensity)
  const returning = phase === "returning" && flight
  const shift = phase === "dragging"
    ? away
    : returning
      ? style === "fade"
        ? away
        : returnShift(flight.progress, intensity, style, flight.still || reduced)
      : 0
  const opacity = flight && (phase === "dragging" || phase === "returning")
    ? phase === "dragging"
      ? 0.9
      : returnOpacity(flight.progress, style, flight.still || reduced)
    : 0
  const order = rows.map((row) => row.id).join(",")
  const status = empty && phase !== "dragging"
    ? "Empty list"
    : phase === "dragging"
      ? "Dragging"
      : phase === "returning"
        ? "Returning"
        : phase === "placed"
          ? "Placed"
          : "Resting"
  const buttonClass = cn("rounded-full border border-border bg-background px-3 py-1.5 text-sm text-foreground", focusRing)
  const homeLabel = rows.find((row) => row.id === homeId)?.label

  return (
    <div
      ref={rootRef}
      data-slot="snap-home-cancel"
      data-ritual="snap-home"
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      data-style={style}
      data-origin={origin}
      data-phase={shownPhase}
      data-flight={phase === "dragging" ? (reduced ? "still" : "away") : phase === "returning" ? "run" : "off"}
      data-shift={shift}
      data-order={order}
      className={cn(
        "relative w-full max-w-md rounded-3xl border border-border bg-card p-4 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <p className="text-sm text-muted-foreground">
        Start drag, then Esc or Cancel snaps the item home and keeps the old order. Drop places it at the end. The ghost does not take clicks.
      </p>
      <div role="list" aria-label="Cancel preview" className="relative mt-3 space-y-2 pb-14">
        {empty ? <p className="rounded-xl border border-dashed border-border px-3 py-6 text-sm text-muted-foreground">No items</p> : null}
        {empty
          ? null
          : rows.map((row) => {
              const home = homeId === row.id
              return (
                <div key={row.id} role="listitem" className="relative">
                  {home && origin === "slot" ? (
                    <div
                      data-home-mark=""
                      aria-hidden="true"
                      style={{ pointerEvents: "none" }}
                      className="pointer-events-none absolute inset-0 rounded-xl border border-dashed border-primary"
                    />
                  ) : null}
                  {home && origin === "lift" ? (
                    <div
                      data-home-mark=""
                      aria-hidden="true"
                      style={{ pointerEvents: "none" }}
                      className="pointer-events-none absolute inset-x-3 top-0 h-0.5 bg-primary"
                    />
                  ) : null}
                  <button
                    type="button"
                    data-focus={row.id}
                    ref={(node) => {
                      if (node) rowsRef.current.set(row.id, node)
                      else rowsRef.current.delete(row.id)
                    }}
                    className={cn(
                      "flex w-full rounded-xl border border-border bg-background px-3 py-2 text-left text-sm font-medium text-foreground",
                      focusRing,
                    )}
                  >
                    {row.label}
                  </button>
                  {home && flight ? (
                    <motion.div
                      data-ghost=""
                      aria-hidden="true"
                      style={{ pointerEvents: "none", opacity, transform: `translateY(${shift}px)` }}
                      className="pointer-events-none absolute inset-x-0 top-0 flex h-10 items-center rounded-xl border border-primary/50 bg-card px-3 text-sm text-foreground motion-reduce:transition-none"
                    >
                      {homeLabel}
                    </motion.div>
                  ) : null}
                </div>
              )
            })}
      </div>
      <p role="status" className="text-sm text-foreground">
        {status}
      </p>
      <div className="relative z-10 mt-3 flex flex-wrap gap-2">
        <button type="button" className={buttonClass} onClick={start}>
          Start drag
        </button>
        <button type="button" className={buttonClass} onClick={place}>
          Drop
        </button>
        <button type="button" className={buttonClass} onClick={cancel}>
          Cancel
        </button>
        <button
          type="button"
          className={buttonClass}
          onClick={() => {
            stop()
            homeRef.current = null
            setHomeId(null)
            setFlight(null)
            setEmpty((value) => !value)
            setPhase("rest")
          }}
        >
          {empty ? "Restore items" : "Show empty"}
        </button>
        <button
          type="button"
          className={buttonClass}
          onClick={() => {
            stop()
            homeRef.current = null
            setRows(cloneRows())
            setEmpty(false)
            setHomeId(null)
            setFlight(null)
            setPhase("rest")
          }}
        >
          Reset
        </button>
      </div>
    </div>
  )
}
