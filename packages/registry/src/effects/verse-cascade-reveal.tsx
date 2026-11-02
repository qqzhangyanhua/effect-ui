"use client"

import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type UIEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

/**
 * Inspired by Craft, Chronicle, and Podia (via Mobbin), original implementation.
 * https://mobbin.com/screens/b273e90f-6ca0-4096-8bef-3572ba438667
 * https://mobbin.com/screens/044f57f7-17c5-4376-af9f-c372a104f163
 * https://mobbin.com/screens/41f8b1f4-ec5f-4703-aeed-9b318eb0d5c0
 */

export interface VerseCascadeRevealProps {
  pace?: number
  intensity?: number
  cascadeGap?: number
  lines?: number
  className?: string
  onValueChange?: (state: { progress: number; revealed: number }) => void
}

export interface VerseMotion {
  amounts: number[]
  born: number[]
}

export const VERSES = [
  { id: "v1", text: "The first line is already in place." },
  { id: "v2", text: "The next line waits, still readable, until the column advances." },
  { id: "v3", text: "A third line joins after its own threshold." },
  { id: "v4", text: "The fourth line keeps the same quiet measure." },
  { id: "v5", text: "A fifth line settles once it has crossed." },
  { id: "v6", text: "The last line stays readable after it appears." },
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

export function lineCountOf(lines: number) {
  return clamp(Math.round(Number.isFinite(lines) ? lines : 5), 3, 6)
}

export function verseGate(index: number, gap: number) {
  if (index <= 0) return 0
  const spacing = 0.1 + clamp(gap, 0, 1) * 0.12
  return clamp(Math.round(index * spacing * 1000) / 1000, 0, 0.92)
}

export function hiddenOpacity(intensity: number) {
  return Math.round((0.62 - clamp(intensity, 0, 1) * 0.28) * 1000) / 1000
}

export function verseOpacity(amount: number, intensity: number) {
  const hidden = hiddenOpacity(intensity)
  return Math.round((hidden + (1 - hidden) * clamp(amount, 0, 1)) * 1000) / 1000
}

export function verseShift(amount: number, intensity: number) {
  const distance = 3 + clamp(intensity, 0, 1) * 9
  return Math.round((1 - clamp(amount, 0, 1)) * distance * 10) / 10
}

export function verseFrames(pace: number) {
  return clamp(Math.round(12 / rateOf(pace)), 6, 22)
}

export function verseHold(index: number, gap: number) {
  return index * clamp(Math.round(clamp(gap, 0, 1) * 6), 0, 6)
}

export function initialVerse(count: number): VerseMotion {
  return {
    amounts: Array.from({ length: count }, (_, index) => (index === 0 ? 1 : 0)),
    born: Array.from({ length: count }, () => -1),
  }
}

export function versePending(motion: VerseMotion, progress: number, gap: number) {
  return motion.amounts.some((amount, index) => {
    const eligible = progress + 1e-6 >= verseGate(index, gap)
    return (eligible && amount < 1) || (!eligible && amount > 0)
  })
}

export function stepVerse(motion: VerseMotion, progress: number, gap: number, pace: number, clock: number) {
  let moving = false
  const total = verseFrames(pace)
  const born = motion.born.slice()
  const amounts = motion.amounts.map((amount, index) => {
    const eligible = progress + 1e-6 >= verseGate(index, gap)
    if (!eligible) {
      born[index] = -1
      return 0
    }
    if (amount >= 1) return 1
    if ((born[index] ?? -1) < 0) born[index] = clock
    const hold = verseHold(index, gap)
    const started = born[index] ?? clock
    if (clock < started + hold) {
      moving = true
      return 0
    }
    const elapsed = clock - (started + hold) + 1
    const value = clamp(elapsed / total, 0, 1)
    if (value < 1) moving = true
    return value >= 1 ? 1 : Math.round(value * 1000) / 1000
  })
  return { motion: { amounts, born }, clock: clock + 1, moving }
}

export function snapVerse(progress: number, count: number, gap: number): VerseMotion {
  return {
    amounts: Array.from({ length: count }, (_, index) => (progress + 1e-6 >= verseGate(index, gap) ? 1 : 0)),
    born: Array.from({ length: count }, () => -1),
  }
}

export function VerseCascadeReveal({
  pace = 1,
  intensity = 0.45,
  cascadeGap = 0.45,
  lines = 5,
  className,
  onValueChange,
}: VerseCascadeRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const scrollerRef = useRef<HTMLDivElement>(null)
  const count = lineCountOf(lines)
  const motionRef = useRef<VerseMotion>(initialVerse(count))
  const clockRef = useRef(0)
  const frameRef = useRef(0)
  const progressRef = useRef(0)
  const liveRef = useRef(false)
  const reducedRef = useRef(false)
  const gapRef = useRef(cascadeGap)
  const paceRef = useRef(1)
  const countRef = useRef(count)
  const lockRef = useRef<number | null>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const gain = clamp(intensity, 0, 1)
  const gap = clamp(cascadeGap, 0, 1)
  const paceRate = rateOf(pace)
  const [progress, setProgress] = useState(0)
  const [motionState, setMotionState] = useState<VerseMotion>(() => initialVerse(count))
  const [playing, setPlaying] = useState(false)
  const revealed = motionState.amounts.filter((amount) => amount >= 1).length

  function stop() {
    if (frameRef.current === 0) return
    window.cancelAnimationFrame(frameRef.current)
    frameRef.current = 0
  }

  function apply(next: VerseMotion, value: number) {
    motionRef.current = next
    progressRef.current = value
    setMotionState(next)
    setProgress(value)
    const node = scrollerRef.current
    if (!node) return
    const max = node.scrollHeight - node.clientHeight
    if (max <= 1) return
    const top = value * max
    lockRef.current = top
    node.scrollTop = top
  }

  function kick() {
    if (frameRef.current !== 0) return
    const tick = () => {
      if (!liveRef.current || reducedRef.current) {
        const snapped = snapVerse(progressRef.current, countRef.current, gapRef.current)
        motionRef.current = snapped
        setMotionState(snapped)
        frameRef.current = 0
        setPlaying(false)
        return
      }
      const result = stepVerse(motionRef.current, progressRef.current, gapRef.current, paceRef.current, clockRef.current)
      motionRef.current = result.motion
      clockRef.current = result.clock
      setMotionState(result.motion)
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

  useEffect(() => {
    countRef.current = count
    if (motionRef.current.amounts.length === count) return
    const next = initialVerse(count)
    motionRef.current = next
    setMotionState(next)
  }, [count])

  useEffect(() => {
    liveRef.current = live
    reducedRef.current = reduced
    gapRef.current = gap
    paceRef.current = paceRate
    countRef.current = count
    if (!live || reduced) {
      stop()
      const snapped = snapVerse(progressRef.current, count, gap)
      motionRef.current = snapped
      setMotionState(snapped)
      setPlaying(false)
      return
    }
    if (versePending(motionRef.current, progressRef.current, gap)) kick()
    return () => stop()
  }, [live, reduced, progress, gap, paceRate, count])

  useEffect(() => {
    onValueChange?.({ progress, revealed })
  }, [progress, revealed, onValueChange])

  useEffect(() => {
    return () => stop()
  }, [])

  function publish(next: number) {
    const value = roundProgress(next)
    progressRef.current = value
    setProgress(value)
    const node = scrollerRef.current
    if (!node) return
    const max = node.scrollHeight - node.clientHeight
    if (max <= 1) return
    const top = value * max
    lockRef.current = top
    node.scrollTop = top
  }

  function revealAll() {
    stop()
    setPlaying(false)
    apply(
      { amounts: Array.from({ length: count }, () => 1), born: Array.from({ length: count }, () => -1) },
      1,
    )
  }

  function reset() {
    stop()
    setPlaying(false)
    apply(initialVerse(count), 0)
  }

  function onScroll(event: UIEvent<HTMLDivElement>) {
    if (lockRef.current !== null && Math.abs(event.currentTarget.scrollTop - lockRef.current) < 1.5) {
      lockRef.current = null
      return
    }
    lockRef.current = null
    if (!liveRef.current) return
    const max = event.currentTarget.scrollHeight - event.currentTarget.clientHeight
    if (max <= 1) return
    publish(event.currentTarget.scrollTop / max)
  }

  function onKeyDown(event: ReactKeyboardEvent<HTMLElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault()
      publish(progressRef.current + 0.08)
      return
    }
    if (event.key === "ArrowUp") {
      event.preventDefault()
      publish(progressRef.current - 0.08)
      return
    }
    if (event.key === "PageDown") {
      event.preventDefault()
      publish(progressRef.current + 0.22)
      return
    }
    if (event.key === "PageUp") {
      event.preventDefault()
      publish(progressRef.current - 0.22)
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
    if (event.key === "Enter") {
      event.preventDefault()
      revealAll()
      return
    }
    if (event.key === "r" || event.key === "R") {
      event.preventDefault()
      reset()
    }
  }

  return (
    <div
      ref={ref}
      data-slot="verse-cascade-reveal"
      data-ritual="verse-cascade"
      data-progress={progress.toFixed(3)}
      data-revealed={revealed}
      data-lines={count}
      data-playing={playing && live && !reduced ? "on" : "off"}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      className={cn(
        "w-full rounded-3xl border border-border bg-card p-4 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">Lines appear as the column passes each threshold.</p>
        <button
          type="button"
          onClick={reset}
          className={cn("rounded-full border border-border bg-background px-3 py-1 text-xs text-foreground", ring)}
        >
          Reset
        </button>
      </div>
      <div
        ref={scrollerRef}
        tabIndex={0}
        role="region"
        aria-label="Verse column"
        onScroll={onScroll}
        onKeyDown={onKeyDown}
        className={cn("h-64 overflow-y-auto rounded-2xl border border-border bg-background px-4 py-3", ring)}
      >
        <div className="grid gap-4">
          {VERSES.slice(0, count).map((verse, index) => {
            const amount = motionState.amounts[index] ?? 0
            const shift = verseShift(amount, gain)
            return (
              <motion.p
                key={verse.id}
                data-verse={verse.id}
                data-amount={amount.toFixed(3)}
                data-shift={shift.toFixed(1)}
                style={{ opacity: verseOpacity(amount, gain), transform: `translateY(${shift}px)` }}
                className="min-h-16 text-sm leading-6 text-foreground motion-reduce:transition-none"
              >
                {verse.text}
              </motion.p>
            )
          })}
        </div>
      </div>
    </div>
  )
}
