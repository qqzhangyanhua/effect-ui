"use client"

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface SleepArcRangeProps {
  pace?: number
  intensity?: number
  snap?: boolean
  minHours?: number
  className?: string
  onRangeChange?: (range: { start: number; end: number }) => void
}

type SleepDrag = "start" | "end" | "body"
type SleepPhase = "idle" | "dragging" | "settle"

interface Box {
  left: number
  top: number
  width: number
  height: number
}

const BED = 23 * 60
const WAKE = 7 * 60

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function mod(value: number, base: number) {
  if (!Number.isFinite(value)) return 0
  return ((value % base) + base) % base
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

export function minSleepMinutes(hours: number) {
  const value = Number.isFinite(hours) ? Math.round(hours) : 4
  return clamp(value, 1, 8) * 60
}

export function sleepDuration(start: number, end: number) {
  return mod(end - start, 1440)
}

export function sleepClock(minutes: number) {
  const value = mod(Math.round(minutes), 1440)
  const hour = Math.floor(value / 60)
  const minute = value % 60
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
}

export function sleepLength(minutes: number) {
  const rounded = Math.round(minutes)
  const hour = Math.floor(rounded / 60)
  const minute = rounded % 60
  return `${hour}h ${minute}m`
}

export function sleepAria(minutes: number) {
  const rounded = Math.round(minutes)
  const hour = Math.floor(rounded / 60)
  const minute = rounded % 60
  if (minute === 0) return `Sleep range, ${hour} hours`
  return `Sleep range, ${hour} hours ${minute} minutes`
}

export function sleepClamp(start: number, end: number, minMinutes: number, moving: SleepDrag) {
  const min = clamp(minMinutes, 60, 480)
  let nextStart = mod(start, 1440)
  let nextEnd = mod(end, 1440)
  if (sleepDuration(nextStart, nextEnd) >= min) return { start: nextStart, end: nextEnd }
  if (moving === "start") nextStart = mod(nextEnd - min, 1440)
  else nextEnd = mod(nextStart + min, 1440)
  return { start: nextStart, end: nextEnd }
}

export function sleepPoint(minutes: number, radius = 86) {
  const theta = (mod(minutes, 1440) / 1440) * Math.PI * 2 - Math.PI / 2
  return {
    x: 120 + radius * Math.cos(theta),
    y: 120 + radius * Math.sin(theta),
  }
}

export function sleepPointerMinutes(x: number, y: number) {
  const angle = Math.atan2(y - 120, x - 120)
  const clock = mod(angle + Math.PI / 2, Math.PI * 2)
  return Math.round((clock / (Math.PI * 2)) * 1440) % 1440
}

export function sleepFromPointer(clientX: number, clientY: number, rect: Box) {
  const width = rect.width > 0 ? rect.width : 240
  const height = rect.height > 0 ? rect.height : 240
  const left = rect.width > 0 ? rect.left : 0
  const top = rect.height > 0 ? rect.top : 0
  const x = ((clientX - left) / width) * 240
  const y = ((clientY - top) / height) * 240
  return sleepPointerMinutes(x, y)
}

function shortest(from: number, to: number) {
  let delta = mod(to - from, 1440)
  if (delta > 720) delta -= 1440
  return delta
}

function arcPath(start: number, end: number) {
  const a = sleepPoint(start)
  const b = sleepPoint(end)
  const large = sleepDuration(start, end) > 720 ? 1 : 0
  return `M ${a.x.toFixed(1)} ${a.y.toFixed(1)} A 86 86 0 ${large} 1 ${b.x.toFixed(1)} ${b.y.toFixed(1)}`
}

function capture(event: PointerEvent<Element>) {
  if (typeof event.currentTarget.setPointerCapture !== "function") return
  try {
    event.currentTarget.setPointerCapture(event.pointerId)
  } catch {
    // jsdom 不一定能捕获指针。
  }
}

export function SleepArcRange({
  pace = 1,
  intensity = 0.7,
  snap = true,
  minHours = 4,
  className,
  onRangeChange,
}: SleepArcRangeProps) {
  const ref = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const frame = useRef(0)
  const startRef = useRef(BED)
  const endRef = useRef(WAKE)
  const dragRef = useRef<{ mode: SleepDrag; origin: number; start: number; end: number } | null>(null)
  const onRangeRef = useRef(onRangeChange)
  const liveRef = useRef(false)
  const reducedRef = useRef(false)
  const snapRef = useRef(snap)
  const minRef = useRef(minSleepMinutes(minHours))
  const rateRef = useRef(1)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const gain = clamp(intensity, 0, 1)
  const rate = rateOf(pace)
  const limit = minSleepMinutes(minHours)
  const ease = reduced ? 0 : Math.round(200 / rate)
  const [start, setStart] = useState(BED)
  const [end, setEnd] = useState(WAKE)
  const [phase, setPhase] = useState<SleepPhase>("idle")
  const [drag, setDrag] = useState<SleepDrag | "none">("none")
  const minutes = Math.round(sleepDuration(start, end))
  const bed = sleepPoint(start)
  const wake = sleepPoint(end)

  useEffect(() => {
    onRangeRef.current = onRangeChange
    liveRef.current = live
    reducedRef.current = reduced
    snapRef.current = snap
    minRef.current = limit
    rateRef.current = rate
  }, [onRangeChange, live, reduced, snap, limit, rate])

  function publish(nextStart: number, nextEnd: number, nextPhase: SleepPhase, nextDrag: SleepDrag | "none") {
    const safeStart = mod(nextStart, 1440)
    const safeEnd = mod(nextEnd, 1440)
    startRef.current = safeStart
    endRef.current = safeEnd
    setStart(safeStart)
    setEnd(safeEnd)
    setPhase(nextPhase)
    setDrag(nextDrag)
    onRangeRef.current?.({ start: Math.round(safeStart) % 1440, end: Math.round(safeEnd) % 1440 })
  }

  function stop() {
    window.cancelAnimationFrame(frame.current)
    frame.current = 0
  }

  function glide(targetStart: number, targetEnd: number) {
    stop()
    const fromStart = startRef.current
    const fromEnd = endRef.current
    const deltaStart = shortest(fromStart, targetStart)
    const deltaEnd = shortest(fromEnd, targetEnd)
    if (reducedRef.current || !liveRef.current || (Math.abs(deltaStart) < 1 && Math.abs(deltaEnd) < 1)) {
      publish(targetStart, targetEnd, reducedRef.current ? "idle" : "settle", "none")
      return
    }
    publish(fromStart, fromEnd, "settle", "none")
    let step = 0
    const total = Math.max(4, Math.round(8 / rateRef.current))
    const tick = () => {
      if (!liveRef.current) {
        setPhase("idle")
        setDrag("none")
        frame.current = 0
        return
      }
      step += 1
      if (step >= total) {
        publish(targetStart, targetEnd, "settle", "none")
        frame.current = 0
        return
      }
      publish(mod(fromStart + deltaStart * (step / total), 1440), mod(fromEnd + deltaEnd * (step / total), 1440), "settle", "none")
      frame.current = window.requestAnimationFrame(tick)
    }
    frame.current = window.requestAnimationFrame(tick)
  }

  useEffect(() => {
    if (live) return
    stop()
    queueMicrotask(() => {
      if (liveRef.current) return
      setPhase((current) => (current === "idle" ? current : "idle"))
      setDrag("none")
    })
  }, [live])

  useEffect(() => stop, [])

  function read(event: PointerEvent<Element>) {
    const rect = ringRef.current?.getBoundingClientRect()
    return sleepFromPointer(event.clientX, event.clientY, rect ?? { left: 0, top: 0, width: 0, height: 0 })
  }

  function onHandleDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== undefined && event.button !== 0) return
    const mode = event.currentTarget.dataset.handle === "bedtime" ? "start" : "end"
    stop()
    const minutesAt = read(event)
    dragRef.current = { mode, origin: minutesAt, start: startRef.current, end: endRef.current }
    const next = sleepClamp(
      mode === "start" ? minutesAt : startRef.current,
      mode === "end" ? minutesAt : endRef.current,
      minRef.current,
      mode,
    )
    publish(next.start, next.end, reducedRef.current ? "idle" : "dragging", mode)
    capture(event)
  }

  function onBodyDown(event: PointerEvent<SVGPathElement>) {
    if (event.button !== undefined && event.button !== 0) return
    stop()
    const minutesAt = read(event)
    dragRef.current = { mode: "body", origin: minutesAt, start: startRef.current, end: endRef.current }
    setPhase(reducedRef.current ? "idle" : "dragging")
    setDrag("body")
    capture(event)
  }

  function onMove(event: PointerEvent<Element>) {
    const currentDrag = dragRef.current
    if (!currentDrag) return
    const minutesAt = read(event)
    if (currentDrag.mode === "body") {
      let delta = minutesAt - currentDrag.origin
      if (delta > 720) delta -= 1440
      if (delta < -720) delta += 1440
      publish(mod(currentDrag.start + delta, 1440), mod(currentDrag.end + delta, 1440), reducedRef.current ? "idle" : "dragging", "body")
      return
    }
    const next = sleepClamp(
      currentDrag.mode === "start" ? minutesAt : currentDrag.start,
      currentDrag.mode === "end" ? minutesAt : currentDrag.end,
      minRef.current,
      currentDrag.mode,
    )
    publish(next.start, next.end, reducedRef.current ? "idle" : "dragging", currentDrag.mode)
  }

  function onUp(event: PointerEvent<Element>) {
    const currentDrag = dragRef.current
    if (!currentDrag) return
    dragRef.current = null
    const minutesAt = read(event)
    if (currentDrag.mode === "body") {
      let delta = minutesAt - currentDrag.origin
      if (delta > 720) delta -= 1440
      if (delta < -720) delta += 1440
      if (snapRef.current) delta = Math.round(delta / 15) * 15
      glide(mod(currentDrag.start + delta, 1440), mod(currentDrag.end + delta, 1440))
      return
    }
    const snapped = snapRef.current ? mod(Math.round(minutesAt / 15) * 15, 1440) : minutesAt
    const next = sleepClamp(
      currentDrag.mode === "start" ? snapped : currentDrag.start,
      currentDrag.mode === "end" ? snapped : currentDrag.end,
      minRef.current,
      currentDrag.mode,
    )
    glide(next.start, next.end)
  }

  function stepHandle(mode: "start" | "end", direction: number) {
    stop()
    dragRef.current = null
    const delta = (snapRef.current ? 15 : 10) * direction
    const moved = mod((mode === "start" ? startRef.current : endRef.current) + delta, 1440)
    const next = sleepClamp(
      mode === "start" ? moved : startRef.current,
      mode === "end" ? moved : endRef.current,
      minRef.current,
      mode,
    )
    publish(next.start, next.end, reducedRef.current ? "idle" : "settle", "none")
  }

  function onHandleKey(event: KeyboardEvent<HTMLDivElement>) {
    const mode = event.currentTarget.dataset.handle === "bedtime" ? "start" : "end"
    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault()
      stepHandle(mode, 1)
    } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault()
      stepHandle(mode, -1)
    }
  }

  const handleClass =
    "absolute size-11 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background outline-none focus-visible:ring-2 focus-visible:ring-ring"

  return (
    <div
      ref={ref}
      role="group"
      aria-label={sleepAria(minutes)}
      data-slot="sleep-arc-range"
      data-ritual="sleep-arc"
      data-pace={rate}
      data-intensity={gain}
      data-snap={snap ? "on" : "off"}
      data-min={limit / 60}
      data-start={Math.round(start) % 1440}
      data-end={Math.round(end) % 1440}
      data-duration={minutes}
      data-state={phase}
      data-drag={drag}
      data-ease={ease}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      className={cn(
        "w-full max-w-md rounded-3xl border border-border bg-card p-3 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <div ref={ringRef} className="relative mx-auto size-60 touch-none">
        <svg viewBox="0 0 240 240" className="h-full w-full">
          <circle cx={120} cy={120} r={86} fill="none" stroke="var(--border)" strokeWidth={10} />
          <motion.path
            data-part="arc"
            d={arcPath(start, end)}
            fill="none"
            stroke="var(--chart-2)"
            strokeWidth={10 + gain * 6}
            strokeLinecap="round"
            className="motion-reduce:transition-none"
            style={{ transition: reduced ? "none" : `d ${ease}ms linear` }}
            onPointerDown={onBodyDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
          />
        </svg>
        <div
          role="slider"
          aria-label="Bedtime"
          aria-valuemin={0}
          aria-valuemax={1439}
          aria-valuenow={Math.round(start) % 1440}
          aria-valuetext={sleepClock(start)}
          tabIndex={0}
          data-handle="bedtime"
          onKeyDown={onHandleKey}
          onPointerDown={onHandleDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          className={cn(handleClass, "bg-chart-4")}
          style={{ left: `${(bed.x / 240) * 100}%`, top: `${(bed.y / 240) * 100}%` }}
        >
          <span data-glyph="moon" className="mx-auto block size-3 rounded-full bg-background" />
        </div>
        <div
          role="slider"
          aria-label="Wake"
          aria-valuemin={0}
          aria-valuemax={1439}
          aria-valuenow={Math.round(end) % 1440}
          aria-valuetext={sleepClock(end)}
          tabIndex={0}
          data-handle="wake"
          onKeyDown={onHandleKey}
          onPointerDown={onHandleDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          className={cn(handleClass, "bg-chart-1")}
          style={{ left: `${(wake.x / 240) * 100}%`, top: `${(wake.y / 240) * 100}%` }}
        >
          <span data-glyph="sun" className="mx-auto block size-3 rounded-full border-2 border-background" />
        </div>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <p data-length className="text-2xl font-semibold text-foreground">
            {sleepLength(minutes)}
          </p>
        </div>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 text-center">
        <div>
          <p className="text-xs text-muted-foreground">Bedtime</p>
          <p data-bedtime className="text-lg font-semibold text-foreground">
            {sleepClock(start)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Wake</p>
          <p data-wake className="text-lg font-semibold text-foreground">
            {sleepClock(end)}
          </p>
        </div>
      </div>
    </div>
  )
}
