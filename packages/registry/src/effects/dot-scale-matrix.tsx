"use client"

import { useEffect, useRef, useState, type KeyboardEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface DotScaleMatrixProps {
  pace?: number
  intensity?: number
  colorScale?: boolean
  showChip?: boolean
  className?: string
  onValueChange?: (state: { focusIndex: number; locked: boolean; value: number }) => void
}

export const DOT_COLS = 7
export const DOT_ROWS = 4
export const DOT_COUNT = DOT_COLS * DOT_ROWS
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

export function dotValue(index: number) {
  const col = index % DOT_COLS
  const row = Math.floor(index / DOT_COLS)
  const wave = 0.5 + 0.5 * Math.sin(col * 0.85 + row * 1.2)
  const ramp = (col + row) / 9
  return Math.round(clamp(wave * 0.72 + ramp * 0.28, 0, 1) * 100) / 100
}

export function dotRadius(value: number, intensity: number) {
  const gain = clamp(intensity, 0, 1)
  const min = 3
  const max = 3 + 12 * (0.25 + 0.75 * gain)
  return Math.round((min + clamp(value, 0, 1) * (max - min)) * 10) / 10
}

export function dotLabel(index: number) {
  const day = DAYS[index % DOT_COLS] ?? "Mon"
  const week = Math.floor(index / DOT_COLS) + 1
  return `${day} week ${week}`
}

export function DotScaleMatrix({
  pace = 1,
  intensity = 0.7,
  colorScale = true,
  showChip = true,
  className,
  onValueChange,
}: DotScaleMatrixProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const gain = clamp(intensity, 0, 1)
  const paceRate = rateOf(pace)
  const ms = reduced ? 0 : Math.round(180 / paceRate)
  const [focus, setFocus] = useState(0)
  const [locked, setLocked] = useState(false)
  const [touched, setTouched] = useState(false)
  const [hover, setHover] = useState<number | null>(null)
  const [breath, setBreath] = useState(0)
  const focusRef = useRef(0)
  const lockedRef = useRef(false)
  const onValueRef = useRef(onValueChange)
  const playing = live && !reduced
  const safe = clamp(focus, 0, DOT_COUNT - 1)
  const value = dotValue(safe)
  const phase = locked ? "locked" : touched ? "focus" : "idle"

  useEffect(() => {
    focusRef.current = focus
    lockedRef.current = locked
    onValueRef.current = onValueChange
  }, [focus, locked, onValueChange])

  useEffect(() => {
    if (!playing) return
    let frame = 0
    let stopped = false
    let last = 0
    const tick = (now: number) => {
      if (stopped) return
      const dt = now > last ? Math.min(0.05, (now - last) / 1000) : 1 / 12
      if (now > 0) last = now
      setBreath((current) => (current + dt * 0.4 * paceRate) % 1)
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => {
      stopped = true
      window.cancelAnimationFrame(frame)
    }
  }, [playing, paceRate])

  function emit(index: number, nextLocked: boolean) {
    onValueRef.current?.({ focusIndex: index, locked: nextLocked, value: dotValue(index) })
  }

  function move(index: number) {
    const next = clamp(index, 0, DOT_COUNT - 1)
    if (next === focusRef.current && touched) return
    focusRef.current = next
    lockedRef.current = false
    setFocus(next)
    setLocked(false)
    setTouched(true)
    emit(next, false)
  }

  function select(index: number) {
    const next = clamp(index, 0, DOT_COUNT - 1)
    const nextLocked = !(lockedRef.current && focusRef.current === next)
    focusRef.current = next
    lockedRef.current = nextLocked
    setFocus(next)
    setLocked(nextLocked)
    setTouched(true)
    emit(next, nextLocked)
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") move(focusRef.current + 1)
    else if (event.key === "ArrowLeft") move(focusRef.current - 1)
    else if (event.key === "ArrowDown") move(focusRef.current + DOT_COLS)
    else if (event.key === "ArrowUp") move(focusRef.current - DOT_COLS)
    else if (event.key === "Home") move(0)
    else if (event.key === "End") move(DOT_COUNT - 1)
    else if (event.key === "Enter" && event.target === event.currentTarget) select(focusRef.current)
    else return
    event.preventDefault()
  }

  const breathScale = playing ? 1 + Math.sin(breath * Math.PI * 2) * 0.04 * gain : 1

  return (
    <div
      ref={ref}
      data-slot="dot-scale-matrix"
      data-ritual="dot-scale"
      data-pace={paceRate}
      data-intensity={gain}
      data-focus={safe}
      data-hover={hover === null ? "none" : String(hover)}
      data-locked={locked ? "on" : "off"}
      data-value={value.toFixed(2)}
      data-phase={phase}
      data-breath={breath.toFixed(2)}
      data-playing={playing ? "on" : "off"}
      data-color={colorScale ? "on" : "off"}
      data-chip={showChip ? "on" : "off"}
      data-ease={ms}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      tabIndex={0}
      onKeyDown={onKeyDown}
      className={cn(
        "w-full max-w-md rounded-3xl border border-border bg-card p-4 text-card-foreground outline-none select-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
        className,
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">Activity</p>
        <p className="text-xs text-muted-foreground">{dotLabel(safe)}</p>
      </div>
      <div className="mb-2 grid grid-cols-7 text-center text-[10px] text-muted-foreground">
        {DAYS.map((day) => (
          <span key={day}>{day.slice(0, 1)}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: DOT_COUNT }, (_, index) => {
          const cell = dotValue(index)
          const radius = dotRadius(cell, gain)
          const current = index === safe
          const near = current || hover === index
          const scale = (near ? 1 + 0.08 + gain * 0.16 : 1) * breathScale
          return (
            <button
              key={index}
              type="button"
              aria-label={dotLabel(index)}
              aria-pressed={locked && current}
              data-cell={index}
              data-value={cell.toFixed(2)}
              data-r={radius.toFixed(1)}
              onClick={() => select(index)}
              onPointerEnter={() => setHover(index)}
              onPointerLeave={() => setHover((current) => (current === index ? null : current))}
              className="grid h-11 place-items-center rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span
                data-dot
                className="block rounded-full motion-reduce:transition-none"
                style={{
                  width: radius * 2,
                  height: radius * 2,
                  transform: `scale(${scale})`,
                  transition: reduced ? "none" : `transform ${ms}ms cubic-bezier(0.22, 1, 0.36, 1)`,
                  background: colorScale
                    ? `color-mix(in srgb, var(--primary) ${Math.round(16 + cell * (36 + gain * 48))}%, var(--muted-foreground))`
                    : "var(--foreground)",
                }}
              />
            </button>
          )
        })}
      </div>
      {showChip && locked ? (
        <motion.p
          data-chip-readout
          role="status"
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0 : 0.16 / paceRate }}
          className="mt-3 inline-flex rounded-full border border-border bg-background px-3 py-1 text-xs text-foreground motion-reduce:transition-none"
        >
          {dotLabel(safe)} · {Math.round(value * 100)}
        </motion.p>
      ) : null}
      <motion.span className="sr-only" aria-live="polite">
        {locked ? `${dotLabel(safe)} ${Math.round(value * 100)}` : "Grid"}
      </motion.span>
    </div>
  )
}
