"use client"

import { Fragment, useEffect, useRef, useState, type KeyboardEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface CabinSeatPickProps {
  pace?: number
  intensity?: number
  preferred?: boolean
  multi?: boolean
  className?: string
  onValueChange?: (seats: string[]) => void
}

export type SeatTone = "open" | "taken" | "preferred"

export interface CabinSeat {
  id: string
  row: number
  col: SeatCol
  tone: SeatTone
}

const COLS = ["A", "B", "C", "D", "E", "F", "G"] as const
const ROWS = [10, 11, 12, 13, 14] as const
type SeatCol = (typeof COLS)[number]

const TAKEN = new Set(["10B", "10E", "11A", "11D", "12D", "12G", "13C", "13F", "14E"])
const PREFERRED = new Set(["10C", "10G", "11F", "12B", "13D", "14A"])

function buildSeats(): CabinSeat[] {
  const seats: CabinSeat[] = []
  for (const row of ROWS) {
    for (const col of COLS) {
      const id = `${row}${col}`
      const tone: SeatTone = TAKEN.has(id) ? "taken" : PREFERRED.has(id) ? "preferred" : "open"
      seats.push({ id, row, col, tone })
    }
  }
  return seats
}

export const CABIN_SEATS = buildSeats()

type SeatPhase = "idle" | "focusing" | "selected"

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

export function shownTone(tone: SeatTone, preferredOn: boolean): SeatTone {
  if (tone === "preferred" && !preferredOn) return "open"
  return tone
}

function seatById(id: string) {
  return CABIN_SEATS.find((seat) => seat.id === id) ?? null
}

export function CabinSeatPick({
  pace = 1,
  intensity = 0.7,
  preferred = true,
  multi = false,
  className,
  onValueChange,
}: CabinSeatPickProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const onValueRef = useRef(onValueChange)
  const [focusId, setFocusId] = useState("10A")
  const [selected, setSelected] = useState<string[]>([])
  const [phase, setPhase] = useState<SeatPhase>("idle")
  const gain = clamp(intensity, 0, 1)
  const rate = rateOf(pace)
  const ms = reduced ? 0 : Math.round(220 / rate)

  useEffect(() => {
    onValueRef.current = onValueChange
  }, [onValueChange])

  function emit(next: string[]) {
    onValueRef.current?.(next)
  }

  function toggleSeat(id: string) {
    const seat = seatById(id)
    if (!seat) return
    if (seat.tone === "taken") {
      setFocusId(id)
      setPhase(selected.length > 0 ? "selected" : "focusing")
      return
    }
    const exists = selected.includes(id)
    let next: string[]
    if (exists) next = selected.filter((item) => item !== id)
    else if (multi) next = selected.length >= 2 ? selected : [...selected, id]
    else next = [id]
    setFocusId(id)
    if (next === selected) {
      setPhase("selected")
      return
    }
    setSelected(next)
    setPhase(next.length > 0 ? "selected" : "focusing")
    emit(next)
  }

  function moveFocus(dRow: number, dCol: number) {
    const seat = seatById(focusId) ?? CABIN_SEATS[0]
    if (!seat) return
    const row = clamp(seat.row + dRow, 10, 14)
    const col = COLS[clamp(COLS.indexOf(seat.col) + dCol, 0, COLS.length - 1)] ?? "A"
    setFocusId(`${row}${col}`)
    setPhase(selected.length > 0 ? "selected" : "focusing")
  }

  function clearSeats() {
    if (selected.length === 0) {
      setPhase("idle")
      return
    }
    setSelected([])
    setPhase("idle")
    emit([])
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") moveFocus(0, 1)
    else if (event.key === "ArrowLeft") moveFocus(0, -1)
    else if (event.key === "ArrowDown") moveFocus(1, 0)
    else if (event.key === "ArrowUp") moveFocus(-1, 0)
    else if (event.key === "Enter" || event.key === " ") toggleSeat(focusId)
    else if (event.key === "Escape") clearSeats()
    else return
    event.preventDefault()
  }

  const summary = selected.length > 0 ? selected.map((id) => `Seat ${id}`).join(" · ") : "No seat"

  return (
    <div
      ref={ref}
      data-slot="cabin-seat-pick"
      data-ritual="cabin-grid"
      data-pace={rate}
      data-intensity={gain}
      data-preferred={preferred ? "on" : "off"}
      data-multi={multi ? "on" : "off"}
      data-focus={focusId}
      data-seats={selected.join(",")}
      data-state={phase}
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
        <p className="text-sm text-muted-foreground">Cabin</p>
        <p className="text-xs text-muted-foreground">
          {multi ? "Up to 2" : "One seat"}
          {preferred ? " · Preferred" : ""}
        </p>
      </div>
      <div
        role="grid"
        aria-label="Cabin seats"
        tabIndex={0}
        aria-activedescendant={`seat-${focusId}`}
        className="grid grid-cols-[1.5rem_repeat(2,minmax(0,1fr))_0.45rem_repeat(3,minmax(0,1fr))_0.45rem_repeat(2,minmax(0,1fr))] gap-1 rounded-2xl bg-muted p-2 outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span />
        {COLS.map((col) => (
          <Fragment key={`head-${col}`}>
            {col === "C" || col === "F" ? <span aria-hidden /> : null}
            <span className="text-center text-[10px] text-muted-foreground">{col}</span>
          </Fragment>
        ))}
        {ROWS.map((row) => (
          <Fragment key={row}>
            <span className="grid place-items-center text-[10px] text-muted-foreground">{row}</span>
            {COLS.map((col) => {
              const seat = seatById(`${row}${col}`)
              if (!seat) return null
              const tone = shownTone(seat.tone, preferred)
              const on = selected.includes(seat.id)
              const focused = focusId === seat.id
              return (
                <Fragment key={seat.id}>
                  {col === "C" || col === "F" ? <span aria-hidden /> : null}
                  <motion.div
                    id={`seat-${seat.id}`}
                    role="gridcell"
                    aria-selected={on}
                    aria-disabled={seat.tone === "taken"}
                    aria-label={seat.tone === "taken" ? `Seat ${seat.id} taken` : `Seat ${seat.id}`}
                    data-seat={seat.id}
                    data-tone={tone}
                    data-selected={on ? "true" : "false"}
                    data-focused={focused ? "true" : "false"}
                    tabIndex={-1}
                    onClick={() => toggleSeat(seat.id)}
                    onKeyDown={(event) => {
                      if (event.key !== "Enter" && event.key !== " ") return
                      event.preventDefault()
                      event.stopPropagation()
                      toggleSeat(seat.id)
                    }}
                    className={cn(
                      "grid h-8 cursor-pointer place-items-center rounded-md border text-[10px] font-medium outline-none motion-reduce:transition-none",
                      tone === "taken" && "cursor-not-allowed border-border bg-muted text-muted-foreground",
                      tone === "preferred" && !on && "border-chart-2 bg-chart-2/20 text-foreground",
                      tone === "open" && !on && "border-border bg-background text-foreground",
                      on && "border-primary bg-primary text-primary-foreground",
                      focused && "ring-2 ring-ring",
                    )}
                    style={{
                      boxShadow: on
                        ? `0 0 ${4 + gain * 12}px color-mix(in srgb, var(--primary) ${Math.round(40 + gain * 40)}%, transparent)`
                        : undefined,
                      transform: on && !reduced ? `scale(${(1 + gain * 0.06).toFixed(3)})` : undefined,
                      transition: reduced ? "none" : `transform ${ms}ms ease, box-shadow ${ms}ms ease`,
                    }}
                  >
                    {col}
                  </motion.div>
                </Fragment>
              )
            })}
          </Fragment>
        ))}
      </div>
      <p role="status" data-part="summary" className="mt-3 text-sm font-medium text-foreground">
        {summary}
      </p>
    </div>
  )
}
