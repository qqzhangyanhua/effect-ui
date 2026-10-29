"use client"

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface TrimHandleSpanProps {
  pace?: number
  intensity?: number
  minSpan?: number
  showFilm?: boolean
  className?: string
  onValueChange?: (state: { start: number; end: number; t: number }) => void
}

const LANE = 320
const START = 0.18
const END = 0.74
const FILM = [22, 48, 70, 36, 58, 28, 76, 44, 62, 32]

type TrimDrag = "start" | "end" | "playhead"
type TrimEdge = "start" | "end" | "head"

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

export function quantize(value: number) {
  if (!Number.isFinite(value)) return 0
  return clamp(Math.round(value * 100) / 100, 0, 1)
}

export function trimMinSpan(value: number) {
  const raw = Number.isFinite(value) ? value : 0.08
  return quantize(clamp(raw, 0.04, 0.2))
}

export function trimStart(start: number, end: number, minSpan: number) {
  const span = trimMinSpan(minSpan)
  const limit = quantize(quantize(end) - span)
  return quantize(Math.min(quantize(start), Math.max(0, limit)))
}

export function trimEnd(start: number, end: number, minSpan: number) {
  const span = trimMinSpan(minSpan)
  const limit = quantize(quantize(start) + span)
  return quantize(Math.max(quantize(end), limit))
}

export function trimFit(start: number, end: number, minSpan: number) {
  const span = trimMinSpan(minSpan)
  const nextStart = quantize(start)
  const nextEnd = quantize(end)
  if (nextEnd - nextStart >= span) return { start: nextStart, end: nextEnd }
  if (nextStart + span <= 1) return { start: nextStart, end: quantize(nextStart + span) }
  return { start: quantize(1 - span), end: 1 }
}

export function trimFromPointer(clientX: number, rect: { left: number; width: number }) {
  const width = rect.width > 1 ? rect.width : LANE
  const left = rect.width > 1 ? rect.left : 0
  return quantize((clientX - left) / width)
}

function nudge(value: number, deltaCents: number) {
  return quantize((Math.round(quantize(value) * 100) + deltaCents) / 100)
}

function capture(event: PointerEvent<HTMLElement>) {
  if (typeof event.currentTarget.setPointerCapture !== "function") return
  try {
    event.currentTarget.setPointerCapture(event.pointerId)
  } catch {
    // jsdom 不一定能捕获指针。
  }
}

function readKind(target: EventTarget | null): TrimDrag {
  if (!(target instanceof Element)) return "playhead"
  const node = target.closest("[data-handle]")
  const handle = node instanceof HTMLElement ? node.dataset.handle : undefined
  if (handle === "start" || handle === "end") return handle
  return "playhead"
}

function formatClock(fraction: number) {
  const total = Math.round(clamp(fraction, 0, 1) * 12)
  return `0:${String(total).padStart(2, "0")}`
}

export function TrimHandleSpan({
  pace = 1,
  intensity = 0.7,
  minSpan = 0.08,
  showFilm = true,
  className,
  onValueChange,
}: TrimHandleSpanProps) {
  const ref = useRef<HTMLDivElement>(null)
  const laneRef = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const gain = clamp(intensity, 0, 1)
  const paceRate = rateOf(pace)
  const span = trimMinSpan(minSpan)
  const ms = reduced ? 0 : Math.round(180 / paceRate)
  const [start, setStart] = useState(START)
  const [end, setEnd] = useState(END)
  const [t, setT] = useState(START)
  const [drag, setDrag] = useState<TrimDrag | null>(null)
  const [running, setRunning] = useState(false)
  const [seenSpan, setSeenSpan] = useState(span)
  const startRef = useRef(START)
  const endRef = useRef(END)
  const tRef = useRef(START)
  const dragRef = useRef<TrimDrag | null>(null)
  const onValueRef = useRef(onValueChange)
  const playing = running && live && !reduced && drag === null
  const phase = drag ? (reduced ? "idle" : "dragging") : playing ? "playing" : "idle"

  if (seenSpan !== span) {
    const fit = trimFit(start, end, span)
    setSeenSpan(span)
    if (fit.start !== start) setStart(fit.start)
    if (fit.end !== end) setEnd(fit.end)
  }

  useEffect(() => {
    startRef.current = start
    endRef.current = end
    tRef.current = t
    onValueRef.current = onValueChange
  }, [start, end, t, onValueChange])

  useEffect(() => {
    if (!playing) return
    let frame = 0
    let stopped = false
    let last = 0
    const tick = (now: number) => {
      if (stopped) return
      const dt = now > last ? Math.min(0.05, (now - last) / 1000) : 1 / 12
      if (now > 0) last = now
      const a = startRef.current
      const b = endRef.current
      const width = Math.max(0.04, b - a)
      let cursor = tRef.current
      if (cursor < a || cursor > b) cursor = a
      cursor += dt * 0.36 * paceRate
      if (cursor > b) cursor = a + ((cursor - a) % width)
      tRef.current = cursor
      setT(cursor)
      onValueRef.current?.({ start: a, end: b, t: cursor })
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => {
      stopped = true
      window.cancelAnimationFrame(frame)
    }
  }, [playing, paceRate])

  function emit(nextStart: number, nextEnd: number, nextT: number) {
    onValueRef.current?.({ start: nextStart, end: nextEnd, t: nextT })
  }

  function commit(edge: TrimEdge, value: number) {
    let nextStart = startRef.current
    let nextEnd = endRef.current
    let nextT = tRef.current
    if (edge === "start") nextStart = trimStart(value, nextEnd, span)
    else if (edge === "end") nextEnd = trimEnd(nextStart, value, span)
    else nextT = quantize(value)
    if (nextStart === startRef.current && nextEnd === endRef.current && nextT === tRef.current) return
    startRef.current = nextStart
    endRef.current = nextEnd
    tRef.current = nextT
    setStart(nextStart)
    setEnd(nextEnd)
    setT(nextT)
    emit(nextStart, nextEnd, nextT)
  }

  function box() {
    const rect = laneRef.current?.getBoundingClientRect()
    if (rect && rect.width > 1) return { left: rect.left, width: rect.width }
    return { left: 0, width: LANE }
  }

  function applyDrag(kind: TrimDrag, clientX: number) {
    const at = trimFromPointer(clientX, box())
    if (kind === "start") commit("start", at)
    else if (kind === "end") commit("end", at)
    else commit("head", at)
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== undefined && event.button !== 0) return
    const kind = readKind(event.target)
    dragRef.current = kind
    setDrag(kind)
    applyDrag(kind, event.clientX)
    capture(event)
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return
    applyDrag(dragRef.current, event.clientX)
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return
    applyDrag(dragRef.current, event.clientX)
    dragRef.current = null
    setDrag(null)
  }

  function togglePlay() {
    if (reduced) {
      const next = endRef.current
      tRef.current = next
      setT(next)
      setRunning(false)
      emit(startRef.current, endRef.current, next)
      return
    }
    setRunning((value) => !value)
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const alt = event.altKey
    if (event.key === "[") commit("start", nudge(startRef.current, -2))
    else if (event.key === "]") commit("start", nudge(startRef.current, 2))
    else if (event.key === "{" || (alt && event.key === "ArrowLeft")) commit("end", nudge(endRef.current, -2))
    else if (event.key === "}" || (alt && event.key === "ArrowRight")) commit("end", nudge(endRef.current, 2))
    else if (event.key === "ArrowLeft") commit("head", nudge(tRef.current, -2))
    else if (event.key === "ArrowRight") commit("head", nudge(tRef.current, 2))
    else if (event.key === "Home") commit("head", startRef.current)
    else if (event.key === "End") commit("head", endRef.current)
    else if (event.key === " " && event.target === event.currentTarget) togglePlay()
    else return
    event.preventDefault()
  }

  const dim = 0.28 + gain * 0.55

  return (
    <div
      ref={ref}
      data-slot="trim-handle-span"
      data-ritual="trim-span"
      data-pace={paceRate}
      data-intensity={gain}
      data-start={start.toFixed(2)}
      data-end={end.toFixed(2)}
      data-t={t.toFixed(2)}
      data-span={(end - start).toFixed(2)}
      data-phase={phase}
      data-playing={playing ? "on" : "off"}
      data-running={running ? "on" : "off"}
      data-film={showFilm ? "on" : "off"}
      data-min-span={span.toFixed(2)}
      data-ease={ms}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      tabIndex={0}
      aria-label="Trim clip"
      onKeyDown={onKeyDown}
      className={cn(
        "w-full max-w-xl rounded-3xl border border-border bg-card p-4 text-card-foreground outline-none select-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
        className,
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-foreground">Trim clip</p>
        <p className="text-xs text-muted-foreground">
          {formatClock(t)} · {formatClock(end - start)}
        </p>
      </div>
      <div
        ref={laneRef}
        data-lane
        className="relative h-16 touch-none overflow-hidden rounded-xl bg-muted"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {showFilm ? (
          <div data-film className="pointer-events-none absolute inset-0 grid grid-cols-10">
            {FILM.map((stop, index) => (
              <span
                key={index}
                className="border-r border-background/40"
                style={{ background: `color-mix(in srgb, var(--primary) ${stop}%, var(--muted))` }}
              />
            ))}
          </div>
        ) : (
          <div data-film="flat" className="pointer-events-none absolute inset-0 bg-secondary" />
        )}
        <div className="pointer-events-none absolute inset-y-0 left-0 bg-background" style={{ width: `${start * 100}%`, opacity: dim }} />
        <div className="pointer-events-none absolute inset-y-0 right-0 bg-background" style={{ width: `${(1 - end) * 100}%`, opacity: dim }} />
        <motion.div
          data-window
          initial={false}
          animate={{ opacity: 1 }}
          transition={{ duration: reduced ? 0 : 0.16 / paceRate }}
          className="pointer-events-none absolute inset-y-0 border-y-2 border-primary motion-reduce:transition-none"
          style={{
            left: `${start * 100}%`,
            width: `${Math.max(0, end - start) * 100}%`,
            boxShadow: `inset 0 0 ${8 + gain * 16}px color-mix(in srgb, var(--primary) ${Math.round(18 + gain * 36)}%, transparent)`,
          }}
        />
        <button
          type="button"
          role="slider"
          aria-label="Trim start"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(start * 100)}
          data-handle="start"
          className="absolute inset-y-1 z-10 w-8 -translate-x-1/2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
          style={{ left: `${start * 100}%` }}
        >
          <span
            className="mx-auto block h-full w-3 rounded-md bg-foreground"
            style={{ boxShadow: `0 0 ${6 + gain * 12}px color-mix(in srgb, var(--primary) ${Math.round(24 + gain * 50)}%, transparent)` }}
          />
        </button>
        <button
          type="button"
          role="slider"
          aria-label="Trim end"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(end * 100)}
          data-handle="end"
          className="absolute inset-y-1 z-10 w-8 -translate-x-1/2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
          style={{ left: `${end * 100}%` }}
        >
          <span
            className="mx-auto block h-full w-3 rounded-md bg-foreground"
            style={{ boxShadow: `0 0 ${6 + gain * 12}px color-mix(in srgb, var(--primary) ${Math.round(24 + gain * 50)}%, transparent)` }}
          />
        </button>
        <button
          type="button"
          role="slider"
          aria-label="Playhead"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(t * 100)}
          data-handle="playhead"
          className="absolute inset-y-0 z-20 w-8 -translate-x-1/2 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          style={{ left: `${t * 100}%` }}
        >
          <span className="mx-auto block h-full w-0.5 bg-primary" />
        </button>
      </div>
      <div className="mt-3">
        <button
          type="button"
          onClick={togglePlay}
          className="h-9 rounded-full bg-primary px-4 text-sm text-primary-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {running && !reduced ? "Pause" : "Play"}
        </button>
      </div>
      <motion.span className="sr-only" aria-live="polite">
        {`Trim ${start.toFixed(2)} to ${end.toFixed(2)}`}
      </motion.span>
    </div>
  )
}
