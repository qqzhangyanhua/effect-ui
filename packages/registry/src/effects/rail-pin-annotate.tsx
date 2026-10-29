"use client"

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

/** Inspired by Paired Timeline and Life Reset (via Mobbin), original implementation. */
export interface RailPinAnnotateProps {
  pace?: number
  intensity?: number
  snap?: boolean
  oneOpen?: boolean
  className?: string
  onValueChange?: (state: { activePin: number | null; pins: { at: number }[] }) => void
}

export interface RailPin {
  id: string
  at: number
  label: string
  body: string
}

export const RAIL_PINS: readonly RailPin[] = [
  { id: "a", at: 0.16, label: "Milestone A", body: "A mark on the early stretch." },
  { id: "b", at: 0.48, label: "Milestone B", body: "A mark near the middle." },
  { id: "c", at: 0.78, label: "Milestone C", body: "A mark toward the end." },
]

const LANE = 320

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

export function snapAt(value: number, snap: boolean) {
  const next = quantize(clamp(value, 0, 1))
  if (!snap) return next
  return quantize(Math.round(next * 10) / 10)
}

export function nudgeAt(value: number, direction: -1 | 1, snap: boolean) {
  const step = snap ? 0.1 : 0.02
  return snapAt(value + direction * step, snap)
}

function capture(event: PointerEvent<HTMLElement>) {
  if (typeof event.currentTarget.setPointerCapture !== "function") return
  try {
    event.currentTarget.setPointerCapture(event.pointerId)
  } catch {
    // jsdom 不一定能捕获指针。
  }
}

export function RailPinAnnotate({
  pace = 1,
  intensity = 0.7,
  snap = false,
  oneOpen = true,
  className,
  onValueChange,
}: RailPinAnnotateProps) {
  const ref = useRef<HTMLDivElement>(null)
  const laneRef = useRef<HTMLDivElement>(null)
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([])
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const gain = clamp(intensity, 0, 1)
  const paceRate = rateOf(pace)
  const ms = reduced ? 0 : Math.round(180 / paceRate)
  const [ats, setAts] = useState(() => RAIL_PINS.map((pin) => pin.at))
  const [active, setActive] = useState<number | null>(null)
  const [open, setOpen] = useState<number[]>([])
  const [breath, setBreath] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [seenOne, setSeenOne] = useState(oneOpen)
  const dragRef = useRef<{ index: number; x: number; pointerId: number; moved: boolean } | null>(null)
  const skipClickRef = useRef(false)
  const atsRef = useRef(ats)
  const activeRef = useRef(active)
  const openRef = useRef(open)
  const onValueRef = useRef(onValueChange)
  const breathing = live && !reduced

  if (seenOne !== oneOpen) {
    setSeenOne(oneOpen)
    if (oneOpen && open.length > 1) {
      const keep = active !== null && open.includes(active) ? active : open[open.length - 1]
      setOpen(keep === undefined ? [] : [keep])
    }
  }

  useEffect(() => {
    atsRef.current = ats
    activeRef.current = active
    openRef.current = open
    onValueRef.current = onValueChange
  }, [ats, active, open, onValueChange])

  useEffect(() => {
    if (!breathing) return
    let frame = 0
    let stopped = false
    let last = 0
    const tick = (now: number) => {
      if (stopped) return
      const dt = now > last ? Math.min(0.05, (now - last) / 1000) : 1 / 12
      if (now > 0) last = now
      setBreath((value) => (value + dt * 0.4 * paceRate) % 1)
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => {
      stopped = true
      window.cancelAnimationFrame(frame)
    }
  }, [breathing, paceRate])

  function emit(nextActive: number | null, nextAts: readonly number[]) {
    onValueRef.current?.({
      activePin: nextActive,
      pins: nextAts.map((at) => ({ at })),
    })
  }

  function updateAt(index: number, value: number) {
    const next = snapAt(value, snap)
    const copy = atsRef.current.slice()
    copy[index] = next
    atsRef.current = copy
    activeRef.current = index
    setAts(copy)
    setActive(index)
    emit(index, copy)
  }

  function toggle(index: number) {
    const has = openRef.current.includes(index)
    const next = has ? openRef.current.filter((item) => item !== index) : oneOpen ? [index] : [...openRef.current, index]
    openRef.current = next
    activeRef.current = index
    setActive(index)
    setOpen(next)
    emit(index, atsRef.current)
    buttonRefs.current[index]?.focus()
  }

  function move(index: number) {
    const count = RAIL_PINS.length
    const next = ((index % count) + count) % count
    activeRef.current = next
    setActive(next)
    buttonRefs.current[next]?.focus()
    emit(next, atsRef.current)
  }

  function atFrom(clientX: number) {
    const rect = laneRef.current?.getBoundingClientRect()
    const width = rect && rect.width > 1 ? rect.width : LANE
    const left = rect && rect.width > 1 ? rect.left : 0
    return (clientX - left) / width
  }

  function onPointerDown(event: PointerEvent<HTMLButtonElement>, index: number) {
    if (event.button !== undefined && event.button !== 0) return
    dragRef.current = { index, x: event.clientX, pointerId: event.pointerId, moved: false }
    activeRef.current = index
    setActive(index)
    setDragging(true)
    capture(event)
  }

  function samePointer(event: PointerEvent<HTMLButtonElement>, pointerId: number) {
    return event.pointerId === pointerId || Number.isNaN(event.pointerId)
  }

  function onPointerMove(event: PointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current
    if (!drag || !samePointer(event, drag.pointerId)) return
    if (Math.abs(event.clientX - drag.x) > 3) drag.moved = true
    if (!drag.moved) return
    updateAt(drag.index, atFrom(event.clientX))
  }

  function focusedPin(event: KeyboardEvent<HTMLDivElement>) {
    const target = event.target
    if (!(target instanceof Element)) return activeRef.current
    const id = target.closest("[data-pin]")?.getAttribute("data-pin")
    const index = RAIL_PINS.findIndex((pin) => pin.id === id)
    return index >= 0 ? index : activeRef.current
  }

  function onPointerUp(event: PointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current
    if (!drag || !samePointer(event, drag.pointerId)) return
    if (drag.moved) {
      updateAt(drag.index, atFrom(event.clientX))
      skipClickRef.current = true
    }
    dragRef.current = null
    setDragging(false)
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const focused = focusedPin(event)
    if (event.key === "ArrowRight" || event.key === "ArrowDown") move((focused ?? -1) + 1)
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") move((focused ?? 0) - 1)
    else if (event.key === "Home") move(0)
    else if (event.key === "End") move(RAIL_PINS.length - 1)
    else if (event.key === "Enter" || event.key === " ") toggle(focused ?? 0)
    else if (event.key === "[") {
      const index = focused ?? 0
      updateAt(index, nudgeAt(atsRef.current[index] ?? 0, -1, snap))
    } else if (event.key === "]") {
      const index = focused ?? 0
      updateAt(index, nudgeAt(atsRef.current[index] ?? 0, 1, snap))
    } else return
    event.preventDefault()
  }

  const wave = breathing ? 0.5 + 0.5 * Math.sin(breath * Math.PI * 2) : 0
  const openLabel = open.length === 0 ? "Ready" : RAIL_PINS[open[open.length - 1] ?? 0]?.label

  return (
    <div
      ref={ref}
      data-slot="rail-pin-annotate"
      data-ritual="rail-pin"
      data-pace={paceRate}
      data-intensity={gain}
      data-snap={snap ? "on" : "off"}
      data-one={oneOpen ? "on" : "off"}
      data-active={active === null ? "none" : String(active)}
      data-open-count={open.length}
      data-ats={ats.map((at) => at.toFixed(2)).join(",")}
      data-breath={breath.toFixed(2)}
      data-playing={breathing ? "on" : "off"}
      data-phase={dragging ? "dragging" : "idle"}
      data-ease={ms}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      tabIndex={0}
      role="group"
      aria-label="Milestone rail"
      onKeyDown={onKeyDown}
      className={cn(
        "w-full max-w-xl rounded-3xl border border-border bg-card p-4 text-card-foreground outline-none select-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
        className,
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-foreground">Milestones</p>
        <p className="text-xs text-muted-foreground">{open.length} open</p>
      </div>
      <div className="relative pt-24">
        {RAIL_PINS.map((pin, index) =>
          open.includes(index) ? (
            <div
              key={pin.id}
              data-callout={pin.id}
              role="note"
              className="absolute z-20 w-44 rounded-xl border border-border bg-popover px-3 py-2 text-popover-foreground shadow-sm motion-reduce:transition-none"
              style={{ left: `${clamp((ats[index] ?? pin.at) * 100, 8, 78)}%`, top: 8 + (oneOpen ? 0 : index * 8) }}
            >
              <p className="text-sm font-medium">{pin.label}</p>
              <p className="text-xs text-muted-foreground">{pin.body}</p>
            </div>
          ) : null,
        )}
        <div ref={laneRef} data-lane="" className="relative h-16">
          <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border" />
          {snap
            ? Array.from({ length: 11 }, (_, tick) => (
                <span
                  key={tick}
                  aria-hidden="true"
                  className="absolute top-1/2 h-2 w-px -translate-y-1/2 bg-border"
                  style={{ left: `${tick * 10}%` }}
                />
              ))
            : null}
          {RAIL_PINS.map((pin, index) => {
            const at = ats[index] ?? pin.at
            const scale = 1 + wave * (index === active ? 0.08 : 0.035) * (0.35 + gain)
            return (
              <button
                key={pin.id}
                ref={(node) => {
                  buttonRefs.current[index] = node
                }}
                type="button"
                aria-label={pin.label}
                aria-expanded={open.includes(index)}
                data-pin={pin.id}
                onPointerDown={(event) => onPointerDown(event, index)}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                onClick={() => {
                  if (skipClickRef.current) {
                    skipClickRef.current = false
                    return
                  }
                  toggle(index)
                }}
                className="absolute top-1/2 z-10 size-11 -translate-x-1/2 -translate-y-1/2 touch-none rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
                style={{
                  left: `${at * 100}%`,
                  transition: reduced || dragging ? "none" : `left ${ms}ms ease`,
                }}
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-1 rounded-full border border-primary bg-background motion-reduce:transition-none"
                  style={{
                    transform: `scale(${scale})`,
                    boxShadow:
                      index === active
                        ? `0 0 0 2px var(--primary), 0 0 ${4 + gain * 8}px color-mix(in srgb, var(--primary) ${Math.round(28 + gain * 40)}%, transparent)`
                        : undefined,
                  }}
                />
                <span aria-hidden="true" className="absolute inset-4 rounded-full bg-primary" />
              </button>
            )
          })}
        </div>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Drag a pin. Arrows move. Enter opens. Brackets nudge.</p>
      <p className="sr-only" aria-live="polite">
        {openLabel}
      </p>
    </div>
  )
}
