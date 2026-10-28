"use client"

import { useEffect, useRef, useState, type KeyboardEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface PresenceNameCursorsProps {
  pace?: number
  intensity?: number
  count?: number
  trail?: boolean
  className?: string
  onFocusChange?: (index: number) => void
}

interface Person {
  id: string
  name: string
  ink: string
  chip: string
  dot: string
  x: number
  y: number
}

const PEOPLE: readonly Person[] = [
  { id: "ada", name: "Ada", ink: "text-chart-1", chip: "bg-chart-1", dot: "bg-chart-1", x: 18, y: 28 },
  { id: "kai", name: "Kai", ink: "text-chart-2", chip: "bg-chart-2", dot: "bg-chart-2", x: 48, y: 22 },
  { id: "remy", name: "Remy", ink: "text-chart-3", chip: "bg-chart-3", dot: "bg-chart-3", x: 72, y: 36 },
  { id: "noor", name: "Noor", ink: "text-chart-4", chip: "bg-chart-4", dot: "bg-chart-4", x: 30, y: 62 },
  { id: "jules", name: "Jules", ink: "text-chart-5", chip: "bg-chart-5", dot: "bg-chart-5", x: 58, y: 68 },
  { id: "quinn", name: "Quinn", ink: "text-primary", chip: "bg-primary", dot: "bg-primary", x: 78, y: 58 },
]

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

function countOf(count: number) {
  return clamp(Math.round(count), 3, 6)
}

function round1(value: number) {
  return Math.round(value * 10) / 10
}

function cursorPoint(person: Person, index: number, time: number, pace: number, reduced: boolean) {
  if (reduced) return { x: person.x, y: person.y }
  const speed = 0.65 * pace
  return {
    x: round1(person.x + Math.sin(time * speed + index) * 7),
    y: round1(person.y + Math.cos(time * speed * 0.85 + index * 1.2) * 6),
  }
}

export function PresenceNameCursors({
  pace = 1,
  intensity = 0.6,
  count = 4,
  trail = true,
  className,
  onFocusChange,
}: PresenceNameCursorsProps) {
  const ref = useRef<HTMLDivElement>(null)
  const frame = useRef(0)
  const timeRef = useRef(0)
  const nodes = useRef<Array<HTMLButtonElement | null>>([])
  const onFocusRef = useRef(onFocusChange)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const liveRef = useRef(live)
  const reducedRef = useRef(reduced)
  const pinnedRef = useRef(false)
  const rateRef = useRef(1)
  const gain = clamp(intensity, 0, 1)
  const rate = rateOf(pace)
  const total = countOf(count)
  const people = PEOPLE.slice(0, total)
  const [time, setTime] = useState(0)
  const [focus, setFocus] = useState(-1)
  const [pinned, setPinned] = useState(false)
  const safeFocus = focus >= total ? -1 : focus
  const fade = Math.round((1 - gain * 0.65) * 100) / 100
  const ease = reduced ? 0 : Math.round(220 / rate)

  if (focus !== safeFocus) setFocus(safeFocus)

  useEffect(() => {
    onFocusRef.current = onFocusChange
  }, [onFocusChange])

  useEffect(() => {
    rateRef.current = rate
    pinnedRef.current = pinned
    liveRef.current = live
    reducedRef.current = reduced
  }, [rate, pinned, live, reduced])

  useEffect(() => {
    if (reduced || !live || pinned) {
      window.cancelAnimationFrame(frame.current)
      frame.current = 0
      return
    }
    let last = 0
    const tick = (now: number) => {
      if (!liveRef.current || reducedRef.current || pinnedRef.current) {
        frame.current = 0
        return
      }
      const dt = now > last ? Math.min(0.05, (now - last) / 1000) : 1 / 12
      last = now > 0 ? now : last
      timeRef.current += dt * rateRef.current
      setTime(timeRef.current)
      frame.current = window.requestAnimationFrame(tick)
    }
    frame.current = window.requestAnimationFrame(tick)
    return () => {
      window.cancelAnimationFrame(frame.current)
      frame.current = 0
    }
  }, [reduced, live, pinned])

  function focusAt(index: number) {
    const next = clamp(index, 0, total - 1)
    if (next !== safeFocus) setPinned(false)
    setFocus(next)
    onFocusRef.current?.(next)
  }

  function move(from: number, direction: number) {
    const next = from < 0 ? (direction > 0 ? 0 : total - 1) : (from + direction + total) % total
    focusAt(next)
    nodes.current[next]?.focus()
  }

  function togglePin() {
    if (safeFocus < 0) return
    setPinned((value) => !value)
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault()
      move(index, 1)
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault()
      move(index, -1)
    } else if (event.key === "Enter") {
      event.preventDefault()
      togglePin()
    }
  }

  const active = people[safeFocus]
  const state = pinned ? "pinned" : safeFocus >= 0 ? "focused" : "drifting"

  return (
    <div
      ref={ref}
      data-slot="presence-name-cursors"
      data-ritual="named-cursors"
      data-pace={rate}
      data-intensity={gain}
      data-count={total}
      data-trail={trail ? "on" : "off"}
      data-focus={safeFocus}
      data-pinned={pinned ? "yes" : "no"}
      data-state={state}
      data-ease={ease}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      className={cn(
        "relative w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <div className="relative h-64" role="listbox" aria-label="具名光标">
        {people.map((person, index) => {
          const point = cursorPoint(person, index, time, rate, reduced)
          const selected = index === safeFocus
          const opacity = selected ? 1 : fade
          const scale = !reduced && selected ? round1(1.08 + gain * 0.08) : 1
          return (
            <button
              key={person.id}
              ref={(node) => {
                nodes.current[index] = node
              }}
              type="button"
              role="option"
              aria-selected={selected}
              aria-label={person.name}
              data-cursor={person.id}
              data-x={point.x.toFixed(1)}
              data-y={point.y.toFixed(1)}
              data-active={selected ? "yes" : "no"}
              data-opacity={opacity}
              data-scale={scale}
              tabIndex={0}
              onClick={() => focusAt(index)}
              onKeyDown={(event) => onKeyDown(event, index)}
              className={cn(
                "absolute flex items-center gap-1 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
                selected ? "z-10" : "z-0",
              )}
              style={{
                left: `${point.x}%`,
                top: `${point.y}%`,
                opacity,
                transform: `scale(${scale})`,
                transition: reduced ? "none" : `left ${ease}ms linear, top ${ease}ms linear, opacity ${ease}ms linear`,
              }}
            >
              {trail && selected && !reduced ? (
                <span data-part="trail" className="absolute -left-3 top-2 flex gap-1" aria-hidden>
                  <span className={cn("size-1.5 rounded-full", person.dot)} />
                  <span className={cn("size-1 rounded-full opacity-70", person.dot)} />
                </span>
              ) : null}
              <motion.svg viewBox="0 0 24 24" className={cn("size-5", person.ink)} aria-hidden>
                <path d="M5 3 L19 12 L12 13 L9 20 Z" fill="currentColor" />
              </motion.svg>
              <span className={cn("rounded-full px-2 py-0.5 text-xs text-background", person.chip)}>
                {person.name}
              </span>
            </button>
          )
        })}
      </div>
      <p role="status" className="border-t border-border px-4 py-2 text-sm text-muted-foreground">
        {active ? `${active.name} selected` : "Drifting"}
      </p>
    </div>
  )
}
