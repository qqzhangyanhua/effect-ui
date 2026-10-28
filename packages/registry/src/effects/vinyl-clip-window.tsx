"use client"

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface VinylClipWindowProps {
  pace?: number
  intensity?: number
  spin?: boolean
  window?: number
  className?: string
  onRangeChange?: (start: number, end: number) => void
}

type Phase = "idle" | "scrubbing"
type DragMode = "move" | "start" | "end"

interface ClipRange {
  start: number
  end: number
}

const TRACK = 280
const MIN_SPAN = 0.08
const DURATION = 32
const BARS = 48

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

function spanOf(span: number) {
  return clamp(span, 0.15, 0.7)
}

function round3(value: number) {
  return Math.round(value * 1000) / 1000
}

function rangeFromWindow(span: number): ClipRange {
  const width = spanOf(span)
  const start = Math.min(0.2, 1 - width)
  return { start: round3(start), end: round3(start + width) }
}

function clampRange(start: number, end: number): ClipRange {
  let s = start
  let e = end
  if (e - s < MIN_SPAN) e = s + MIN_SPAN
  if (s < 0) {
    e -= s
    s = 0
  }
  if (e > 1) {
    s -= e - 1
    e = 1
  }
  s = clamp(s, 0, 1 - MIN_SPAN)
  e = clamp(e, s + MIN_SPAN, 1)
  return { start: round3(s), end: round3(e) }
}

function timecode(fraction: number) {
  const seconds = Math.round(clamp(fraction, 0, 1) * DURATION)
  const mins = Math.floor(seconds / 60)
  const rest = seconds % 60
  return `${mins}:${rest.toString().padStart(2, "0")}`
}

function waveHeight(index: number, gain: number) {
  const wave = Math.abs(Math.sin(index * 0.62) * 0.65 + Math.cos(index * 0.21) * 0.35)
  return Math.round(10 + wave * (18 + gain * 28))
}

function modeOf(target: EventTarget | null): DragMode | "track" {
  const element = target instanceof Element ? target : target instanceof Node ? target.parentElement : null
  const part = element?.closest("[data-part]")?.getAttribute("data-part")
  if (part === "start-handle") return "start"
  if (part === "end-handle") return "end"
  if (part === "window") return "move"
  return "track"
}

export function VinylClipWindow({
  pace = 1,
  intensity = 0.65,
  spin = true,
  window: clipWindow = 0.35,
  className,
  onRangeChange,
}: VinylClipWindowProps) {
  const ref = useRef<HTMLDivElement>(null)
  const spinFrame = useRef(0)
  const dragRef = useRef<DragMode | null>(null)
  const originRef = useRef({ x: 0, start: 0.2, end: 0.55 })
  const onRangeRef = useRef(onRangeChange)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const reducedRef = useRef(reduced)
  const liveRef = useRef(live)
  const rateRef = useRef(1)
  const playingRef = useRef(spin)
  const gain = clamp(intensity, 0, 1)
  const rate = rateOf(pace)
  const span = spanOf(clipWindow)
  const [playing, setPlaying] = useState(spin)
  const [seenSpin, setSeenSpin] = useState(spin)
  const [range, setRange] = useState(() => rangeFromWindow(span))
  const [seenSpan, setSeenSpan] = useState(span)
  const [phase, setPhase] = useState<Phase>("idle")
  const [angle, setAngle] = useState(0)
  const rangeRef = useRef(range)
  let activePlaying = playing
  let activeRange = range
  if (spin !== seenSpin) {
    activePlaying = spin
    setSeenSpin(spin)
    setPlaying(spin)
  }
  if (span !== seenSpan) {
    activeRange = rangeFromWindow(span)
    setSeenSpan(span)
    setRange(activeRange)
  }
  const spinning = activePlaying && !reduced && live
  const state = phase === "scrubbing" ? "scrubbing" : spinning ? "spinning" : activePlaying ? "idle" : "paused"
  const shift = Math.floor(angle / 20)

  useEffect(() => {
    reducedRef.current = reduced
    liveRef.current = live
    rateRef.current = rate
    playingRef.current = activePlaying
    rangeRef.current = activeRange
    onRangeRef.current = onRangeChange
  }, [reduced, live, rate, activePlaying, activeRange, onRangeChange])

  useEffect(() => {
    if (!playing || reduced || !live) {
      window.cancelAnimationFrame(spinFrame.current)
      spinFrame.current = 0
      return
    }
    const tick = () => {
      if (!liveRef.current || reducedRef.current || !playingRef.current) {
        spinFrame.current = 0
        return
      }
      setAngle((value) => (value + 3.2 * rateRef.current) % 360)
      spinFrame.current = window.requestAnimationFrame(tick)
    }
    spinFrame.current = window.requestAnimationFrame(tick)
    return () => {
      window.cancelAnimationFrame(spinFrame.current)
      spinFrame.current = 0
    }
  }, [playing, reduced, live])

  function publish(next: ClipRange, scrub: boolean) {
    if (next.start === rangeRef.current.start && next.end === rangeRef.current.end) return
    rangeRef.current = next
    setRange(next)
    onRangeRef.current?.(next.start, next.end)
    if (scrub && !reducedRef.current && liveRef.current) setPhase("scrubbing")
  }

  function shiftRange(delta: number) {
    const width = rangeRef.current.end - rangeRef.current.start
    publish(clampRange(rangeRef.current.start + delta, rangeRef.current.start + delta + width), false)
  }

  function resizeEnd(delta: number) {
    publish(clampRange(rangeRef.current.start, rangeRef.current.end + delta), false)
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault()
      shiftRange(0.05)
    } else if (event.key === "ArrowLeft") {
      event.preventDefault()
      shiftRange(-0.05)
    } else if (event.key === "]") {
      event.preventDefault()
      resizeEnd(0.05)
    } else if (event.key === "[") {
      event.preventDefault()
      resizeEnd(-0.05)
    }
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== undefined && event.button !== 0) return
    const mode = modeOf(event.target)
    if (mode === "track") return
    dragRef.current = mode
    originRef.current = { x: event.clientX, start: rangeRef.current.start, end: rangeRef.current.end }
    if (!reducedRef.current && liveRef.current) setPhase("scrubbing")
    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      // jsdom 没有指针捕获。
    }
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return
    const dx = (event.clientX - originRef.current.x) / TRACK
    const { start, end } = originRef.current
    if (dragRef.current === "move") publish(clampRange(start + dx, end + dx), true)
    else if (dragRef.current === "start") publish(clampRange(Math.min(start + dx, end - MIN_SPAN), end), true)
    else publish(clampRange(start, Math.max(end + dx, start + MIN_SPAN)), true)
  }

  function onPointerUp() {
    if (!dragRef.current) return
    dragRef.current = null
    setPhase("idle")
  }

  function setBound(which: "start" | "end", raw: number) {
    const value = raw / 1000
    if (which === "start") publish(clampRange(value, rangeRef.current.end), false)
    else publish(clampRange(rangeRef.current.start, value), false)
  }

  const label = `${timecode(activeRange.start)} 到 ${timecode(activeRange.end)}`

  return (
    <div
      ref={ref}
      data-slot="vinyl-clip-window"
      data-ritual="vinyl-clip"
      data-layout="disc-window"
      data-pace={rate}
      data-intensity={gain}
      data-spin={spin ? "on" : "off"}
      data-window={span}
      data-start={activeRange.start.toFixed(3)}
      data-end={activeRange.end.toFixed(3)}
      data-playing={activePlaying ? "yes" : "no"}
      data-spinning={spinning ? "yes" : "no"}
      data-angle={Math.round(reduced ? 0 : angle)}
      data-state={state}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      className={cn(
        "grid w-full max-w-md gap-4 rounded-3xl border border-border bg-card p-4 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <div className="grid place-items-center">
        <motion.div
          data-part="disc"
          data-label="Clip A"
          initial={false}
          animate={{ rotate: reduced ? 0 : angle }}
          transition={{ duration: 0 }}
          className="grid size-40 place-items-center rounded-full border border-border text-background motion-reduce:transform-none"
          style={{
            background: "repeating-radial-gradient(circle at center, var(--foreground) 0 2px, color-mix(in oklab, var(--foreground) 72%, var(--background)) 2px 5px)",
          }}
        >
          <div className="grid size-16 place-items-center rounded-full bg-card text-xs font-medium text-card-foreground">Clip A</div>
        </motion.div>
      </div>
      <div className="flex items-center justify-between gap-3">
        <button type="button" className="rounded-full border border-border px-3 py-1 text-sm text-foreground" onClick={() => setPlaying((value) => !value)}>
          {activePlaying ? "暂停" : "播放"}
        </button>
        <p data-part="timecode" className="font-mono text-sm text-muted-foreground">
          {timecode(activeRange.start)} – {timecode(activeRange.end)}
        </p>
      </div>
      <div
        data-part="track"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="relative h-16 touch-none overflow-hidden rounded-xl bg-muted text-foreground"
      >
        <svg data-part="wave" data-shift={shift} viewBox={`0 0 ${BARS * 10} 64`} className="pointer-events-none h-full w-full" aria-hidden>
          {Array.from({ length: BARS }, (_, index) => {
            const height = waveHeight(index + shift, gain)
            return <rect key={index} x={index * 10 + 2} y={(64 - height) / 2} width={6} height={height} rx={2} fill="currentColor" opacity={0.4 + gain * 0.55} />
          })}
        </svg>
        <div
          data-part="window"
          role="slider"
          aria-label="剪辑选区"
          aria-valuemin={0}
          aria-valuemax={1000}
          aria-valuenow={Math.round(activeRange.start * 1000)}
          aria-valuetext={label}
          tabIndex={0}
          onKeyDown={onKeyDown}
          className="absolute inset-y-1 rounded-md border-primary bg-primary/25 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          style={{
            left: `${activeRange.start * 100}%`,
            width: `${(activeRange.end - activeRange.start) * 100}%`,
            borderWidth: `${Math.round(2 + gain * 2)}px`,
          }}
        >
          <span data-part="start-handle" className="absolute inset-y-0 left-0 w-3 cursor-ew-resize bg-primary/70" />
          <span data-part="end-handle" className="absolute inset-y-0 right-0 w-3 cursor-ew-resize bg-primary/70" />
        </div>
      </div>
      {reduced ? (
        <div className="grid gap-2">
          <label className="grid gap-1 text-xs text-muted-foreground">
            起点
            <input
              aria-label="起点"
              type="range"
              min={0}
              max={1000}
              value={Math.round(activeRange.start * 1000)}
              onChange={(event) => setBound("start", Number(event.target.value))}
            />
          </label>
          <label className="grid gap-1 text-xs text-muted-foreground">
            终点
            <input
              aria-label="终点"
              type="range"
              min={0}
              max={1000}
              value={Math.round(activeRange.end * 1000)}
              onChange={(event) => setBound("end", Number(event.target.value))}
            />
          </label>
        </div>
      ) : null}
      <p role="status" className="sr-only">
        {`选区 ${label}`}
      </p>
    </div>
  )
}
