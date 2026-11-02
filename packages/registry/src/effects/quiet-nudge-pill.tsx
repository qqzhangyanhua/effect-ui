"use client"

import { useEffect, useRef, useState, type KeyboardEvent } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

/**
 * Inspired by Polywork, Meetup, Basecamp, and Featurebase (via Mobbin), original implementation.
 * https://mobbin.com/screens/d495c8e4-9dd9-4a35-bbd3-e7fdda8c9277
 * https://mobbin.com/screens/f73ef774-f449-42d0-a86b-519cfc981700
 * https://mobbin.com/screens/df4d2d66-257e-4ed6-aa16-287b7c8b2575
 * https://mobbin.com/screens/ae0912c2-be83-4ecc-94aa-739de368d189
 */
export interface QuietNudgePillProps {
  pace?: number
  intensity?: number
  count?: number
  autoBreathe?: boolean
  className?: string
  onValueChange?: (state: { read: boolean; count: number }) => void
}

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

export function nudgeCount(count: number) {
  if (!Number.isFinite(count)) return 1
  return clamp(Math.round(count), 1, 9)
}

export function QuietNudgePill({
  pace = 1,
  intensity = 0.3,
  count = 1,
  autoBreathe = true,
  className,
  onValueChange,
}: QuietNudgePillProps) {
  const ref = useRef<HTMLDivElement>(null)
  const doneRef = useRef(false)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const gain = clamp(intensity, 0, 1)
  const paceRate = rateOf(pace)
  const shown = nudgeCount(count)
  const ms = reduced ? 0 : Math.round(280 / paceRate)
  const [read, setRead] = useState(false)
  const [phase, setPhase] = useState(0)
  const [running, setRunning] = useState(false)
  const onValueRef = useRef(onValueChange)
  const want = live && !reduced && autoBreathe && !read
  const wash = Math.sin(Math.min(1, Math.max(0, phase)) * Math.PI) * (0.12 + gain * 0.2)

  useEffect(() => {
    onValueRef.current = onValueChange
  }, [onValueChange])

  useEffect(() => {
    if (!want || doneRef.current) return
    doneRef.current = true
    let frame = 0
    let stopped = false
    let step = 1
    const total = Math.max(8, Math.round(20 / paceRate))
    setRunning(true)
    setPhase(1 / total)
    const tick = () => {
      if (stopped) return
      step += 1
      const next = Math.min(1, step / total)
      setPhase(next)
      if (next < 1) frame = window.requestAnimationFrame(tick)
      else setRunning(false)
    }
    frame = window.requestAnimationFrame(tick)
    return () => {
      stopped = true
      window.cancelAnimationFrame(frame)
      setRunning(false)
    }
  }, [want, paceRate])

  function emit(nextRead: boolean) {
    onValueRef.current?.({ read: nextRead, count: shown })
  }

  function markRead() {
    setRead(true)
    emit(true)
  }

  function onPillKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "Enter") {
      event.preventDefault()
      markRead()
      return
    }
    if (event.key !== " " && event.key !== "Spacebar") return
    event.preventDefault()
    event.stopPropagation()
    const next = !read
    if (!next) doneRef.current = false
    setRead(next)
    setPhase(0)
    setRunning(false)
    emit(next)
  }

  return (
    <div
      ref={ref}
      data-slot="quiet-nudge-pill"
      data-ritual="quiet-nudge"
      data-pace={paceRate}
      data-intensity={gain}
      data-count={shown}
      data-auto={autoBreathe ? "on" : "off"}
      data-read={read ? "on" : "off"}
      data-phase={phase.toFixed(2)}
      data-playing={running ? "on" : "off"}
      data-ease={ms}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      className={cn(
        "w-full max-w-xl rounded-3xl border border-border bg-card p-4 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="pt-2 text-xs text-muted-foreground">Inbox</p>
        <button
          type="button"
          data-pill=""
          aria-pressed={read}
          aria-label={read ? "Marked read" : `${shown} waiting`}
          onClick={markRead}
          onKeyDown={onPillKeyDown}
          className="relative h-11 min-w-11 shrink-0 rounded-full border border-border bg-background px-3 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
        >
          <span
            aria-hidden="true"
            data-wash=""
            className="pointer-events-none absolute inset-0 rounded-full motion-reduce:transition-none"
            style={{
              background: "color-mix(in srgb, var(--primary) 28%, transparent)",
              opacity: read || reduced ? 0 : wash,
              transition: reduced ? "none" : `opacity ${ms}ms linear`,
            }}
          />
          <span className="relative">
            {read ? (
              <span data-dot="" className="mx-auto block size-1.5 rounded-full bg-muted-foreground/70" />
            ) : (
              <span data-label="">{shown} 条待回</span>
            )}
          </span>
        </button>
      </div>
      <p data-body="" className="mt-3 text-sm leading-6 text-foreground">
        The note is ready for a reply. The page stays quiet until you mark it read.
      </p>
    </div>
  )
}
