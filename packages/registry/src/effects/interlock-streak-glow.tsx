"use client"

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface InterlockStreakGlowProps {
  pace?: number
  intensity?: number
  liquid?: boolean
  glow?: boolean
  className?: string
  onValueChange?: (state: { streak: number }) => void
}

export const STREAK_COUNT = 7

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

export function streakClamp(value: number) {
  if (!Number.isFinite(value)) return 0
  return clamp(Math.round(value), 0, STREAK_COUNT)
}

function dayX(index: number) {
  return 28 + index * 44
}

export function InterlockStreakGlow({
  pace = 1,
  intensity = 0.7,
  liquid = true,
  glow = true,
  className,
  onValueChange,
}: InterlockStreakGlowProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const filterId = useId().replace(/:/g, "")
  const gain = clamp(intensity, 0, 1)
  const paceRate = rateOf(pace)
  const ms = reduced ? 0 : Math.round(240 / paceRate)
  const [streak, setStreak] = useState(0)
  const [phase, setPhase] = useState<"idle" | "lighting" | "settled">("idle")
  const [breath, setBreath] = useState(0)
  const streakRef = useRef(0)
  const onValueRef = useRef(onValueChange)
  const playing = glow && streak > 0 && live && !reduced
  const bridge = 2 + gain * 8

  useEffect(() => {
    streakRef.current = streak
    onValueRef.current = onValueChange
  }, [streak, onValueChange])

  useEffect(() => {
    if (phase !== "lighting") return
    const id = window.setTimeout(() => setPhase("settled"), ms)
    return () => window.clearTimeout(id)
  }, [phase, streak, ms])

  useEffect(() => {
    if (!playing) return
    let frame = 0
    let stopped = false
    let last = 0
    const tick = (now: number) => {
      if (stopped) return
      const dt = now > last ? Math.min(0.05, (now - last) / 1000) : 1 / 12
      if (now > 0) last = now
      setBreath((value) => (value + dt * 0.5 * paceRate) % 1)
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => {
      stopped = true
      window.cancelAnimationFrame(frame)
    }
  }, [playing, paceRate])

  function apply(next: number) {
    const safe = streakClamp(next)
    if (safe === streakRef.current) return
    streakRef.current = safe
    setStreak(safe)
    setPhase(reduced ? "settled" : "lighting")
    onValueRef.current?.({ streak: safe })
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight" || event.key === "ArrowUp") apply(streakRef.current + 1)
    else if (event.key === "ArrowLeft" || event.key === "ArrowDown") apply(streakRef.current - 1)
    else if (event.key === "Home") apply(0)
    else if (event.key === "End") apply(STREAK_COUNT)
    else if (event.key === " " && event.target === event.currentTarget) apply(streakRef.current + 1)
    else return
    event.preventDefault()
  }

  const glowWave = playing ? 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(breath * Math.PI * 2)) : 0.7

  return (
    <div
      ref={ref}
      data-slot="interlock-streak-glow"
      data-ritual="streak-glow"
      data-pace={paceRate}
      data-intensity={gain}
      data-streak={streak}
      data-phase={phase}
      data-liquid={liquid ? "on" : "off"}
      data-glow={breath.toFixed(2)}
      data-playing={playing ? "on" : "off"}
      data-ease={ms}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      tabIndex={0}
      onKeyDown={onKeyDown}
      className={cn(
        "w-full max-w-xl rounded-3xl border border-border bg-card p-4 text-card-foreground outline-none select-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
        className,
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">Day streak</p>
        <p className="text-xs text-muted-foreground">
          {streak} / {STREAK_COUNT}
        </p>
      </div>
      <div className="relative">
        <svg viewBox="0 0 320 88" className="pointer-events-none h-24 w-full" aria-hidden="true">
          {liquid ? (
            <defs>
              <filter id={filterId} x="-20%" y="-40%" width="140%" height="180%">
                <feGaussianBlur in="SourceGraphic" stdDeviation={3 + gain * 3} result="blur" />
                <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
                <feBlend in="SourceGraphic" in2="goo" />
              </filter>
            </defs>
          ) : null}
          <g data-bridge={liquid ? "liquid" : "line"} filter={liquid ? `url(#${filterId})` : undefined}>
            {Array.from({ length: STREAK_COUNT - 1 }, (_, index) => {
              const filled = streak > index + 1
              const x1 = dayX(index)
              const x2 = dayX(index + 1)
              if (!liquid) {
                return (
                  <line
                    key={index}
                    data-link={filled ? "on" : "off"}
                    x1={x1 + 14}
                    x2={x2 - 14}
                    y1={44}
                    y2={44}
                    stroke={filled ? "var(--primary)" : "var(--border)"}
                    strokeWidth={bridge}
                    strokeLinecap="round"
                  />
                )
              }
              return (
                <rect
                  key={index}
                  data-link={filled ? "on" : "off"}
                  x={(x1 + x2) / 2 - (filled ? 16 : 6)}
                  y={44 - (filled ? bridge : 3)}
                  width={filled ? 32 : 12}
                  height={filled ? bridge * 2 : 6}
                  rx={bridge}
                  fill={filled ? "var(--primary)" : "var(--muted)"}
                />
              )
            })}
            {Array.from({ length: STREAK_COUNT }, (_, index) => {
              const lit = index < streak
              return (
                <circle
                  key={index}
                  cx={dayX(index)}
                  cy={44}
                  r={lit ? 16 : 13}
                  fill={lit ? "var(--primary)" : "var(--muted)"}
                  stroke="var(--border)"
                  strokeWidth={lit ? 0 : 1.5}
                />
              )
            })}
          </g>
        </svg>
        <div className="absolute inset-0">
          {Array.from({ length: STREAK_COUNT }, (_, index) => {
            const lit = index < streak
            return (
              <button
                key={index}
                type="button"
                aria-label={`Day ${index + 1}`}
                aria-pressed={lit}
                data-day={index + 1}
                data-lit={lit ? "on" : "off"}
                onClick={() => apply(index + 1)}
                className={cn(
                  "absolute size-11 -translate-x-1/2 -translate-y-1/2 rounded-full text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  lit ? "text-primary-foreground" : "text-muted-foreground",
                )}
                style={{
                  left: `${(dayX(index) / 320) * 100}%`,
                  top: "50%",
                  boxShadow:
                    lit && glow
                      ? `0 0 ${(8 + gain * 16) * glowWave}px color-mix(in srgb, var(--primary) ${Math.round(28 + glowWave * 40)}%, transparent)`
                      : undefined,
                }}
              >
                {index + 1}
              </button>
            )
          })}
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => apply(streakRef.current + 1)}
          className="h-9 flex-1 rounded-full bg-primary text-sm text-primary-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Step
        </button>
        <button
          type="button"
          onClick={() => apply(0)}
          className="h-9 flex-1 rounded-full border border-border bg-background text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Reset
        </button>
      </div>
      <motion.span className="sr-only" aria-live="polite" initial={false} animate={{ opacity: 1 }}>
        {`Day streak ${streak}`}
      </motion.span>
    </div>
  )
}
