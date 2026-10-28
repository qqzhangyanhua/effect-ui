"use client"

import { useEffect, useRef, useState, type KeyboardEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface FloorUnitGlowProps {
  pace?: number
  intensity?: number
  breath?: boolean
  showLegend?: boolean
  className?: string
  onValueChange?: (state: { floor: number; unitId: string | null }) => void
}

export type UnitStatus = "open" | "taken"

export interface FloorUnit {
  id: string
  floor: number
  status: UnitStatus
  points: string
}

export const FLOOR_IDS = [1, 2, 3] as const

export const FLOOR_UNITS: readonly FloorUnit[] = [
  { id: "A1", floor: 1, status: "open", points: "24,28 118,28 118,92 24,92" },
  { id: "A2", floor: 1, status: "taken", points: "132,28 206,28 206,92 132,92" },
  { id: "C3", floor: 1, status: "open", points: "220,28 296,28 296,92 220,92" },
  { id: "B2", floor: 2, status: "open", points: "28,36 150,24 164,112 32,124" },
  { id: "B4", floor: 2, status: "taken", points: "178,30 296,36 288,120 172,110" },
  { id: "D1", floor: 3, status: "open", points: "24,24 150,24 150,176 24,176" },
  { id: "D2", floor: 3, status: "open", points: "168,24 296,24 296,92 168,92" },
  { id: "D5", floor: 3, status: "taken", points: "168,108 296,108 296,176 168,176" },
]

const VIEW_W = 320
const VIEW_H = 200

type FloorPhase = "idle" | "selecting" | "glowing"

interface Frame {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

export function unitFrame(points: string): Frame {
  const values = points.split(/[\s,]+/).map(Number).filter((value) => Number.isFinite(value))
  let minX = VIEW_W
  let minY = VIEW_H
  let maxX = 0
  let maxY = 0
  for (let index = 0; index < values.length; index += 2) {
    const x = values[index] ?? 0
    const y = values[index + 1] ?? 0
    minX = Math.min(minX, x)
    minY = Math.min(minY, y)
    maxX = Math.max(maxX, x)
    maxY = Math.max(maxY, y)
  }
  return { minX, minY, maxX, maxY }
}

function statusLabel(status: UnitStatus) {
  return status === "open" ? "Open" : "Taken"
}

export function FloorUnitGlow({
  pace = 1,
  intensity = 0.7,
  breath = false,
  showLegend = true,
  className,
  onValueChange,
}: FloorUnitGlowProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const onValueRef = useRef(onValueChange)
  const [floor, setFloor] = useState(1)
  const [unitId, setUnitId] = useState<string | null>(null)
  const [phase, setPhase] = useState<FloorPhase>("idle")
  const [clock, setClock] = useState(0)
  const gain = clamp(intensity, 0, 1)
  const rate = rateOf(pace)
  const ms = reduced ? 0 : Math.round(260 / rate)
  const units = FLOOR_UNITS.filter((unit) => unit.floor === floor)
  const current = units.find((unit) => unit.id === unitId) ?? null
  const breathing = breath && phase === "glowing" && current !== null && live && !reduced

  useEffect(() => {
    onValueRef.current = onValueChange
  }, [onValueChange])

  useEffect(() => {
    if (reduced || phase !== "selecting") return
    const frame = window.requestAnimationFrame(() => setPhase("glowing"))
    return () => window.cancelAnimationFrame(frame)
  }, [phase, reduced])

  useEffect(() => {
    if (!breathing) return
    let frame = 0
    let stopped = false
    const tick = () => {
      if (stopped) return
      setClock((value) => value + 1)
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => {
      stopped = true
      window.cancelAnimationFrame(frame)
    }
  }, [breathing])

  function emit(nextFloor: number, nextUnit: string | null) {
    onValueRef.current?.({ floor: nextFloor, unitId: nextUnit })
  }

  function chooseFloor(next: number) {
    const safe = FLOOR_IDS.includes(next as (typeof FLOOR_IDS)[number]) ? next : floor
    if (safe === floor) return
    setFloor(safe)
    setUnitId(null)
    setPhase("idle")
    emit(safe, null)
  }

  function shiftFloor(delta: number) {
    const index = FLOOR_IDS.indexOf(floor as (typeof FLOOR_IDS)[number])
    const next = FLOOR_IDS[clamp(index + delta, 0, FLOOR_IDS.length - 1)]
    if (next === undefined) return
    chooseFloor(next)
  }

  function selectUnit(id: string) {
    const unit = units.find((item) => item.id === id)
    if (!unit || unit.status !== "open") return
    setUnitId(id)
    setPhase(reduced ? "glowing" : "selecting")
    emit(floor, id)
  }

  function clearUnit() {
    if (unitId === null) return
    setUnitId(null)
    setPhase("idle")
    emit(floor, null)
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") shiftFloor(1)
    else if (event.key === "ArrowLeft") shiftFloor(-1)
    else if (event.key === "Escape") clearUnit()
    else return
    event.preventDefault()
  }

  const card = current ? `Unit ${current.id} · ${statusLabel(current.status)}` : "Select a unit"

  return (
    <div
      ref={ref}
      data-slot="floor-unit-glow"
      data-ritual="floor-plan"
      data-pace={rate}
      data-intensity={gain}
      data-breath={breath ? "on" : "off"}
      data-breathing={breathing ? "on" : "off"}
      data-legend={showLegend ? "on" : "off"}
      data-floor={floor}
      data-unit={unitId ?? ""}
      data-status={current?.status ?? ""}
      data-state={phase}
      data-clock={clock}
      data-ease={ms}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      onKeyDown={onKeyDown}
      className={cn(
        "w-full max-w-md rounded-3xl border border-border bg-card p-3 text-card-foreground select-none motion-reduce:transition-none",
        className,
      )}
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <div role="tablist" aria-label="Floors" className="flex gap-1">
          {FLOOR_IDS.map((id) => (
            <div
              key={id}
              role="tab"
              tabIndex={0}
              aria-selected={floor === id}
              data-floor-tab={id}
              onClick={() => chooseFloor(id)}
              onKeyDown={(event) => {
                if (event.key !== "Enter" && event.key !== " ") return
                event.preventDefault()
                chooseFloor(id)
              }}
              className={cn(
                "cursor-pointer rounded-full px-3 py-1 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
                floor === id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
              )}
            >
              Floor {id}
            </div>
          ))}
        </div>
        {showLegend ? (
          <div data-part="legend" className="flex gap-2 text-[10px] text-muted-foreground">
            <span>Open</span>
            <span>Taken</span>
          </div>
        ) : null}
      </div>
      <div className="grid gap-3 sm:grid-cols-[1fr_8.5rem]">
        <div className="relative aspect-[320/200] overflow-hidden rounded-2xl bg-muted">
          <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} aria-hidden>
            <rect x="12" y="12" width="296" height="176" rx="12" fill="var(--background)" stroke="var(--border)" />
            {units.map((unit) => {
              const active = unit.id === unitId
              const pulse = active && breathing ? Math.sin(clock / 2) * 0.18 : 0
              return (
                <polygon
                  key={unit.id}
                  data-shape={unit.id}
                  points={unit.points}
                  fill={unit.status === "taken" ? "var(--muted)" : "color-mix(in srgb, var(--primary) 14%, var(--background))"}
                  stroke={active ? "var(--primary)" : "var(--muted-foreground)"}
                  strokeWidth={active ? 2.5 + gain * 2 : 1.25}
                  opacity={active ? 0.72 + gain * 0.28 + pulse : 0.85}
                  style={{ transition: reduced ? "none" : `opacity ${ms}ms ease, stroke-width ${ms}ms ease` }}
                />
              )
            })}
          </svg>
          {units.map((unit) => {
            const frame = unitFrame(unit.points)
            const taken = unit.status === "taken"
            return (
              <motion.div
                key={unit.id}
                role="button"
                tabIndex={taken ? -1 : 0}
                aria-disabled={taken}
                aria-label={taken ? `Unit ${unit.id} taken` : `Unit ${unit.id}`}
                data-unit={unit.id}
                data-unit-status={unit.status}
                onClick={() => selectUnit(unit.id)}
                onKeyDown={(event) => {
                  if (event.key !== "Enter" && event.key !== " ") return
                  event.preventDefault()
                  event.stopPropagation()
                  selectUnit(unit.id)
                }}
                className={cn(
                  "absolute grid place-items-center text-[10px] font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
                  taken ? "cursor-not-allowed text-muted-foreground" : "cursor-pointer text-foreground",
                )}
                style={{
                  left: `${(frame.minX / VIEW_W) * 100}%`,
                  top: `${(frame.minY / VIEW_H) * 100}%`,
                  width: `${((frame.maxX - frame.minX) / VIEW_W) * 100}%`,
                  height: `${((frame.maxY - frame.minY) / VIEW_H) * 100}%`,
                }}
              >
                {unit.id}
              </motion.div>
            )
          })}
        </div>
        <div data-part="card" className="rounded-2xl border border-border bg-background p-3">
          <p className="text-xs text-muted-foreground">Floor {floor}</p>
          <p className="mt-1 text-sm font-medium text-foreground">{card}</p>
        </div>
      </div>
      <p role="status" className="sr-only">
        {card}
      </p>
    </div>
  )
}
