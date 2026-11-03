"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

/**
 * Inspired by Weverse, Linear, Klarna, and YouTube Music (via Mobbin), original implementation.
 * https://mobbin.com/flows/65e7bf52-fd2d-4ead-b2a5-898f15ecc374
 * https://mobbin.com/screens/fc208a44-dbf9-4f79-b9b0-db57f9840964
 * https://mobbin.com/screens/f6b05568-9203-4f66-9cef-b2726ab8eedf
 * https://mobbin.com/flows/faae9455-94fd-4090-be3e-138880a10c18
 */

export interface DockSettlePopProps {
  pace?: number
  intensity?: number
  style?: DockStyle
  anchor?: DockAnchor
  className?: string
  onValueChange?: (state: { phase: DockPhase; settled: boolean }) => void
}

export type DockStyle = "pop" | "shadow"
export type DockAnchor = "row" | "card"
export type DockPhase = "empty" | "rest" | "preview" | "docked"

interface Row {
  id: string
  label: string
}

interface Settle {
  id: string
  progress: number
  still: boolean
}

const SEED: readonly Row[] = [
  { id: "a", label: "Item A" },
  { id: "b", label: "Item B" },
  { id: "c", label: "Item C" },
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

function cloneRows() {
  return SEED.map((row) => ({ ...row }))
}

export function stepOrder(ids: readonly string[], id: string) {
  const index = ids.indexOf(id)
  if (index < 0) return [...ids]
  const direction = index >= ids.length - 1 ? -1 : 1
  const nextIndex = index + direction
  const next = ids.slice()
  const [item] = next.splice(index, 1)
  if (!item) return [...ids]
  next.splice(nextIndex, 0, item)
  return next
}

export function settleStep(pace: number) {
  const frames = clamp(14 / paceRate(pace), 8, 20)
  return Math.round((1 / frames) * 1000) / 1000
}

export function dockScale(progress: number, intensity: number, style: DockStyle, still: boolean) {
  if (still || style !== "pop") return 1
  const amp = 0.012 + clamp(intensity, 0, 1) * 0.04
  return Math.round((1 + Math.sin(clamp(progress, 0, 1) * Math.PI) * amp) * 1000) / 1000
}

export function dockShadow(progress: number, intensity: number, style: DockStyle, still: boolean) {
  if (still || style !== "shadow") return 0
  const cap = 0.16 + clamp(intensity, 0, 1) * 0.4
  return Math.round(Math.sin(clamp(progress, 0, 1) * Math.PI) * cap * 1000) / 1000
}

export function DockSettlePop({
  pace = 1,
  intensity = 0.3,
  style = "pop",
  anchor = "row",
  className,
  onValueChange,
}: DockSettlePopProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const raf = useRef(0)
  const gen = useRef(0)
  const previewRef = useRef<string | null>(null)
  const rowsRef = useRef(new Map<string, HTMLButtonElement>())
  const onValueRef = useRef(onValueChange)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef)
  const [rows, setRows] = useState<Row[]>(cloneRows)
  const [empty, setEmpty] = useState(false)
  const [previewId, setPreviewId] = useState<string | null>(null)
  const [settle, setSettle] = useState<Settle | null>(null)
  const [phase, setPhase] = useState<DockPhase>("rest")
  const shownPhase: DockPhase = empty ? "empty" : phase

  if (settle && !settle.still && (reduced || !live)) setSettle({ ...settle, progress: 1, still: true })

  useEffect(() => {
    onValueRef.current = onValueChange
  }, [onValueChange])

  useEffect(() => {
    onValueRef.current?.({ phase: shownPhase, settled: phase === "docked" })
  }, [shownPhase, phase])

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

  function focusRow(id: string) {
    rowsRef.current.get(id)?.focus()
  }

  function preview(id?: string) {
    if (empty) return
    const target = id ?? rows[0]?.id
    if (!target) return
    stop()
    previewRef.current = target
    setPreviewId(target)
    setSettle(null)
    setPhase("preview")
  }

  function cancel() {
    const id = previewRef.current
    stop()
    previewRef.current = null
    setPreviewId(null)
    setSettle(null)
    setPhase(empty ? "empty" : "rest")
    if (id) focusRow(id)
  }

  useEffect(() => {
    if (!previewId) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      event.preventDefault()
      cancel()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  })

  function commit(id?: string) {
    if (empty) return
    const target = id ?? previewRef.current ?? rows[0]?.id
    if (!target) return
    const nextIds = stepOrder(rows.map((row) => row.id), target)
    const byId = new Map(rows.map((row) => [row.id, row]))
    stop()
    previewRef.current = null
    setPreviewId(null)
    setRows(nextIds.map((item) => byId.get(item) ?? { id: item, label: item }))
    setPhase("docked")
    if (reduced || !live) {
      setSettle({ id: target, progress: 1, still: true })
    } else {
      const token = gen.current
      const step = settleStep(pace)
      let progress = 0
      setSettle({ id: target, progress: 0, still: false })
      const tick = () => {
        if (token !== gen.current) return
        progress = Math.min(1, Math.round((progress + step) * 1000) / 1000)
        if (progress >= 1) {
          setSettle({ id: target, progress: 1, still: true })
          return
        }
        setSettle({ id: target, progress, still: false })
        raf.current = requestAnimationFrame(tick)
      }
      raf.current = requestAnimationFrame(tick)
    }
    focusRow(target)
  }

  const order = rows.map((row) => row.id).join(",")
  const scale = settle ? dockScale(settle.progress, intensity, style, settle.still || reduced) : 1
  const shadow = settle ? dockShadow(settle.progress, intensity, style, settle.still || reduced) : 0
  const status = empty ? "Empty list" : phase === "preview" ? "Previewing" : phase === "docked" ? "Docked" : "Resting"
  const buttonClass = cn("rounded-full border border-border bg-background px-3 py-1.5 text-sm text-foreground", focusRing)

  return (
    <div
      ref={rootRef}
      data-slot="dock-settle-pop"
      data-ritual="dock-settle"
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      data-style={style}
      data-anchor={anchor}
      data-phase={shownPhase}
      data-settle={settle ? (settle.still || reduced ? "still" : "run") : "off"}
      data-scale={scale}
      data-order={order}
      className={cn(
        "relative w-full max-w-md rounded-3xl border border-border bg-card p-4 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <p className="text-sm text-muted-foreground">
        Commit move docks the item with one short settle. Preview, then Esc or Cancel, returns without docking. No sound.
      </p>
      <div
        role="list"
        aria-label="Dock list"
        className={cn("mt-3", anchor === "card" ? "grid grid-cols-3 gap-2" : "space-y-2")}
      >
        {empty ? <p className="rounded-xl border border-dashed border-border px-3 py-6 text-sm text-muted-foreground">No items</p> : null}
        {empty
          ? null
          : rows.map((row) => {
              const active = settle?.id === row.id
              const pending = previewId === row.id
              return (
                <div key={row.id} role="listitem" className="relative">
                  {active && settle ? (
                    <motion.div
                      data-dock-plate=""
                      aria-hidden="true"
                      style={{
                        pointerEvents: "none",
                        opacity: settle.still || reduced ? 0 : style === "shadow" ? Math.max(shadow, 0.16) : 0.4,
                        transform: `scaleX(${style === "pop" ? scale : 1})`,
                      }}
                      className="pointer-events-none absolute inset-x-2 -bottom-1 h-1.5 rounded-full bg-primary motion-reduce:transition-none"
                    />
                  ) : null}
                  {pending ? (
                    <div
                      data-preview=""
                      aria-hidden="true"
                      style={{ pointerEvents: "none" }}
                      className="pointer-events-none absolute inset-0 translate-y-3 rounded-xl border border-dashed border-muted-foreground"
                    />
                  ) : null}
                  <button
                    type="button"
                    data-focus={row.id}
                    ref={(node) => {
                      if (node) rowsRef.current.set(row.id, node)
                      else rowsRef.current.delete(row.id)
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault()
                        commit(row.id)
                      } else if (event.key === "ArrowDown") {
                        event.preventDefault()
                        preview(row.id)
                      } else if (event.key === "Escape") {
                        event.preventDefault()
                        cancel()
                      }
                    }}
                    style={active && style === "pop" ? { transform: `scale(${scale})` } : undefined}
                    className={cn(
                      "relative z-10 w-full rounded-xl border border-border bg-background px-3 py-3 text-left text-sm font-medium text-foreground motion-reduce:transition-none",
                      focusRing,
                      anchor === "card" && "min-h-24",
                    )}
                  >
                    {row.label}
                  </button>
                </div>
              )
            })}
      </div>
      <p role="status" className="mt-3 text-sm text-foreground">
        {status}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className={buttonClass} onClick={() => commit()}>
          Commit move
        </button>
        <button type="button" className={buttonClass} onClick={() => preview()}>
          Preview
        </button>
        <button type="button" className={buttonClass} onClick={cancel}>
          Cancel
        </button>
        <button
          type="button"
          className={buttonClass}
          onClick={() => {
            stop()
            previewRef.current = null
            setPreviewId(null)
            setSettle(null)
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
            previewRef.current = null
            setRows(cloneRows())
            setEmpty(false)
            setPreviewId(null)
            setSettle(null)
            setPhase("rest")
          }}
        >
          Reset
        </button>
      </div>
    </div>
  )
}
