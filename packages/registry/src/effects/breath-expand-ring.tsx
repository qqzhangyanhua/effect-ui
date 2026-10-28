"use client"

import { useEffect, useRef, useState, type KeyboardEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export type BreathPhases = "4-2-6-2" | "4-4-4-4" | "5-2-5-2"
export type BreathPhase = "inhale" | "hold" | "exhale" | "rest"

export interface BreathExpandRingProps {
  pace?: number
  intensity?: number
  phases?: BreathPhases
  loops?: boolean
  className?: string
  onPhaseChange?: (phase: BreathPhase) => void
}

const PRESETS: Record<BreathPhases, readonly [number, number, number, number]> = {
  "4-2-6-2": [4, 2, 6, 2],
  "4-4-4-4": [4, 4, 4, 4],
  "5-2-5-2": [5, 2, 5, 2],
}

const ORDER: readonly BreathPhase[] = ["inhale", "hold", "exhale", "rest"]

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

function secondsOf(phases: string) {
  if (phases === "4-4-4-4" || phases === "5-2-5-2" || phases === "4-2-6-2") return PRESETS[phases]
  return PRESETS["4-2-6-2"]
}

function round2(value: number) {
  return Math.round(value * 100) / 100
}

function breathScale(phase: BreathPhase, progress: number, intensity: number) {
  const gain = clamp(intensity, 0, 1)
  const min = 0.72
  const max = 1 + gain * 0.42
  const p = clamp(progress, 0, 1)
  if (phase === "inhale") return round2(min + (max - min) * p)
  if (phase === "exhale") return round2(max - (max - min) * p)
  if (phase === "hold") return round2(max)
  return round2(min)
}

function phaseLabel(phase: BreathPhase) {
  if (phase === "inhale") return "Inhale"
  if (phase === "exhale") return "Exhale"
  return "Hold"
}

function breathState(running: boolean, phase: BreathPhase, started: boolean) {
  if (!running) return started ? "paused" : "idle"
  if (phase === "inhale") return "inhaling"
  if (phase === "exhale") return "exhaling"
  return "holding"
}

interface Cycle {
  phase: BreathPhase
  progress: number
  cycle: number
  elapsed: number
  done: boolean
}

function phaseAt(elapsed: number, seconds: readonly [number, number, number, number], loops: boolean): Cycle {
  const total = seconds[0] + seconds[1] + seconds[2] + seconds[3]
  const safe = Math.max(0, elapsed)
  const cycle = Math.floor(safe / total)
  if (!loops && cycle >= 1) {
    return { phase: "rest", progress: 1, cycle: 1, elapsed: total, done: true }
  }
  let local = safe - cycle * total
  for (let i = 0; i < ORDER.length; i += 1) {
    const dur = seconds[i] ?? 0
    const phase = ORDER[i] ?? "inhale"
    if (local <= dur || i === ORDER.length - 1) {
      const progress = dur <= 0 ? 1 : clamp(local / dur, 0, 1)
      return { phase, progress, cycle, elapsed: safe, done: false }
    }
    local -= dur
  }
  return { phase: "inhale", progress: 0, cycle, elapsed: safe, done: false }
}

export function BreathExpandRing({
  pace = 1,
  intensity = 0.65,
  phases = "4-2-6-2",
  loops = true,
  className,
  onPhaseChange,
}: BreathExpandRingProps) {
  const ref = useRef<HTMLDivElement>(null)
  const frame = useRef(0)
  const elapsedRef = useRef(0)
  const runningRef = useRef(false)
  const onPhaseRef = useRef(onPhaseChange)
  const phaseRef = useRef<BreathPhase>("inhale")
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const liveRef = useRef(live)
  const reducedRef = useRef(reduced)
  const loopsRef = useRef(loops)
  const rateRef = useRef(1)
  const secondsRef = useRef(secondsOf(phases))
  const gain = clamp(intensity, 0, 1)
  const rate = rateOf(pace)
  const seconds = secondsOf(phases)
  const [running, setRunning] = useState(false)
  const [started, setStarted] = useState(false)
  const [tempo, setTempo] = useState(1)
  const [manual, setManual] = useState<BreathPhase | null>(null)
  const [cycle, setCycle] = useState<Cycle>(() => phaseAt(0, seconds, loops))
  const [seen, setSeen] = useState(phases)
  const shownPhase = reduced && manual ? manual : cycle.phase
  const scale = reduced ? 1 : breathScale(shownPhase, reduced ? 0 : cycle.progress, gain)
  const state = reduced
    ? manual
      ? breathState(true, manual, true)
      : "idle"
    : breathState(running, cycle.phase, started)
  const ease = reduced ? 0 : Math.round(280 / rate)

  if (seen !== phases) {
    setSeen(phases)
    setManual(null)
    setCycle(phaseAt(0, seconds, loops))
  }

  useEffect(() => {
    onPhaseRef.current = onPhaseChange
  }, [onPhaseChange])

  useEffect(() => {
    secondsRef.current = seconds
    loopsRef.current = loops
    rateRef.current = rate * tempo
    runningRef.current = running
    reducedRef.current = reduced
    liveRef.current = live
  }, [seconds, loops, rate, tempo, running, reduced, live])

  useEffect(() => {
    elapsedRef.current = 0
    phaseRef.current = "inhale"
  }, [phases])

  useEffect(() => {
    if (!running || reduced || !live) {
      window.cancelAnimationFrame(frame.current)
      frame.current = 0
      return
    }
    let last = 0
    const tick = (now: number) => {
      if (!liveRef.current || reducedRef.current || !runningRef.current) {
        frame.current = 0
        return
      }
      const dt = now > last ? Math.min(0.05, (now - last) / 1000) : 1 / 12
      last = now > 0 ? now : last
      elapsedRef.current += dt * rateRef.current
      const next = phaseAt(elapsedRef.current, secondsRef.current, loopsRef.current)
      elapsedRef.current = next.elapsed
      if (next.phase !== phaseRef.current) {
        phaseRef.current = next.phase
        onPhaseRef.current?.(next.phase)
      }
      setCycle(next)
      if (next.done) {
        runningRef.current = false
        setRunning(false)
        frame.current = 0
        return
      }
      frame.current = window.requestAnimationFrame(tick)
    }
    frame.current = window.requestAnimationFrame(tick)
    return () => {
      window.cancelAnimationFrame(frame.current)
      frame.current = 0
    }
  }, [running, reduced, live])

  function stepManual() {
    const current = manual ?? "inhale"
    const index = ORDER.indexOf(current)
    const next = ORDER[(index + 1) % ORDER.length] ?? "inhale"
    setManual(next)
    onPhaseRef.current?.(next)
  }

  function activate() {
    if (reducedRef.current) {
      stepManual()
      return
    }
    setStarted(true)
    setRunning((value) => !value)
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.target instanceof HTMLElement && event.target.closest("button")) return
    if (event.key === " " || event.key === "Spacebar") {
      event.preventDefault()
      activate()
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      setTempo((value) => clamp(Math.round((value + 0.25) * 100) / 100, 0.5, 2))
    } else if (event.key === "ArrowDown") {
      event.preventDefault()
      setTempo((value) => clamp(Math.round((value - 0.25) * 100) / 100, 0.5, 2))
    }
  }

  return (
    <div
      ref={ref}
      role="region"
      aria-label="呼吸环"
      tabIndex={0}
      onKeyDown={onKeyDown}
      data-slot="breath-expand-ring"
      data-ritual="breath-ring"
      data-pace={rate}
      data-intensity={gain}
      data-phases={phases}
      data-loops={loops ? "on" : "off"}
      data-tempo={tempo.toFixed(2)}
      data-phase={shownPhase}
      data-scale={scale.toFixed(2)}
      data-cycle={cycle.cycle}
      data-running={running ? "on" : "off"}
      data-state={state}
      data-ease={ease}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      className={cn(
        "relative w-full max-w-sm rounded-3xl border border-border bg-card p-4 text-card-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
        className,
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <p data-part="ratio" className="rounded-2xl border border-border bg-background px-3 py-2 text-sm text-foreground">
          {seconds[0]} / {seconds[2]}
        </p>
        <p className="text-xs text-muted-foreground">Loop {cycle.cycle + (running || cycle.elapsed > 0 ? 1 : 0)}</p>
      </div>
      <div className="relative grid h-56 place-items-center">
        <motion.div
          data-ring="outer"
          className="absolute size-40 rounded-full border border-primary/50 motion-reduce:transition-none"
          style={{
            transform: `scale(${scale})`,
            opacity: 0.35 + gain * 0.45,
            transition: reduced ? "none" : `transform ${ease}ms linear`,
          }}
        />
        <motion.div
          data-ring="inner"
          className="absolute size-28 rounded-full bg-primary/20 motion-reduce:transition-none"
          style={{
            transform: `scale(${scale})`,
            transition: reduced ? "none" : `transform ${ease}ms linear`,
          }}
        />
        <p role="status" className="relative text-3xl font-medium text-foreground">
          {phaseLabel(shownPhase)}
        </p>
      </div>
      <div data-part="meter" className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-primary" style={{ width: `${Math.round((reduced ? (manual ? 1 : 0) : cycle.progress) * 100)}%` }} />
      </div>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={activate}
          aria-pressed={running}
          className="rounded-full bg-primary px-4 py-1.5 text-sm text-primary-foreground"
        >
          {running ? "Pause" : "Start"}
        </button>
        {reduced ? (
          <button type="button" onClick={stepManual} className="rounded-full border border-border px-4 py-1.5 text-sm">
            Next
          </button>
        ) : null}
      </div>
    </div>
  )
}
