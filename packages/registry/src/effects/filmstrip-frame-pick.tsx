"use client"

import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent, type WheelEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface FilmstripFramePickProps {
  pace?: number
  intensity?: number
  count?: number
  snap?: boolean
  className?: string
  onIndexChange?: (index: number) => void
}

type Shape = "circle" | "diamond" | "bars" | "ring"
type Phase = "idle" | "scrubbing" | "settle"

interface Frame {
  id: string
  label: string
  shape: Shape
  tone: string
}

const FRAME_FALLBACK: Frame = { id: "a", label: "Frame A", shape: "circle", tone: "bg-chart-1" }

const FRAMES: readonly Frame[] = [
  { id: "a", label: "Frame A", shape: "circle", tone: "bg-chart-1" },
  { id: "b", label: "Frame B", shape: "diamond", tone: "bg-chart-2" },
  { id: "c", label: "Frame C", shape: "bars", tone: "bg-chart-3" },
  { id: "d", label: "Frame D", shape: "ring", tone: "bg-chart-4" },
  { id: "e", label: "Frame E", shape: "circle", tone: "bg-chart-5" },
  { id: "f", label: "Frame F", shape: "diamond", tone: "bg-chart-1" },
  { id: "g", label: "Frame G", shape: "bars", tone: "bg-chart-2" },
  { id: "h", label: "Frame H", shape: "ring", tone: "bg-chart-3" },
  { id: "i", label: "Frame I", shape: "circle", tone: "bg-chart-4" },
  { id: "j", label: "Frame J", shape: "diamond", tone: "bg-chart-5" },
  { id: "k", label: "Frame K", shape: "bars", tone: "bg-chart-1" },
  { id: "l", label: "Frame L", shape: "ring", tone: "bg-chart-2" },
]

const FRAME_STEP = 88

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

function countOf(count: number) {
  return clamp(Math.round(count), 8, 12)
}

function scaleFor(distance: number, gain: number, active: boolean) {
  if (active) return Math.round((1 + gain * 0.08) * 100) / 100
  return Math.round(Math.max(0.82, 1 - distance * gain * 0.08) * 100) / 100
}

function FrameMark({ shape }: { shape: Shape }) {
  const common = "bg-current text-current"
  if (shape === "diamond") return <span className={cn("size-8 rotate-45", common)} />
  if (shape === "bars") {
    return (
      <span className="flex h-8 items-end gap-1">
        <span className={cn("h-3 w-1.5", common)} />
        <span className={cn("h-6 w-1.5", common)} />
        <span className={cn("h-4 w-1.5", common)} />
      </span>
    )
  }
  if (shape === "ring") return <span className="size-8 rounded-full border-4 border-current" />
  return <span className={cn("size-8 rounded-full", common)} />
}

export function FilmstripFramePick({
  pace = 1,
  intensity = 0.65,
  count = 10,
  snap = true,
  className,
  onIndexChange,
}: FilmstripFramePickProps) {
  const ref = useRef<HTMLDivElement>(null)
  const frame = useRef(0)
  const indexRef = useRef(0)
  const dragRef = useRef(false)
  const originRef = useRef({ x: 0, index: 0 })
  const skipClick = useRef(false)
  const onIndexRef = useRef(onIndexChange)
  const baseId = useId()
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const reducedRef = useRef(reduced)
  const liveRef = useRef(live)
  const snapRef = useRef(snap)
  const rateRef = useRef(1)
  const gain = clamp(intensity, 0, 1)
  const rate = rateOf(pace)
  const total = countOf(count)
  const items = FRAMES.slice(0, total)
  const last = items.length - 1
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>("idle")
  const safe = clamp(index, 0, last)
  const current = items[safe] ?? items[0] ?? FRAME_FALLBACK
  const ease = reduced || !snap ? 0 : Math.round(280 / rate)

  if (index !== safe) setIndex(safe)

  useEffect(() => {
    reducedRef.current = reduced
    liveRef.current = live
    snapRef.current = snap
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
  }, [reduced, live, snap, rate, onIndexChange, safe])

  useEffect(() => {
    return () => window.cancelAnimationFrame(frame.current)
  }, [])

  function stopFrame() {
    window.cancelAnimationFrame(frame.current)
    frame.current = 0
  }

  function runSettle() {
    stopFrame()
    if (reducedRef.current || !liveRef.current || !snapRef.current) {
      setPhase("idle")
      return
    }
    setPhase("settle")
    let left = Math.max(3, Math.round(5 / rateRef.current))
    const tick = () => {
      if (!liveRef.current) {
        setPhase("idle")
        frame.current = 0
        return
      }
      left -= 1
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
      setPhase(reducedRef.current || !liveRef.current ? "idle" : "scrubbing")
      return
    }
    runSettle()
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault()
      commit(indexRef.current + 1, false)
    } else if (event.key === "ArrowLeft") {
      event.preventDefault()
      commit(indexRef.current - 1, false)
    }
  }

  function onWheel(event: WheelEvent<HTMLDivElement>) {
    if (event.cancelable) event.preventDefault()
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY
    if (delta > 0) commit(indexRef.current + 1, false)
    else if (delta < 0) commit(indexRef.current - 1, false)
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== undefined && event.button !== 0) return
    dragRef.current = true
    originRef.current = { x: event.clientX, index: indexRef.current }
    stopFrame()
    if (!reducedRef.current && liveRef.current) setPhase("scrubbing")
    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      // jsdom 没有指针捕获。
    }
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return
    const next = originRef.current.index - (event.clientX - originRef.current.x) / FRAME_STEP
    commit(next, true)
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return
    dragRef.current = false
    const dx = event.clientX - originRef.current.x
    if (Math.abs(dx) > 4) skipClick.current = true
    commit(originRef.current.index - dx / FRAME_STEP, false)
  }

  return (
    <div
      ref={ref}
      data-slot="filmstrip-frame-pick"
      data-ritual="filmstrip"
      data-layout="frame-pick"
      data-pace={rate}
      data-intensity={gain}
      data-count={total}
      data-snap={snap ? "on" : "off"}
      data-index={safe}
      data-frame={current.id}
      data-label={current.label}
      data-state={phase}
      data-ease={ease}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      className={cn(
        "grid w-full max-w-xl gap-3 rounded-3xl border border-border bg-card p-4 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <motion.div
        data-part="preview"
        data-frame={current.id}
        initial={false}
        animate={{ opacity: 1, scale: 1 }}
        transition={reduced || !snap ? { duration: 0 } : { duration: 0.28 / rate, ease: "easeOut" }}
        className={cn("grid h-44 place-items-center rounded-2xl text-background", current.tone)}
      >
        <FrameMark shape={current.shape} />
        <span className="sr-only">{current.label}</span>
      </motion.div>
      <div
        data-part="strip"
        role="listbox"
        aria-label="胶片条"
        aria-activedescendant={`${baseId}-${current.id}`}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="relative touch-none overflow-hidden rounded-xl bg-foreground/90 py-1 outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div
          aria-hidden
          data-part="sprocket"
          data-contrast={gain.toFixed(2)}
          className="mx-2 h-2.5"
          style={{
            opacity: 0.35 + gain * 0.65,
            backgroundImage: "radial-gradient(circle, var(--background) 42%, transparent 46%)",
            backgroundSize: "14px 10px",
          }}
        />
        <div aria-hidden className="pointer-events-none absolute inset-y-0 left-1/2 z-10 w-px bg-primary" />
        <motion.div
          className="flex px-[calc(50%-2.5rem)]"
          initial={false}
          animate={{ x: -safe * FRAME_STEP }}
          transition={phase === "scrubbing" || reduced || !snap ? { duration: 0 } : { duration: 0.28 / rate, ease: "easeOut" }}
        >
          {items.map((item, itemIndex) => {
            const active = itemIndex === safe
            const distance = Math.abs(itemIndex - safe)
            const scale = scaleFor(distance, gain, active)
            return (
              <button
                key={item.id}
                id={`${baseId}-${item.id}`}
                type="button"
                role="option"
                aria-selected={active}
                aria-label={item.label}
                tabIndex={-1}
                data-index={itemIndex}
                data-frame={item.id}
                data-scale={scale.toFixed(2)}
                data-active={active ? "yes" : "no"}
                onClick={() => {
                  if (skipClick.current) {
                    skipClick.current = false
                    return
                  }
                  commit(itemIndex, false)
                }}
                className="w-[5rem] shrink-0 px-1 outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className={cn("grid h-14 place-items-center rounded-md text-background", item.tone)} style={{ transform: `scale(${scale})` }}>
                  <FrameMark shape={item.shape} />
                </span>
              </button>
            )
          })}
        </motion.div>
        <div
          aria-hidden
          className="mx-2 h-2.5"
          style={{
            opacity: 0.35 + gain * 0.65,
            backgroundImage: "radial-gradient(circle, var(--background) 42%, transparent 46%)",
            backgroundSize: "14px 10px",
          }}
        />
      </div>
      <p role="status" className="sr-only">
        {`Frame ${safe + 1} of ${total}`}
      </p>
    </div>
  )
}
