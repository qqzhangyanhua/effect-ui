"use client"

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export type WaveSeconds = "8" | "15" | "30"

export interface WaveClipWindowProps {
  pace?: number
  intensity?: number
  seconds?: WaveSeconds
  play?: boolean
  className?: string
  onClipChange?: (clip: { start: number; seconds: number }) => void
}

const BARS = 40
const LANE = 300
const SPAN = 60
const START = 0.2

interface Box {
  left: number
  width: number
}

type WaveDrag = "body" | "start" | "end"
type WavePhase = "idle" | "dragging" | "playing" | "settle"

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function quantize(value: number) {
  return Math.round(clamp(value, 0, 1) * 100) / 100
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

export function waveSeconds(value: string | number) {
  const parsed = typeof value === "number" ? value : Number(value)
  if (parsed === 8 || parsed === 30) return parsed
  return 15
}

export function waveAmp(index: number) {
  const t = index / (BARS - 1)
  const amp = 0.22 + 0.78 * Math.abs(Math.sin(t * Math.PI * 3) * (0.55 + 0.45 * Math.cos(t * 17)))
  return Math.round(amp * 100) / 100
}

const AMPS = Array.from({ length: BARS }, (_, index) => waveAmp(index))

export function waveStartFromPointer(clientX: number, rect: Box, seconds: number) {
  const width = rect.width > 0 ? rect.width : LANE
  const left = rect.width > 0 ? rect.left : 0
  const frac = clamp(seconds, 8, 30) / SPAN
  return quantize(clamp((clientX - left) / width, 0, 1 - frac))
}

export function waveSecondsFromPointer(clientX: number, rect: Box, start: number) {
  const width = rect.width > 0 ? rect.width : LANE
  const left = rect.width > 0 ? rect.left : 0
  const edge = (clientX - left) / width
  const seconds = Math.round((edge - start) * SPAN)
  const max = Math.min(30, Math.round((1 - start) * SPAN))
  return clamp(seconds, 8, Math.max(8, max))
}

export function waveHot(index: number, start: number, seconds: number) {
  const at = (index + 0.5) / BARS
  return at >= start && at < start + seconds / SPAN
}

function capture(event: PointerEvent<Element>) {
  if (typeof event.currentTarget.setPointerCapture !== "function") return
  try {
    event.currentTarget.setPointerCapture(event.pointerId)
  } catch {
    // jsdom 不一定能捕获指针。
  }
}

export function WaveClipWindow({
  pace = 1,
  intensity = 0.7,
  seconds = "15",
  play = false,
  className,
  onClipChange,
}: WaveClipWindowProps) {
  const ref = useRef<HTMLDivElement>(null)
  const laneRef = useRef<HTMLDivElement>(null)
  const frame = useRef(0)
  const dragRef = useRef<WaveDrag | null>(null)
  const startRef = useRef(START)
  const widthRef = useRef(waveSeconds(seconds))
  const headRef = useRef(START)
  const onClipRef = useRef(onClipChange)
  const liveRef = useRef(false)
  const reducedRef = useRef(false)
  const rateRef = useRef(1)
  const playingRef = useRef(false)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const gain = clamp(intensity, 0, 1)
  const rate = rateOf(pace)
  const ease = reduced ? 0 : Math.round(160 / rate)
  const [start, setStart] = useState(START)
  const [widthSec, setWidthSec] = useState(() => waveSeconds(seconds))
  const [seenSeconds, setSeenSeconds] = useState(seconds)
  const [head, setHead] = useState(START)
  const [running, setRunning] = useState(play)
  const [seenPlay, setSeenPlay] = useState(play)
  const [drag, setDrag] = useState<WaveDrag | null>(null)
  const [rest, setRest] = useState<"idle" | "settle">("idle")
  if (seconds !== seenSeconds) {
    setSeenSeconds(seconds)
    setWidthSec(waveSeconds(seconds))
  }
  if (play !== seenPlay) {
    setSeenPlay(play)
    setRunning(play)
  }
  const playing = running && !reduced && drag === null
  const phase: WavePhase = drag ? (reduced ? "idle" : "dragging") : playing ? "playing" : reduced ? "idle" : rest

  useEffect(() => {
    startRef.current = start
    widthRef.current = widthSec
    onClipRef.current = onClipChange
    liveRef.current = live
    reducedRef.current = reduced
    rateRef.current = rate
    playingRef.current = playing
  }, [start, widthSec, onClipChange, live, reduced, rate, playing])

  function emit(nextStart: number, nextSeconds: number) {
    onClipRef.current?.({ start: nextStart, seconds: nextSeconds })
  }

  function commit(nextStart: number, nextSeconds: number) {
    const safeSeconds = clamp(Math.round(nextSeconds), 8, 30)
    const safeStart = quantize(clamp(nextStart, 0, 1 - safeSeconds / SPAN))
    startRef.current = safeStart
    widthRef.current = safeSeconds
    setStart(safeStart)
    setWidthSec(safeSeconds)
    if (headRef.current < safeStart || headRef.current > safeStart + safeSeconds / SPAN) {
      headRef.current = safeStart
      setHead(safeStart)
    }
    emit(safeStart, safeSeconds)
  }

  useEffect(() => {
    if (reduced || !live || !playing) {
      window.cancelAnimationFrame(frame.current)
      frame.current = 0
      return
    }
    let last = 0
    const tick = (now: number) => {
      if (!liveRef.current || reducedRef.current || !playingRef.current) {
        frame.current = 0
        return
      }
      const dt = now > last ? Math.min(0.05, (now - last) / 1000) : 1 / 12
      if (now > 0) last = now
      const span = Math.max(8 / SPAN, widthRef.current / SPAN)
      let local = (headRef.current - startRef.current) / span
      if (local < 0 || local >= 1) local = 0
      local += dt * 0.85 * rateRef.current
      if (local >= 1) local -= 1
      const next = startRef.current + local * span
      headRef.current = next
      setHead(next)
      frame.current = window.requestAnimationFrame(tick)
    }
    frame.current = window.requestAnimationFrame(tick)
    return () => {
      window.cancelAnimationFrame(frame.current)
      frame.current = 0
    }
  }, [reduced, live, playing])

  function box() {
    return laneRef.current?.getBoundingClientRect() ?? { left: 0, top: 0, width: 0, height: 0 }
  }

  function apply(kind: WaveDrag, clientX: number) {
    const rect = box()
    if (kind === "end") {
      commit(startRef.current, waveSecondsFromPointer(clientX, rect, startRef.current))
      return
    }
    if (kind === "start") {
      const end = startRef.current + widthRef.current / SPAN
      const moved = waveStartFromPointer(clientX, rect, 8)
      const nextSeconds = clamp(Math.round((end - moved) * SPAN), 8, 30)
      commit(end - nextSeconds / SPAN, nextSeconds)
      return
    }
    commit(waveStartFromPointer(clientX, rect, widthRef.current), widthRef.current)
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== undefined && event.button !== 0) return
    const node = event.target
    const edge = node instanceof HTMLElement ? node.dataset.edge : undefined
    const kind: WaveDrag = edge === "start" || edge === "end" ? edge : "body"
    dragRef.current = kind
    setDrag(kind)
    apply(kind, event.clientX)
    capture(event)
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return
    apply(dragRef.current, event.clientX)
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return
    apply(dragRef.current, event.clientX)
    dragRef.current = null
    setDrag(null)
    setRest(reduced ? "idle" : "settle")
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") commit(startRef.current + 0.02, widthRef.current)
    else if (event.key === "ArrowLeft") commit(startRef.current - 0.02, widthRef.current)
    else if (event.key === "]") commit(startRef.current, widthRef.current + 1)
    else if (event.key === "[") commit(startRef.current, widthRef.current - 1)
    else if (event.key === "Home") commit(0, widthRef.current)
    else if (event.key === "End") commit(1, widthRef.current)
    else return
    event.preventDefault()
    setRest(reduced ? "idle" : "settle")
  }

  return (
    <div
      ref={ref}
      data-slot="wave-clip-window"
      data-ritual="wave-window"
      data-pace={rate}
      data-intensity={gain}
      data-seconds={seconds}
      data-start={start.toFixed(2)}
      data-width={widthSec}
      data-head={head.toFixed(2)}
      data-play={running ? "on" : "off"}
      data-drag={drag ?? "none"}
      data-state={phase}
      data-ease={ease}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      className={cn(
        "w-full max-w-md rounded-3xl border border-border bg-card p-3 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <div className="mb-2 flex items-end justify-between gap-3">
        <p className="text-sm text-muted-foreground">Clip</p>
        <p role="status" className="text-sm font-semibold text-foreground">
          {widthSec}s
        </p>
      </div>
      <div ref={laneRef} data-part="lane" className="relative h-20">
        <svg data-part="wave" viewBox="0 0 300 80" className="h-20 w-full" aria-hidden>
          {AMPS.map((amp, index) => {
            const hot = waveHot(index, start, widthSec)
            const height = 8 + amp * 58
            return (
              <rect
                key={index}
                data-bar={index}
                data-hot={hot ? "on" : "off"}
                x={4 + index * 7.4}
                y={72 - height}
                width={4}
                height={height}
                rx={1.5}
                fill={hot ? "var(--foreground)" : "var(--muted-foreground)"}
                opacity={hot ? 0.45 + gain * 0.55 : 0.4}
              />
            )
          })}
        </svg>
        <div
          role="slider"
          aria-label="Clip window"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(start * 100)}
          aria-valuetext={`${widthSec} seconds`}
          tabIndex={0}
          data-part="window"
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="absolute inset-y-1 touch-none rounded-xl border border-foreground/70 bg-foreground/10 outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
          style={{
            left: `${start * 100}%`,
            width: `${(widthSec / SPAN) * 100}%`,
            boxShadow: `0 0 ${4 + gain * 10}px color-mix(in oklab, var(--foreground) 35%, transparent)`,
            transition: reduced ? "none" : `left ${ease}ms linear, width ${ease}ms linear`,
          }}
        >
          <span data-edge="start" className="absolute inset-y-0 left-0 w-3" />
          <span data-edge="end" className="absolute inset-y-0 right-0 w-3" />
          <span className="absolute -top-1 left-1/2 -translate-x-1/2 rounded-full bg-foreground px-1.5 text-[10px] text-background">{widthSec}s</span>
        </div>
        {running ? (
          <motion.span
            data-part="playhead"
            className="pointer-events-none absolute inset-y-0 w-0.5 bg-foreground motion-reduce:transition-none"
            style={{ left: `${head * 100}%` }}
          />
        ) : null}
      </div>
      <button
        type="button"
        onClick={() => setRunning((value) => !value)}
        className="mt-3 rounded-full border border-border px-3 py-1.5 text-sm text-foreground"
      >
        {running ? "Pause" : "Play"}
      </button>
    </div>
  )
}
