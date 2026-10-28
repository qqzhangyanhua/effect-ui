"use client"

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface PerforateTicketTearProps {
  pace?: number
  intensity?: number
  threshold?: number
  axis?: "vertical" | "horizontal"
  className?: string
  onTear?: () => void
}

const TRAVEL = 180

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

function thresholdOf(threshold: number) {
  return clamp(threshold, 0.2, 0.8)
}

function axisOf(axis: string): "vertical" | "horizontal" {
  return axis === "horizontal" ? "horizontal" : "vertical"
}

export function PerforateTicketTear({
  pace = 1,
  intensity = 0.65,
  threshold = 0.45,
  axis = "vertical",
  className,
  onTear,
}: PerforateTicketTearProps) {
  const ref = useRef<HTMLDivElement>(null)
  const frame = useRef(0)
  const dragRef = useRef(false)
  const originRef = useRef({ x: 0, y: 0, progress: 0 })
  const progressRef = useRef(0)
  const phaseRef = useRef<"intact" | "dragging" | "torn" | "rebound">("intact")
  const onTearRef = useRef(onTear)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const liveRef = useRef(live)
  const reducedRef = useRef(reduced)
  const rateRef = useRef(1)
  const gain = clamp(intensity, 0, 1)
  const rate = rateOf(pace)
  const limit = thresholdOf(threshold)
  const direction = axisOf(axis)
  const notch = Math.round(4 + gain * 8)
  const spin = Math.round(8 + gain * 16)
  const ease = reduced ? 0 : Math.round(280 / rate)
  const [progress, setProgress] = useState(0)
  const [torn, setTorn] = useState(false)
  const [phase, setPhase] = useState<"intact" | "dragging" | "torn" | "rebound">("intact")

  useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  useEffect(() => {
    onTearRef.current = onTear
    liveRef.current = live
    reducedRef.current = reduced
    rateRef.current = rate
    if (live) return
    window.cancelAnimationFrame(frame.current)
    frame.current = 0
    queueMicrotask(() => {
      if (liveRef.current || phaseRef.current !== "rebound") return
      progressRef.current = 0
      setProgress(0)
      setPhase("intact")
    })
  }, [onTear, live, reduced, rate])

  useEffect(() => {
    return () => window.cancelAnimationFrame(frame.current)
  }, [])

  function stopFrame() {
    window.cancelAnimationFrame(frame.current)
    frame.current = 0
  }

  function setAmount(next: number) {
    const value = quantize(next)
    progressRef.current = value
    setProgress(value)
  }

  function tear() {
    if (torn) return
    stopFrame()
    setTorn(true)
    setAmount(1)
    setPhase("torn")
    onTearRef.current?.()
    if (reducedRef.current || !liveRef.current) return
    let left = Math.max(3, Math.round(6 / rateRef.current))
    const tick = () => {
      if (!liveRef.current) {
        frame.current = 0
        return
      }
      left -= 1
      if (left <= 0) {
        frame.current = 0
        return
      }
      frame.current = window.requestAnimationFrame(tick)
    }
    frame.current = window.requestAnimationFrame(tick)
  }

  function rebound(from: number) {
    dragRef.current = false
    stopFrame()
    if (reducedRef.current || !liveRef.current) {
      setAmount(0)
      setPhase("intact")
      return
    }
    setPhase("rebound")
    let step = 0
    const total = Math.max(4, Math.round(8 / rateRef.current))
    const tick = () => {
      if (!liveRef.current) {
        setAmount(0)
        setPhase("intact")
        frame.current = 0
        return
      }
      step += 1
      if (step >= total) {
        setAmount(0)
        setPhase("intact")
        frame.current = 0
        return
      }
      setAmount(from * (1 - step / total))
      frame.current = window.requestAnimationFrame(tick)
    }
    frame.current = window.requestAnimationFrame(tick)
  }

  function commit(next: number) {
    dragRef.current = false
    if (next >= limit) tear()
    else rebound(next)
  }

  function reset() {
    stopFrame()
    dragRef.current = false
    setTorn(false)
    setAmount(0)
    setPhase("intact")
  }

  function readProgress(event: PointerEvent<HTMLDivElement>) {
    const delta = direction === "horizontal" ? event.clientX - originRef.current.x : event.clientY - originRef.current.y
    return quantize(originRef.current.progress + delta / TRAVEL)
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (torn || (event.button !== undefined && event.button !== 0)) return
    stopFrame()
    dragRef.current = true
    originRef.current = { x: event.clientX, y: event.clientY, progress: progressRef.current }
    setPhase(reducedRef.current ? "intact" : "dragging")
    if (typeof event.currentTarget.setPointerCapture === "function") {
      try {
        event.currentTarget.setPointerCapture(event.pointerId)
      } catch {
        // jsdom 不一定能捕获指针。
      }
    }
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current || torn) return
    setAmount(readProgress(event))
    setPhase(reducedRef.current ? "intact" : "dragging")
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current || torn) return
    commit(readProgress(event))
  }

  function bump(directionStep: number) {
    if (torn) return
    stopFrame()
    const next = quantize(progressRef.current + directionStep * 0.1)
    setAmount(next)
    setPhase(reducedRef.current ? "intact" : "dragging")
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault()
      bump(1)
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault()
      bump(-1)
    } else if (event.key === "Enter") {
      event.preventDefault()
      if (torn) return
      commit(progressRef.current)
    }
  }

  const shift = torn ? 72 : progress * 64
  const turn = torn ? spin : 0
  const transform =
    direction === "horizontal"
      ? `translateX(${shift}px) rotate(${turn}deg)`
      : `translateY(${shift}px) rotate(${turn}deg)`

  return (
    <div
      ref={ref}
      data-slot="perforate-ticket-tear"
      data-ritual="ticket-tear"
      data-pace={rate}
      data-intensity={gain}
      data-threshold={limit}
      data-axis={direction}
      data-progress={progress.toFixed(2)}
      data-torn={torn ? "yes" : "no"}
      data-notch={notch}
      data-spin={spin}
      data-state={phase}
      data-ease={ease}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      className={cn(
        "relative w-full max-w-sm rounded-3xl border border-border bg-card p-4 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <div className={cn("flex gap-2", direction === "horizontal" ? "flex-row items-stretch" : "flex-col")}>
        <div data-part="face" className="relative min-w-0 flex-1 rounded-2xl bg-background p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Admit One</p>
          <p className="mt-1 text-lg text-foreground">Day Pass</p>
          <div data-part="code" className="mt-4 flex h-8 items-end gap-0.5" aria-hidden>
            {Array.from({ length: 10 }, (_, index) => (
              <span key={index} className={cn("bg-foreground", index % 2 === 0 ? "h-8 w-1.5" : "h-5 w-1")} />
            ))}
          </div>
          {torn ? (
            <p
              data-stamp
              className="absolute right-3 top-3 rounded-md border-2 border-primary px-2 py-1 text-xs font-medium uppercase text-primary"
            >
              Redeemed
            </p>
          ) : null}
        </div>
        <svg
          data-perforation
          viewBox={direction === "horizontal" ? "0 0 16 120" : "0 0 240 16"}
          className={direction === "horizontal" ? "h-auto w-4 shrink-0" : "h-4 w-full"}
          aria-hidden
        >
          {direction === "horizontal" ? (
            <>
              <circle cx={8} cy={8} r={notch} fill="none" stroke="var(--foreground)" />
              <circle cx={8} cy={112} r={notch} fill="none" stroke="var(--foreground)" />
              <line x1={8} y1={16} x2={8} y2={104} stroke="var(--foreground)" strokeWidth={2} strokeDasharray="4 4" />
            </>
          ) : (
            <>
              <circle cx={8} cy={8} r={notch} fill="none" stroke="var(--foreground)" />
              <circle cx={232} cy={8} r={notch} fill="none" stroke="var(--foreground)" />
              <line x1={16} y1={8} x2={224} y2={8} stroke="var(--foreground)" strokeWidth={2} strokeDasharray="4 4" />
            </>
          )}
        </svg>
        <motion.div
          role="slider"
          aria-label="撕开票根"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
          aria-valuetext={torn ? "Redeemed" : "Stub A"}
          tabIndex={0}
          data-part="stub"
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="touch-none rounded-2xl bg-muted px-4 py-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
          style={{
            transform,
            transition: reduced ? "none" : `transform ${ease}ms ease`,
          }}
        >
          Stub A
        </motion.div>
      </div>
      <div className="mt-3 flex gap-2">
        {reduced && !torn ? (
          <button type="button" onClick={tear} className="rounded-full bg-primary px-4 py-1.5 text-sm text-primary-foreground">
            Tear
          </button>
        ) : null}
        {torn ? (
          <button type="button" onClick={reset} className="rounded-full border border-border px-4 py-1.5 text-sm">
            Reset
          </button>
        ) : null}
      </div>
    </div>
  )
}
