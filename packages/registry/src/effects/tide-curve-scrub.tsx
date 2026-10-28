"use client"

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface TideCurveScrubProps {
  pace?: number
  intensity?: number
  marks?: boolean
  play?: boolean
  className?: string
  onValueChange?: (t: number) => void
}

const START = 0.2
const FIELD_W = 320
const MARKS = [0.1, 0.3, 0.5, 0.7, 0.9] as const

interface Box {
  left: number
  width: number
}

type TidePhase = "idle" | "scrubbing" | "playing" | "paused" | "settle"

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

export function tideSample(t: number) {
  const u = clamp(t, 0, 1)
  const angle = u * Math.PI * 5
  const height = 1.3 + 1.1 * Math.sin(angle)
  const slope = Math.cos(angle)
  const direction = slope > 0.02 ? "rising" : slope < -0.02 ? "falling" : "turn"
  const meters = Math.round(height * 10) / 10
  return { meters, direction }
}

export function tideSnap(t: number, enabled: boolean) {
  const value = quantize(t)
  if (!enabled) return value
  let best = value
  let dist = 0.04
  for (const mark of MARKS) {
    const gap = Math.abs(value - mark)
    if (gap <= dist) {
      dist = gap
      best = mark
    }
  }
  return best
}

export function tidePoint(t: number) {
  const sample = tideSample(t)
  const u = clamp(t, 0, 1)
  return {
    x: 16 + u * 288,
    y: 118 - ((sample.meters - 0.2) / 2.2) * 96,
  }
}

export function tideFromPointer(clientX: number, rect: Box) {
  const width = rect.width > 0 ? rect.width : FIELD_W
  const left = rect.width > 0 ? rect.left : 0
  return quantize((clientX - left) / width)
}

function tideLine() {
  let path = ""
  for (let i = 0; i <= 48; i += 1) {
    const point = tidePoint(i / 48)
    path += i === 0 ? `M ${point.x.toFixed(1)} ${point.y.toFixed(1)}` : ` L ${point.x.toFixed(1)} ${point.y.toFixed(1)}`
  }
  return path
}

const TIDE_LINE = tideLine()
const TIDE_AREA = `${TIDE_LINE} L ${tidePoint(1).x.toFixed(1)} 128 L 16 128 Z`

function capture(event: PointerEvent<Element>) {
  if (typeof event.currentTarget.setPointerCapture !== "function") return
  try {
    event.currentTarget.setPointerCapture(event.pointerId)
  } catch {
    // jsdom 不一定能捕获指针。
  }
}

function chevron(direction: string) {
  if (direction === "rising") return "M4 11 L8 5 L12 11"
  if (direction === "falling") return "M4 5 L8 11 L12 5"
  return "M4 8 H12"
}

export function TideCurveScrub({
  pace = 1,
  intensity = 0.7,
  marks = true,
  play = false,
  className,
  onValueChange,
}: TideCurveScrubProps) {
  const ref = useRef<HTMLDivElement>(null)
  const playFrame = useRef(0)
  const glideFrame = useRef(0)
  const dragRef = useRef(false)
  const tRef = useRef(START)
  const onValueRef = useRef(onValueChange)
  const liveRef = useRef(false)
  const reducedRef = useRef(false)
  const rateRef = useRef(1)
  const playingRef = useRef(false)
  const marksRef = useRef(marks)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const gain = clamp(intensity, 0, 1)
  const rate = rateOf(pace)
  const ease = reduced ? 0 : Math.round(160 / rate)
  const [playKey, setPlayKey] = useState(play)
  const [override, setOverride] = useState<boolean | null>(null)
  const [t, setT] = useState(START)
  const [phase, setPhase] = useState<TidePhase>(play && !reduced ? "playing" : "idle")
  if (playKey !== play) {
    setPlayKey(play)
    setOverride(null)
    setPhase(play && !reduced ? "playing" : "idle")
  }
  const playing = reduced ? false : (override ?? play)
  const sample = tideSample(t)
  const point = tidePoint(t)

  const playingNow = playing && phase === "playing"

  useEffect(() => {
    onValueRef.current = onValueChange
    liveRef.current = live
    reducedRef.current = reduced
    rateRef.current = rate
    playingRef.current = playingNow
    marksRef.current = marks
  }, [onValueChange, live, reduced, rate, playingNow, marks])

  function commit(next: number) {
    const value = quantize(next)
    tRef.current = value
    setT(value)
    onValueRef.current?.(value)
  }

  function stopGlide() {
    window.cancelAnimationFrame(glideFrame.current)
    glideFrame.current = 0
  }

  useEffect(() => {
    if (reduced || !live || phase !== "playing") {
      window.cancelAnimationFrame(playFrame.current)
      playFrame.current = 0
      return
    }
    let last = 0
    const tick = (now: number) => {
      if (!liveRef.current || reducedRef.current || !playingRef.current || dragRef.current) {
        playFrame.current = 0
        return
      }
      const dt = now > last ? Math.min(0.05, (now - last) / 1000) : 1 / 12
      if (now > 0) last = now
      const advanced = tRef.current + dt * 0.25 * rateRef.current
      const value = quantize(advanced >= 1 ? advanced - 1 : advanced)
      tRef.current = value
      setT(value)
      onValueRef.current?.(value)
      playFrame.current = window.requestAnimationFrame(tick)
    }
    playFrame.current = window.requestAnimationFrame(tick)
    return () => {
      window.cancelAnimationFrame(playFrame.current)
      playFrame.current = 0
    }
  }, [reduced, live, phase])

  useEffect(() => {
    if (live) return
    window.cancelAnimationFrame(playFrame.current)
    window.cancelAnimationFrame(glideFrame.current)
    playFrame.current = 0
    glideFrame.current = 0
    queueMicrotask(() => {
      if (liveRef.current) return
      setPhase((current) => (current === "settle" || current === "scrubbing" ? "idle" : current))
    })
  }, [live])

  function glideTo(target: number) {
    stopGlide()
    const from = tRef.current
    if (reducedRef.current || !liveRef.current || Math.abs(target - from) < 0.001) {
      commit(target)
      setPhase(reducedRef.current ? "idle" : playing ? "playing" : "idle")
      return
    }
    setPhase("settle")
    let step = 0
    const total = Math.max(4, Math.round(8 / rateRef.current))
    const tick = () => {
      if (!liveRef.current) {
        setPhase("idle")
        glideFrame.current = 0
        return
      }
      step += 1
      if (step >= total) {
        commit(target)
        setPhase(playing ? "playing" : "idle")
        glideFrame.current = 0
        return
      }
      commit(from + (target - from) * (step / total))
      glideFrame.current = window.requestAnimationFrame(tick)
    }
    glideFrame.current = window.requestAnimationFrame(tick)
  }

  function toggle() {
    if (reducedRef.current) {
      stopGlide()
      dragRef.current = false
      commit(quantize(tRef.current + 0.1 > 1 ? tRef.current + 0.1 - 1 : tRef.current + 0.1))
      setPhase("idle")
      return
    }
    const next = !playing
    setOverride(next)
    setPhase(dragRef.current ? "scrubbing" : next ? "playing" : "paused")
  }

  function read(event: PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    return tideFromPointer(event.clientX, rect)
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== undefined && event.button !== 0) return
    stopGlide()
    dragRef.current = true
    commit(read(event))
    setPhase(reducedRef.current ? "idle" : "scrubbing")
    capture(event)
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return
    commit(read(event))
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return
    dragRef.current = false
    const target = tideSnap(read(event), marksRef.current)
    glideTo(target)
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault()
      stopGlide()
      commit(tRef.current + 0.02)
      setPhase(playing ? "playing" : "idle")
    } else if (event.key === "ArrowLeft") {
      event.preventDefault()
      stopGlide()
      commit(tRef.current - 0.02)
      setPhase(playing ? "playing" : "idle")
    } else if (event.key === " " || event.key === "Spacebar") {
      event.preventDefault()
      toggle()
    }
  }

  const label = sample.direction === "rising" ? "Rising" : sample.direction === "falling" ? "Falling" : "Turn"

  return (
    <div
      ref={ref}
      data-slot="tide-curve-scrub"
      data-ritual="tide-curve"
      data-pace={rate}
      data-intensity={gain}
      data-marks={marks ? "on" : "off"}
      data-play={playing ? "on" : "off"}
      data-t={quantize(t).toFixed(2)}
      data-meters={sample.meters.toFixed(1)}
      data-direction={sample.direction}
      data-state={phase}
      data-ease={ease}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      className={cn(
        "w-full max-w-md rounded-3xl border border-border bg-card p-3 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <div className="mb-2 flex items-end justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Station A</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
        <p role="status" className="flex items-center gap-1 text-2xl font-semibold text-foreground">
          <svg viewBox="0 0 16 16" className="size-4" aria-hidden>
            <path d={chevron(sample.direction)} fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" />
          </svg>
          {sample.meters.toFixed(1)} m
        </p>
      </div>
      <div
        role="slider"
        aria-label="Tide"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(t * 100)}
        aria-valuetext={`${sample.meters.toFixed(1)} m ${label}`}
        tabIndex={0}
        data-part="chart"
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="relative touch-none rounded-2xl border border-border bg-muted/40 outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <svg viewBox="0 0 320 140" className="h-36 w-full">
          <path d={TIDE_AREA} fill="var(--chart-2)" opacity={0.25 + gain * 0.45} />
          <path d={TIDE_LINE} fill="none" stroke="var(--foreground)" strokeWidth={2} />
          {marks
            ? MARKS.map((mark) => {
                const spot = tidePoint(mark)
                return <circle key={mark} data-mark cx={spot.x} cy={spot.y} r={3} fill="var(--foreground)" />
              })
            : null}
          <motion.line
            data-playhead
            x1={point.x}
            x2={point.x}
            y1={16}
            y2={128}
            stroke="var(--foreground)"
            strokeWidth={1.5}
            className="motion-reduce:transition-none"
          />
          <circle data-join cx={point.x} cy={point.y} r={4} fill="var(--background)" stroke="var(--foreground)" />
        </svg>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          aria-label={playing && !reduced ? "Pause" : "Play"}
          aria-pressed={playing && !reduced}
          onClick={toggle}
          className="rounded-full border border-border bg-background px-3 py-1.5 text-sm text-foreground"
        >
          {playing && !reduced ? "Pause" : "Play"}
        </button>
        <p className="text-xs text-muted-foreground">00–24 h</p>
      </div>
      {reduced ? (
        <input
          type="range"
          aria-label="Tide time"
          min={0}
          max={100}
          value={Math.round(quantize(t) * 100)}
          onChange={(event) => {
            stopGlide()
            commit(Number(event.target.value) / 100)
            setPhase("idle")
          }}
          className="mt-2 w-full"
        />
      ) : null}
    </div>
  )
}
