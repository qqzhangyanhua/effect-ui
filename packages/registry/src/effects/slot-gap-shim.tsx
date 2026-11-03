"use client"

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

/**
 * Inspired by Linear, Hevy, Weverse, and untitled (via Mobbin), original implementation.
 * https://mobbin.com/screens/fc208a44-dbf9-4f79-b9b0-db57f9840964
 * https://mobbin.com/screens/e6ea3069-8ef6-47c6-9358-fec40bef4368
 * https://mobbin.com/flows/65e7bf52-fd2d-4ead-b2a5-898f15ecc374
 * https://mobbin.com/flows/812998c8-f1bc-4947-ac81-8a7260dd17d9
 */

export interface SlotGapShimProps {
  pace?: number
  intensity?: number
  style?: ShimStyle
  ghost?: GhostMode
  className?: string
  onValueChange?: (state: { phase: ShimPhase; insertAt: number }) => void
}

export type ShimStyle = "outline" | "fill"
export type GhostMode = "on" | "off"
export type ShimPhase = "empty" | "rest" | "dragging" | "placed"

interface Row {
  id: string
  label: string
}

interface Shim {
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

export function relocate(ids: readonly string[], id: string, at: number) {
  const from = ids.indexOf(id)
  if (from < 0) return [...ids]
  const next = ids.filter((item) => item !== id)
  const target = at > from ? at - 1 : at
  const index = clamp(target, 0, next.length)
  next.splice(index, 0, id)
  return next
}

export function shimStep(pace: number) {
  const frames = clamp(14 / paceRate(pace), 8, 22)
  return Math.round((1 / frames) * 1000) / 1000
}

export function shimHeight(progress: number, intensity: number, still: boolean) {
  const cap = 10 + clamp(intensity, 0, 1) * 26
  const amount = still ? cap : cap * easeOut(progress)
  return Math.round(amount)
}

export function shimOpacity(progress: number, intensity: number, still: boolean) {
  const cap = 0.35 + clamp(intensity, 0, 1) * 0.55
  const amount = still ? cap : cap * easeOut(progress)
  return Math.round(amount * 1000) / 1000
}

export function SlotGapShim({
  pace = 1,
  intensity = 0.42,
  style = "outline",
  ghost = "on",
  className,
  onValueChange,
}: SlotGapShimProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const raf = useRef(0)
  const gen = useRef(0)
  const orderRef = useRef<string[]>(SEED.map((row) => row.id))
  const dragRef = useRef<string | null>(null)
  const insertRef = useRef(0)
  const lastY = useRef(0)
  const rowsRef = useRef(new Map<string, HTMLButtonElement>())
  const onValueRef = useRef(onValueChange)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef)
  const [rows, setRows] = useState<Row[]>(cloneRows)
  const [empty, setEmpty] = useState(false)
  const [dragId, setDragId] = useState<string | null>(null)
  const [insertAt, setInsertAt] = useState(0)
  const [shim, setShim] = useState<Shim | null>(null)
  const [phase, setPhase] = useState<ShimPhase>("rest")
  const shownPhase: ShimPhase = empty && !dragId ? "empty" : phase

  if (shim && !shim.still && (reduced || !live)) setShim({ progress: 1, still: true })

  useEffect(() => {
    onValueRef.current = onValueChange
  }, [onValueChange])

  useEffect(() => {
    onValueRef.current?.({ phase: shownPhase, insertAt })
  }, [shownPhase, insertAt])

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

  function openShim() {
    stop()
    if (reduced || !live) {
      setShim({ progress: 1, still: true })
      return
    }
    const token = gen.current
    const step = shimStep(pace)
    let progress = 0
    setShim({ progress: 0, still: false })
    const tick = () => {
      if (token !== gen.current) return
      progress = Math.min(1, Math.round((progress + step) * 1000) / 1000)
      if (progress >= 1) {
        setShim({ progress: 1, still: true })
        return
      }
      setShim({ progress, still: false })
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
  }

  function begin(id: string, at: number) {
    if (empty && rows.length === 0) return
    orderRef.current = rows.map((row) => row.id)
    dragRef.current = id
    insertRef.current = clamp(at, 0, rows.length)
    setDragId(id)
    setInsertAt(insertRef.current)
    setPhase("dragging")
    openShim()
  }

  function shiftInsert(direction: -1 | 1) {
    const id = dragRef.current ?? (empty ? null : rows[1]?.id ?? rows[0]?.id)
    if (!id) return
    if (dragRef.current !== id) {
      const index = rows.findIndex((row) => row.id === id)
      begin(id, clamp(index + (direction > 0 ? 2 : 0), 0, rows.length))
      return
    }
    const next = clamp(insertRef.current + direction, 0, rows.length)
    insertRef.current = next
    setInsertAt(next)
    openShim()
  }

  function drop() {
    const id = dragRef.current
    if (!id || empty) {
      cancel()
      return
    }
    const at = insertRef.current
    const nextIds = relocate(rows.map((row) => row.id), id, at)
    const byId = new Map(rows.map((row) => [row.id, row]))
    stop()
    dragRef.current = null
    setRows(nextIds.map((item) => byId.get(item) ?? { id: item, label: item }))
    setDragId(null)
    setShim(null)
    setPhase("placed")
    rowsRef.current.get(id)?.focus()
  }

  function cancel() {
    const id = dragRef.current
    stop()
    dragRef.current = null
    setDragId(null)
    setShim(null)
    setPhase(empty ? "empty" : "rest")
    if (id) rowsRef.current.get(id)?.focus()
  }

  useEffect(() => {
    if (!dragId) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      event.preventDefault()
      cancel()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  })

  function onPointerDown(event: ReactPointerEvent<HTMLButtonElement>, id: string, index: number) {
    if (event.button !== 0) return
    lastY.current = event.clientY
    begin(id, index + 1)
  }

  function onPointerMove(event: ReactPointerEvent<HTMLButtonElement>, id: string) {
    if (dragRef.current !== id) return
    const delta = event.clientY - lastY.current
    if (Math.abs(delta) < 28) return
    lastY.current = event.clientY
    const next = clamp(insertRef.current + (delta > 0 ? 1 : -1), 0, rows.length)
    insertRef.current = next
    setInsertAt(next)
  }

  const still = Boolean(shim?.still || reduced)
  const progress = shim?.progress ?? 0
  const height = dragId && shim ? shimHeight(progress, intensity, still) : 0
  const opacity = dragId && shim ? shimOpacity(progress, intensity, still) : 0
  const order = rows.map((row) => row.id).join(",")
  const gapLabel = rows[insertAt]?.label ?? "end"
  const status = empty && !dragId
    ? "Empty list"
    : dragId
      ? `Gap before ${gapLabel}`
      : phase === "placed"
        ? "Placed"
        : "Resting"
  const buttonClass = cn("rounded-full border border-border bg-background px-3 py-1.5 text-sm text-foreground", focusRing)

  function shimNode(key: string) {
    return (
      <motion.div
        key={key}
        data-shim=""
        aria-hidden="true"
        style={{ pointerEvents: "none", height, opacity }}
        className={cn(
          "pointer-events-none overflow-hidden rounded-lg motion-reduce:transition-none",
          style === "fill" ? "bg-primary/20" : "border border-dashed border-primary",
        )}
      />
    )
  }

  return (
    <div
      ref={rootRef}
      data-slot="slot-gap-shim"
      data-ritual="slot-shim"
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      data-style={style}
      data-ghost={ghost}
      data-phase={shownPhase}
      data-shim={shim && dragId ? (still ? "still" : "run") : "off"}
      data-gap={height}
      data-insert={insertAt}
      data-order={order}
      className={cn(
        "relative w-full max-w-md rounded-3xl border border-border bg-card p-4 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <p className="text-sm text-muted-foreground">
        Simulate drag, or press a row. Arrow keys and Insert move the gap. Drop keeps the order. Esc or Cancel closes the gap.
      </p>
      <div role="list" aria-label="Gap preview" className="mt-3 space-y-2">
        {empty ? <p className="rounded-xl border border-dashed border-border px-3 py-6 text-sm text-muted-foreground">No items</p> : null}
        {empty && dragId ? shimNode("empty-shim") : null}
        {empty
          ? null
          : rows.map((row, index) => (
              <div key={row.id} role="listitem" className="space-y-2">
                {dragId && insertAt === index ? shimNode(`shim-${index}`) : null}
                <div className="relative">
                  {ghost === "on" && dragId === row.id ? (
                    <div
                      data-ghost=""
                      aria-hidden="true"
                      style={{ pointerEvents: "none" }}
                      className="pointer-events-none absolute inset-0 rounded-xl border border-dashed border-muted-foreground"
                    />
                  ) : null}
                  <button
                    type="button"
                    data-focus={row.id}
                    ref={(node) => {
                      if (node) rowsRef.current.set(row.id, node)
                      else rowsRef.current.delete(row.id)
                    }}
                    aria-pressed={dragId === row.id}
                    onPointerDown={(event) => onPointerDown(event, row.id, index)}
                    onPointerMove={(event) => onPointerMove(event, row.id)}
                    onKeyDown={(event) => {
                      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                        event.preventDefault()
                        if (dragRef.current !== row.id) begin(row.id, event.key === "ArrowDown" ? index + 1 : index)
                        else shiftInsert(event.key === "ArrowDown" ? 1 : -1)
                      } else if (event.key === "Enter") {
                        event.preventDefault()
                        if (dragRef.current === row.id) drop()
                        else begin(row.id, index + 1)
                      } else if (event.key === "Escape") {
                        event.preventDefault()
                        cancel()
                      }
                    }}
                    className={cn(
                      "flex w-full items-center rounded-xl border border-border bg-background px-3 py-2 text-left text-sm font-medium text-foreground",
                      dragId === row.id && "opacity-60",
                      focusRing,
                    )}
                  >
                    {row.label}
                  </button>
                </div>
              </div>
            ))}
        {!empty && dragId && insertAt === rows.length ? shimNode("shim-end") : null}
      </div>
      <p role="status" className="mt-3 text-sm text-foreground">
        {status}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className={buttonClass} onClick={() => begin(rows[1]?.id ?? rows[0]?.id ?? "b", Math.min(rows.length, 3))}>
          Simulate drag
        </button>
        <button type="button" className={buttonClass} onClick={() => shiftInsert(-1)}>
          Insert up
        </button>
        <button type="button" className={buttonClass} onClick={() => shiftInsert(1)}>
          Insert down
        </button>
        <button type="button" className={buttonClass} onClick={drop}>
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
            dragRef.current = null
            setDragId(null)
            setShim(null)
            setEmpty((value) => !value)
            setPhase((value) => (value === "empty" || empty ? "rest" : "empty"))
          }}
        >
          {empty ? "Restore items" : "Show empty"}
        </button>
        <button
          type="button"
          className={buttonClass}
          onClick={() => {
            stop()
            dragRef.current = null
            setRows(cloneRows())
            setEmpty(false)
            setDragId(null)
            setShim(null)
            setInsertAt(0)
            insertRef.current = 0
            setPhase("rest")
          }}
        >
          Reset
        </button>
      </div>
    </div>
  )
}
