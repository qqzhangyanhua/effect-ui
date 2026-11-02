"use client"

import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type UIEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

/**
 * Inspired by Slack, Oryzo, and Glide (via Mobbin), original implementation.
 * https://mobbin.com/sites/sections/55f0b314-a071-4c34-9145-dbc6a592b7e7
 * https://mobbin.com/sites/sections/02dd8a32-d483-44a5-81a5-4f402689df5e
 * https://mobbin.com/sites/sections/ff98095f-0934-45a5-93ce-a4c634c18784
 */

export interface StanzaRiseEnterProps {
  pace?: number
  intensity?: number
  stagger?: boolean
  threshold?: number
  className?: string
  onValueChange?: (state: { progress: number; settled: number }) => void
}

export type StanzaPose = "waiting" | "rising" | "settled"

export interface StanzaRise {
  amount: number
  pose: StanzaPose
  born: number
  replay: boolean
}

export const STANZAS = [
  { id: "opening", title: "Opening", body: "A quiet paragraph that is already sitting in the reading place." },
  { id: "middle", title: "Middle", body: "The next stanza waits below until the column advances a short step." },
  { id: "close", title: "Close", body: "The last block rises a little, then rests so the sentence stays readable." },
] as const

const ring =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

export function roundProgress(value: number) {
  return Math.round(clamp(value, 0, 1) * 1000) / 1000
}

export function stanzaGate(index: number, threshold: number) {
  const ratio = clamp(threshold, 0.15, 0.7)
  if (index <= 0) return 0
  const base = index === 1 ? 0.34 : 0.68
  const shift = (ratio - 0.4) * 0.4
  return clamp(Math.round((base + shift) * 1000) / 1000, 0.08, 0.92)
}

export function riseDistance(intensity: number) {
  return Math.round((4 + clamp(intensity, 0, 1) * 18) * 10) / 10
}

export function riseShift(amount: number, intensity: number) {
  return Math.round((1 - clamp(amount, 0, 1)) * riseDistance(intensity) * 10) / 10
}

export function riseFrames(pace: number) {
  return clamp(Math.round(12 / rateOf(pace)), 6, 22)
}

export function initialRises(): StanzaRise[] {
  return STANZAS.map((_, index) =>
    index === 0
      ? { amount: 1, pose: "settled", born: -1, replay: false }
      : { amount: 0, pose: "waiting", born: -1, replay: false },
  )
}

export function risePending(rises: readonly StanzaRise[], progress: number, threshold: number) {
  return rises.some((rise, index) => {
    const eligible = progress + 1e-6 >= stanzaGate(index, threshold) || rise.replay
    return eligible && rise.amount < 1
  })
}

export function stepRises(
  rises: readonly StanzaRise[],
  progress: number,
  threshold: number,
  stagger: boolean,
  pace: number,
  clock: number,
) {
  let moving = false
  const total = riseFrames(pace)
  const next = rises.map((rise, index) => {
    const eligible = progress + 1e-6 >= stanzaGate(index, threshold) || rise.replay
    if (!eligible) return { amount: 0, pose: "waiting" as const, born: -1, replay: false }
    if (rise.amount >= 1 && !rise.replay) return { amount: 1, pose: "settled" as const, born: rise.born, replay: false }
    const born = rise.born < 0 ? clock : rise.born
    const hold = stagger ? index * 4 : 0
    if (clock < born + hold) {
      moving = true
      return { amount: 0, pose: "rising" as const, born, replay: rise.replay }
    }
    const elapsed = clock - (born + hold) + 1
    const amount = clamp(elapsed / total, 0, 1)
    const done = amount >= 1
    if (!done) moving = true
    return {
      amount: done ? 1 : Math.round(amount * 1000) / 1000,
      pose: done ? ("settled" as const) : ("rising" as const),
      born,
      replay: done ? false : rise.replay,
    }
  })
  return { rises: next, clock: clock + 1, moving }
}

export function snapRises(rises: readonly StanzaRise[], progress: number, threshold: number): StanzaRise[] {
  return rises.map((rise, index) => {
    const eligible = progress + 1e-6 >= stanzaGate(index, threshold) || rise.replay
    if (!eligible) return { amount: 0, pose: "waiting", born: -1, replay: false }
    return { amount: 1, pose: "settled", born: -1, replay: false }
  })
}

export function replayRise(rises: readonly StanzaRise[], index: number, clock: number): StanzaRise[] {
  return rises.map((rise, item) =>
    item === index ? { amount: 0, pose: "rising", born: clock, replay: true } : rise,
  )
}

export function StanzaRiseEnter({
  pace = 1,
  intensity = 0.32,
  stagger = true,
  threshold = 0.4,
  className,
  onValueChange,
}: StanzaRiseEnterProps) {
  const ref = useRef<HTMLDivElement>(null)
  const scrollerRef = useRef<HTMLDivElement>(null)
  const risesRef = useRef<StanzaRise[]>(initialRises())
  const clockRef = useRef(0)
  const frameRef = useRef(0)
  const progressRef = useRef(0)
  const liveRef = useRef(false)
  const reducedRef = useRef(false)
  const staggerRef = useRef(stagger)
  const thresholdRef = useRef(threshold)
  const paceRef = useRef(1)
  const lockRef = useRef<number | null>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const gain = clamp(intensity, 0, 1)
  const paceRate = rateOf(pace)
  const gate = clamp(threshold, 0.15, 0.7)
  const [progress, setProgress] = useState(0)
  const [rises, setRises] = useState<StanzaRise[]>(initialRises)
  const [playing, setPlaying] = useState(false)
  const settled = rises.filter((rise) => rise.pose === "settled").length

  function stop() {
    if (frameRef.current === 0) return
    window.cancelAnimationFrame(frameRef.current)
    frameRef.current = 0
  }

  function syncScroll(value: number) {
    const node = scrollerRef.current
    if (!node) return
    const max = node.scrollHeight - node.clientHeight
    if (max <= 1) return
    const top = value * max
    lockRef.current = top
    node.scrollTop = top
  }

  function publish(next: number) {
    const value = roundProgress(next)
    progressRef.current = value
    setProgress(value)
    syncScroll(value)
  }

  function kick() {
    if (frameRef.current !== 0) return
    const tick = () => {
      if (!liveRef.current || reducedRef.current) {
        const snapped = snapRises(risesRef.current, progressRef.current, thresholdRef.current)
        risesRef.current = snapped
        setRises(snapped)
        frameRef.current = 0
        setPlaying(false)
        return
      }
      const result = stepRises(
        risesRef.current,
        progressRef.current,
        thresholdRef.current,
        staggerRef.current,
        paceRef.current,
        clockRef.current,
      )
      risesRef.current = result.rises
      clockRef.current = result.clock
      setRises(result.rises)
      if (!result.moving) {
        frameRef.current = 0
        setPlaying(false)
        return
      }
      frameRef.current = window.requestAnimationFrame(tick)
    }
    setPlaying(true)
    frameRef.current = window.requestAnimationFrame(tick)
  }

  function replay(index: number) {
    const armed = replayRise(risesRef.current, index, clockRef.current)
    if (!liveRef.current || reducedRef.current) {
      const snapped = snapRises(armed, progressRef.current, thresholdRef.current)
      risesRef.current = snapped
      setRises(snapped)
      setPlaying(false)
      return
    }
    risesRef.current = armed
    setRises(armed)
    kick()
  }

  useEffect(() => {
    liveRef.current = live
    reducedRef.current = reduced
    staggerRef.current = stagger
    thresholdRef.current = gate
    paceRef.current = paceRate
    if (!live || reduced) {
      stop()
      const snapped = snapRises(risesRef.current, progressRef.current, gate)
      risesRef.current = snapped
      setRises(snapped)
      setPlaying(false)
      return
    }
    if (risePending(risesRef.current, progressRef.current, gate)) kick()
    return () => stop()
  }, [live, reduced, progress, stagger, gate, paceRate])

  useEffect(() => {
    onValueChange?.({ progress, settled })
  }, [progress, settled, onValueChange])

  useEffect(() => {
    return () => stop()
  }, [])

  function onScroll(event: UIEvent<HTMLDivElement>) {
    const node = event.currentTarget
    if (lockRef.current !== null && Math.abs(node.scrollTop - lockRef.current) < 1.5) {
      lockRef.current = null
      return
    }
    lockRef.current = null
    if (!liveRef.current) return
    const max = node.scrollHeight - node.clientHeight
    if (max <= 1) return
    publish(node.scrollTop / max)
  }

  function onKeyDown(event: ReactKeyboardEvent<HTMLElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault()
      publish(progressRef.current + 0.12)
      return
    }
    if (event.key === "ArrowUp") {
      event.preventDefault()
      publish(progressRef.current - 0.12)
      return
    }
    if (event.key === "PageDown") {
      event.preventDefault()
      publish(progressRef.current + 0.36)
      return
    }
    if (event.key === "PageUp") {
      event.preventDefault()
      publish(progressRef.current - 0.36)
      return
    }
    if (event.key === "Home") {
      event.preventDefault()
      publish(0)
      return
    }
    if (event.key === "End") {
      event.preventDefault()
      publish(1)
      return
    }
    if (event.key === "Enter" && event.currentTarget === scrollerRef.current) {
      event.preventDefault()
      const index = risesRef.current.findIndex((rise) => rise.pose !== "settled")
      replay(index < 0 ? 0 : index)
    }
  }

  return (
    <div
      ref={ref}
      data-slot="stanza-rise-enter"
      data-ritual="stanza-rise"
      data-progress={progress.toFixed(3)}
      data-settled={settled}
      data-stagger={stagger ? "on" : "off"}
      data-threshold={gate.toFixed(2)}
      data-playing={playing && live && !reduced ? "on" : "off"}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      className={cn(
        "w-full rounded-3xl border border-border bg-card p-4 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <p className="mb-3 text-sm text-muted-foreground">Move the column. Each stanza rises a short way, then rests.</p>
      <div
        ref={scrollerRef}
        tabIndex={0}
        role="region"
        aria-label="Reading column"
        onScroll={onScroll}
        onKeyDown={onKeyDown}
        className={cn("h-64 overflow-y-auto rounded-2xl border border-border bg-background px-4 py-3", ring)}
      >
        <div className="grid gap-6">
          {STANZAS.map((stanza, index) => {
            const rise = rises[index] ?? initialRises()[index]
            const amount = rise?.amount ?? 0
            const pose = rise?.pose ?? "waiting"
            const shift = riseShift(amount, gain)
            return (
              <motion.article
                key={stanza.id}
                tabIndex={0}
                data-stanza={stanza.id}
                data-pose={pose}
                data-amount={amount.toFixed(3)}
                data-shift={shift.toFixed(1)}
                aria-label={stanza.title}
                onClick={() => replay(index)}
                onKeyDown={(event) => {
                  if (event.key !== "Enter") return
                  event.preventDefault()
                  event.stopPropagation()
                  replay(index)
                }}
                style={{ transform: `translateY(${shift}px)`, opacity: 0.72 + amount * 0.28 }}
                className={cn("min-h-40 rounded-2xl border border-border bg-card px-4 py-3 motion-reduce:transition-none", ring)}
              >
                <h3 className="text-sm font-semibold text-foreground">{stanza.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{stanza.body}</p>
              </motion.article>
            )
          })}
        </div>
      </div>
    </div>
  )
}
