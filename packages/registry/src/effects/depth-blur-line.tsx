"use client"

import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent, type WheelEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface DepthBlurLineProps {
  pace?: number
  intensity?: number
  lines?: number
  falloff?: "linear" | "quadratic"
  className?: string
  onIndexChange?: (index: number) => void
}

type Falloff = "linear" | "quadratic"
type Phase = "idle" | "shifting" | "settle"

const LINES = ["North wind", "Quiet harbor", "Pale lantern", "Open meadow", "Soft meridian", "Low terrace", "Still orchard"] as const
const ROW = 64

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

function linesOf(lines: number) {
  return clamp(Math.round(lines), 4, 7)
}

function falloffOf(falloff: string): Falloff {
  return falloff === "quadratic" ? "quadratic" : "linear"
}

function blurFor(distance: number, gain: number, falloff: Falloff, reduced: boolean) {
  if (reduced || distance === 0) return 0
  const step = 1.4 + gain * 3.2
  const raw = falloff === "quadratic" ? distance * distance * step * 0.65 : distance * step
  return Math.round(Math.min(16, raw) * 10) / 10
}

function opacityFor(distance: number, gain: number, reduced: boolean) {
  if (distance === 0) return 1
  if (reduced) return Math.round(Math.max(0.35, 1 - distance * (0.18 + gain * 0.12)) * 100) / 100
  return Math.round(Math.max(0.72, 1 - distance * 0.06) * 100) / 100
}

function blurText(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

export function DepthBlurLine({
  pace = 1,
  intensity = 0.65,
  lines = 5,
  falloff = "linear",
  className,
  onIndexChange,
}: DepthBlurLineProps) {
  const ref = useRef<HTMLDivElement>(null)
  const frame = useRef(0)
  const indexRef = useRef(0)
  const dragRef = useRef(false)
  const originRef = useRef({ y: 0, index: 0 })
  const skipClick = useRef(false)
  const onIndexRef = useRef(onIndexChange)
  const baseId = useId()
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const reducedRef = useRef(reduced)
  const liveRef = useRef(live)
  const rateRef = useRef(1)
  const gain = clamp(intensity, 0, 1)
  const rate = rateOf(pace)
  const total = linesOf(lines)
  const curve = falloffOf(falloff)
  const items = LINES.slice(0, total)
  const last = items.length - 1
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>("idle")
  const safe = clamp(index, 0, last)
  const current = items[safe] ?? items[0] ?? "North wind"
  const ease = reduced ? 0 : Math.round(280 / rate)

  if (index !== safe) setIndex(safe)

  useEffect(() => {
    reducedRef.current = reduced
    liveRef.current = live
    rateRef.current = rate
    onIndexRef.current = onIndexChange
    indexRef.current = safe
    if (live) return
    window.cancelAnimationFrame(frame.current)
    frame.current = 0
    queueMicrotask(() => {
      if (liveRef.current) return
      setPhase("idle")
    })
  }, [reduced, live, rate, onIndexChange, safe])

  useEffect(() => {
    return () => window.cancelAnimationFrame(frame.current)
  }, [])

  function stopFrame() {
    window.cancelAnimationFrame(frame.current)
    frame.current = 0
  }

  function runShift() {
    stopFrame()
    if (reducedRef.current || !liveRef.current) {
      setPhase("idle")
      return
    }
    setPhase("shifting")
    let left = Math.max(4, Math.round(6 / rateRef.current))
    const tick = () => {
      if (!liveRef.current) {
        setPhase("idle")
        frame.current = 0
        return
      }
      left -= 1
      if (left === 1) setPhase("settle")
      if (left <= 0) {
        setPhase("idle")
        frame.current = 0
        return
      }
      frame.current = window.requestAnimationFrame(tick)
    }
    frame.current = window.requestAnimationFrame(tick)
  }

  function commit(next: number, dragging: boolean) {
    const clamped = clamp(Math.round(next), 0, last)
    const changed = clamped !== indexRef.current
    indexRef.current = clamped
    setIndex(clamped)
    if (changed) onIndexRef.current?.(clamped)
    if (dragging) {
      stopFrame()
      setPhase(reducedRef.current || !liveRef.current ? "idle" : "shifting")
      return
    }
    runShift()
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault()
      commit(indexRef.current + 1, false)
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      commit(indexRef.current - 1, false)
    }
  }

  function onWheel(event: WheelEvent<HTMLDivElement>) {
    if (event.cancelable) event.preventDefault()
    if (event.deltaY > 0) commit(indexRef.current + 1, false)
    else if (event.deltaY < 0) commit(indexRef.current - 1, false)
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== undefined && event.button !== 0) return
    dragRef.current = true
    originRef.current = { y: event.clientY, index: indexRef.current }
    stopFrame()
    if (!reducedRef.current && liveRef.current) setPhase("shifting")
    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      // jsdom 没有指针捕获。
    }
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return
    const next = originRef.current.index + (originRef.current.y - event.clientY) / ROW
    commit(next, true)
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return
    dragRef.current = false
    const dy = originRef.current.y - event.clientY
    if (Math.abs(dy) > 4) skipClick.current = true
    commit(originRef.current.index + dy / ROW, false)
  }

  return (
    <div
      ref={ref}
      data-slot="depth-blur-line"
      data-ritual="depth-blur"
      data-layout="line-stack"
      data-pace={rate}
      data-intensity={gain}
      data-lines={total}
      data-falloff={curve}
      data-index={safe}
      data-line={current}
      data-state={phase}
      data-ease={ease}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      className={cn(
        "w-full max-w-xl rounded-3xl border border-border bg-card p-4 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <div
        role="listbox"
        aria-label="景深标题"
        aria-activedescendant={`${baseId}-line-${safe}`}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="touch-none outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {items.map((line, itemIndex) => {
          const distance = Math.abs(itemIndex - safe)
          const active = distance === 0
          const blur = blurFor(distance, gain, curve, reduced)
          const opacity = opacityFor(distance, gain, reduced)
          const filter = blur === 0 ? "none" : `blur(${blur}px)`
          return (
            <motion.button
              key={line}
              id={`${baseId}-line-${itemIndex}`}
              type="button"
              role="option"
              aria-selected={active}
              data-index={itemIndex}
              data-blur={blurText(blur)}
              data-opacity={opacity.toFixed(2)}
              data-active={active ? "yes" : "no"}
              initial={false}
              animate={{ opacity, filter }}
              transition={reduced ? { duration: 0 } : { duration: 0.28 / rate, ease: "easeOut" }}
              onClick={() => {
                if (skipClick.current) {
                  skipClick.current = false
                  return
                }
                commit(itemIndex, false)
              }}
              className="block w-full rounded-xl px-1 py-1 text-left font-sans text-4xl tracking-tight text-foreground outline-none motion-reduce:blur-none motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-ring"
              style={{ opacity, filter }}
            >
              {line}
            </motion.button>
          )
        })}
      </div>
      <p role="status" className="sr-only">
        {current}
      </p>
    </div>
  )
}
