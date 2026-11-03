"use client"

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

/**
 * Inspired by Spotify, Behance, Klarna, WhatsApp, Linktree, and SiriusXM (via Mobbin), original implementation.
 * https://mobbin.com/screens/e0486c16-d841-442f-8172-e020cf712e19
 * https://mobbin.com/screens/7714843d-d1c0-4453-811d-4e0dcd8454bb
 * https://mobbin.com/screens/f6b05568-9203-4f66-9cef-b2726ab8eedf
 * https://mobbin.com/screens/56db1907-2733-485e-af9a-c3c466088622
 * https://mobbin.com/screens/3dfe97c9-6ee6-4adb-b849-7c15e146a6ed
 * https://mobbin.com/screens/cfb1e560-c6ae-4883-b6b9-47eff0ade897
 */

export interface GripLiftRiseProps {
  pace?: number
  intensity?: number
  style?: LiftStyle
  handle?: HandleKind
  className?: string
  onValueChange?: (state: { phase: GripPhase; lifted: boolean }) => void
}

export type LiftStyle = "shadow" | "scale"
export type HandleKind = "bars" | "dots"
export type GripPhase = "empty" | "rest" | "lifted" | "placed"

interface Row {
  id: string
  label: string
}

interface Lift {
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

export function moveRow<T extends { id: string }>(rows: readonly T[], id: string, direction: -1 | 1) {
  const index = rows.findIndex((row) => row.id === id)
  const nextIndex = index + direction
  if (index < 0 || nextIndex < 0 || nextIndex >= rows.length) return rows.slice()
  const next = rows.slice()
  const [item] = next.splice(index, 1)
  if (!item) return rows.slice()
  next.splice(nextIndex, 0, item)
  return next
}

export function liftStep(pace: number) {
  const frames = clamp(16 / paceRate(pace), 8, 24)
  return Math.round((1 / frames) * 1000) / 1000
}

export function liftRise(progress: number, intensity: number, style: LiftStyle, still: boolean) {
  const cap = style === "scale" ? 2 + clamp(intensity, 0, 1) * 5 : 4 + clamp(intensity, 0, 1) * 8
  const amount = still ? cap : cap * easeOut(progress)
  return Math.round(amount * 10) / 10
}

export function liftScale(progress: number, intensity: number, style: LiftStyle, still: boolean) {
  if (style !== "scale") return 1
  const extra = 0.012 + clamp(intensity, 0, 1) * 0.04
  const amount = still ? extra : extra * easeOut(progress)
  return Math.round((1 + amount) * 1000) / 1000
}

export function liftPlate(progress: number, intensity: number, style: LiftStyle, still: boolean) {
  const cap = style === "shadow" ? 0.16 + clamp(intensity, 0, 1) * 0.4 : 0.06 + clamp(intensity, 0, 1) * 0.1
  const amount = still ? cap : cap * easeOut(progress)
  return Math.round(amount * 1000) / 1000
}

function HandleIcon({ kind }: { kind: HandleKind }) {
  if (kind === "bars") {
    return (
      <svg viewBox="0 0 16 10" className="h-2.5 w-4" aria-hidden="true">
        <path fill="currentColor" d="M0 0h16v2H0zm0 4h16v2H0zm0 4h16v2H0z" />
      </svg>
    )
  }
  const points = ["3,3", "9,3", "3,8", "9,8", "3,13", "9,13"]
  return (
    <svg viewBox="0 0 12 16" className="h-4 w-3" aria-hidden="true">
      <g fill="currentColor">
        {points.map((point) => {
          const [cx, cy] = point.split(",")
          return <circle key={point} cx={cx} cy={cy} r="1.15" />
        })}
      </g>
    </svg>
  )
}

export function GripLiftRise({
  pace = 1,
  intensity = 0.28,
  style = "shadow",
  handle = "bars",
  className,
  onValueChange,
}: GripLiftRiseProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const raf = useRef(0)
  const gen = useRef(0)
  const origin = useRef<Row[]>(cloneRows())
  const grabbedRef = useRef<string | null>(null)
  const lastY = useRef(0)
  const handles = useRef(new Map<string, HTMLButtonElement>())
  const onValueRef = useRef(onValueChange)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef)
  const [rows, setRows] = useState<Row[]>(cloneRows)
  const [empty, setEmpty] = useState(false)
  const [grabbed, setGrabbed] = useState<string | null>(null)
  const [lift, setLift] = useState<Lift | null>(null)
  const [phase, setPhase] = useState<GripPhase>("rest")
  const shownPhase: GripPhase = empty ? "empty" : phase

  if (lift && !lift.still && (reduced || !live)) setLift({ progress: 1, still: true })

  useEffect(() => {
    onValueRef.current = onValueChange
  }, [onValueChange])

  useEffect(() => {
    onValueRef.current?.({ phase: shownPhase, lifted: grabbed !== null && !empty })
  }, [shownPhase, grabbed, empty])

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

  function play(id: string) {
    stop()
    origin.current = rows.map((row) => ({ ...row }))
    grabbedRef.current = id
    setGrabbed(id)
    setPhase("lifted")
    if (reduced || !live) {
      setLift({ progress: 1, still: true })
      return
    }
    const token = gen.current
    const step = liftStep(pace)
    let progress = 0
    setLift({ progress: 0, still: false })
    const tick = () => {
      if (token !== gen.current) return
      progress = Math.min(1, Math.round((progress + step) * 1000) / 1000)
      if (progress >= 1) {
        setLift({ progress: 1, still: true })
        return
      }
      setLift({ progress, still: false })
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
  }

  function release() {
    const id = grabbedRef.current
    if (!id) return
    stop()
    grabbedRef.current = null
    setGrabbed(null)
    setLift(null)
    setPhase("placed")
    if (id) handles.current.get(id)?.focus()
  }

  function cancel() {
    const id = grabbedRef.current
    if (!id) return
    stop()
    setRows(origin.current.map((row) => ({ ...row })))
    grabbedRef.current = null
    setGrabbed(null)
    setLift(null)
    setPhase("rest")
    handles.current.get(id)?.focus()
  }

  useEffect(() => {
    if (!grabbed) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      event.preventDefault()
      cancel()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  })

  function grabOrMove(id: string, direction?: -1 | 1) {
    if (empty) return
    if (grabbedRef.current !== id) play(id)
    if (direction) setRows((current) => moveRow(current, id, direction))
  }

  function onPointerDown(event: ReactPointerEvent<HTMLButtonElement>, id: string) {
    if (event.button !== 0) return
    lastY.current = event.clientY
    const node = event.currentTarget
    if (typeof node.setPointerCapture === "function") {
      try {
        node.setPointerCapture(event.pointerId)
      } catch {
        /* Pointer capture is optional. The grip still owns the gesture. */
      }
    }
    grabOrMove(id)
  }

  function onPointerMove(event: ReactPointerEvent<HTMLButtonElement>, id: string) {
    if (grabbedRef.current !== id) return
    const delta = event.clientY - lastY.current
    if (Math.abs(delta) < 36) return
    lastY.current = event.clientY
    setRows((current) => moveRow(current, id, delta > 0 ? 1 : -1))
  }

  const progress = lift?.progress ?? 0
  const still = Boolean(lift?.still || reduced)
  const rise = grabbed && lift ? liftRise(progress, intensity, style, still) : 0
  const scale = grabbed && lift ? liftScale(progress, intensity, style, still) : 1
  const plate = grabbed && lift ? liftPlate(progress, intensity, style, still) : 0
  const order = rows.map((row) => row.id).join(",")
  const liftedLabel = rows.find((row) => row.id === grabbed)?.label
  const status = empty ? "Empty list" : grabbed ? `Lifted ${liftedLabel ?? "row"}` : phase === "placed" ? "Placed" : "Resting"
  const buttonClass = cn("rounded-full border border-border bg-background px-3 py-1.5 text-sm text-foreground", focusRing)

  return (
    <div
      ref={rootRef}
      data-slot="grip-lift-rise"
      data-ritual="grip-lift"
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      data-style={style}
      data-handle={handle}
      data-phase={shownPhase}
      data-grab={lift ? (still ? "still" : "run") : "off"}
      data-lift={rise}
      data-order={order}
      className={cn(
        "relative w-full max-w-md rounded-3xl border border-border bg-card p-4 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <p className="text-sm text-muted-foreground">
        Press a grip to lift the row. Arrow keys or Move reorder it. Release places it. Esc or Cancel puts it back. Only the grip takes the gesture, so the page can still scroll.
      </p>
      <div role="list" aria-label="Reorder list" className="mt-3 space-y-2 pt-2">
        {empty ? <p className="rounded-xl border border-dashed border-border px-3 py-6 text-sm text-muted-foreground">No items</p> : null}
        {empty
          ? null
          : rows.map((row) => {
              const active = grabbed === row.id
              return (
                <div key={row.id} role="listitem" data-row={row.id} className={cn("relative", active && "z-10")}>
                  {active && lift ? (
                    <motion.div
                      data-lift-plate=""
                      aria-hidden="true"
                      style={{
                        pointerEvents: "none",
                        opacity: plate,
                        boxShadow: `0 ${Math.max(4, rise)}px 18px color-mix(in oklab, var(--foreground) ${Math.round(plate * 55)}%, transparent)`,
                      }}
                      className="pointer-events-none absolute inset-x-1 -bottom-1 top-1 rounded-xl bg-background motion-reduce:transition-none"
                    />
                  ) : null}
                  <div
                    className="relative z-10 flex items-center gap-3 rounded-xl border border-border bg-background px-2 py-2 motion-reduce:transition-none"
                    style={active ? { transform: `translateY(${-rise}px) scale(${scale})` } : undefined}
                  >
                    <button
                      type="button"
                      ref={(node) => {
                        if (node) handles.current.set(row.id, node)
                        else handles.current.delete(row.id)
                      }}
                      aria-label={`Grip ${row.label}`}
                      aria-pressed={active}
                      style={{ touchAction: "none" }}
                      onPointerDown={(event) => onPointerDown(event, row.id)}
                      onPointerMove={(event) => onPointerMove(event, row.id)}
                      onPointerUp={() => {
                        if (grabbedRef.current === row.id) release()
                      }}
                      onKeyDown={(event) => {
                        if (event.key === " " || event.key === "Enter") {
                          event.preventDefault()
                          if (grabbedRef.current === row.id) release()
                          else grabOrMove(row.id)
                        } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
                          event.preventDefault()
                          grabOrMove(row.id, event.key === "ArrowUp" ? -1 : 1)
                        } else if (event.key === "Escape") {
                          event.preventDefault()
                          cancel()
                        }
                      }}
                      className={cn(
                        "grid h-9 w-9 shrink-0 place-items-center rounded-md border border-border text-muted-foreground",
                        focusRing,
                      )}
                    >
                      <HandleIcon kind={handle} />
                    </button>
                    <span className="text-sm font-medium text-foreground">{row.label}</span>
                  </div>
                </div>
              )
            })}
      </div>
      <p role="status" className="mt-3 text-sm text-foreground">
        {status}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className={buttonClass} onClick={() => grabOrMove(grabbed ?? rows[0]?.id ?? "a", -1)}>
          Move up
        </button>
        <button type="button" className={buttonClass} onClick={() => grabOrMove(grabbed ?? rows[0]?.id ?? "a", 1)}>
          Move down
        </button>
        <button type="button" className={buttonClass} onClick={release}>
          Release
        </button>
        <button type="button" className={buttonClass} onClick={cancel}>
          Cancel
        </button>
        <button
          type="button"
          className={buttonClass}
          onClick={() => {
            if (empty) {
              setEmpty(false)
              setPhase("rest")
              return
            }
            stop()
            grabbedRef.current = null
            setGrabbed(null)
            setLift(null)
            setEmpty(true)
            setPhase("empty")
          }}
        >
          {empty ? "Restore items" : "Show empty"}
        </button>
        <button
          type="button"
          className={buttonClass}
          onClick={() => {
            stop()
            const next = cloneRows()
            origin.current = next
            grabbedRef.current = null
            setRows(next)
            setEmpty(false)
            setGrabbed(null)
            setLift(null)
            setPhase("rest")
          }}
        >
          Reset
        </button>
      </div>
    </div>
  )
}
