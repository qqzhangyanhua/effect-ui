"use client"

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type WheelEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface OrbitFrameSpinProps {
  pace?: number
  intensity?: number
  auto?: boolean
  snap?: boolean
  className?: string
  onValueChange?: (state: { frame: number; angle: number }) => void
}

export const ORBIT_FRAMES = [
  { frame: 0, angle: 0, shape: "slab" },
  { frame: 1, angle: 45, shape: "wedge" },
  { frame: 2, angle: 90, shape: "edge" },
  { frame: 3, angle: 135, shape: "wedge" },
  { frame: 4, angle: 180, shape: "slab" },
  { frame: 5, angle: 225, shape: "wedge" },
  { frame: 6, angle: 270, shape: "edge" },
  { frame: 7, angle: 315, shape: "wedge" },
] as const

export const ORBIT_DRAG = 320

type OrbitShape = (typeof ORBIT_FRAMES)[number]["shape"]
type OrbitRest = "idle" | "settle"

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

export function wrapAngle(value: number) {
  if (!Number.isFinite(value)) return 0
  const rounded = Math.round(value)
  return ((rounded % 360) + 360) % 360
}

export function frameForAngle(angle: number) {
  return Math.round(wrapAngle(angle) / 45) % 8
}

export function snapAngle(angle: number) {
  return frameForAngle(angle) * 45
}

export function angleFromDrag(start: number, deltaX: number, width: number) {
  const span = width > 0 ? width : ORBIT_DRAG
  return wrapAngle(start + (deltaX / span) * 360)
}

function capture(event: PointerEvent<HTMLElement>) {
  if (typeof event.currentTarget.setPointerCapture !== "function") return
  try {
    event.currentTarget.setPointerCapture(event.pointerId)
  } catch {
    // jsdom 不一定能捕获指针。
  }
}

function OrbitMark({ shape, gain }: { shape: OrbitShape; gain: number }) {
  if (shape === "edge") {
    return <span className="h-28 w-5 rounded-full bg-foreground" style={{ opacity: 0.55 + gain * 0.45 }} />
  }
  if (shape === "wedge") {
    return (
      <span
        className="h-24 w-28 bg-chart-2"
        style={{ clipPath: "polygon(12% 88%, 50% 8%, 88% 88%)", opacity: 0.7 + gain * 0.3 }}
      />
    )
  }
  return <span className="h-20 w-32 rounded-2xl bg-primary" style={{ opacity: 0.75 + gain * 0.25 }} />
}

export function OrbitFrameSpin({
  pace = 1,
  intensity = 0.7,
  auto = false,
  snap = true,
  className,
  onValueChange,
}: OrbitFrameSpinProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const onValueRef = useRef(onValueChange)
  const angleRef = useRef(0)
  const dragRef = useRef(false)
  const originX = useRef(0)
  const originAngle = useRef(0)
  const [angle, setAngle] = useState(0)
  const [drag, setDrag] = useState(false)
  const [rest, setRest] = useState<OrbitRest>("idle")
  const gain = clamp(intensity, 0, 1)
  const rate = rateOf(pace)
  const ms = reduced ? 0 : Math.round(180 / rate)
  const frame = frameForAngle(angle)
  const spinning = auto && live && !reduced && !drag
  const phase = drag ? (reduced ? "idle" : "dragging") : spinning ? "spinning" : reduced ? "idle" : rest

  useEffect(() => {
    onValueRef.current = onValueChange
  }, [onValueChange])

  function commit(next: number) {
    const value = wrapAngle(next)
    angleRef.current = value
    setAngle(value)
    onValueRef.current?.({ frame: frameForAngle(value), angle: value })
  }

  useEffect(() => {
    if (!spinning) return
    let frameId = 0
    let stopped = false
    let last = 0
    const tick = (now: number) => {
      if (stopped) return
      const dt = now > last ? Math.min(0.05, (now - last) / 1000) : 1 / 12
      if (now > 0) last = now
      const prev = frameForAngle(angleRef.current)
      const next = wrapAngle(angleRef.current + dt * 28 * rate)
      angleRef.current = next
      setAngle(next)
      if (frameForAngle(next) !== prev) onValueRef.current?.({ frame: frameForAngle(next), angle: next })
      frameId = window.requestAnimationFrame(tick)
    }
    frameId = window.requestAnimationFrame(tick)
    return () => {
      stopped = true
      window.cancelAnimationFrame(frameId)
    }
  }, [spinning, rate])

  function step(delta: number) {
    const next = ((frameForAngle(angleRef.current) + delta + 8) % 8) * 45
    commit(next)
    setDrag(false)
    setRest(reduced ? "idle" : "settle")
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== undefined && event.button !== 0) return
    dragRef.current = true
    originX.current = event.clientX
    originAngle.current = angleRef.current
    setDrag(true)
    capture(event)
  }

  function readDrag(event: PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    return angleFromDrag(originAngle.current, event.clientX - originX.current, rect.width)
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return
    commit(readDrag(event))
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return
    dragRef.current = false
    const raw = readDrag(event)
    commit(snap ? snapAngle(raw) : raw)
    setDrag(false)
    setRest(reduced ? "idle" : "settle")
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") step(1)
    else if (event.key === "ArrowLeft") step(-1)
    else if (event.key === "Home") {
      commit(0)
      setRest(reduced ? "idle" : "settle")
    } else if (event.key === "End") {
      commit(315)
      setRest(reduced ? "idle" : "settle")
    } else return
    event.preventDefault()
  }

  function onWheel(event: WheelEvent<HTMLDivElement>) {
    if (event.cancelable) event.preventDefault()
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY
    if (delta === 0) return
    step(delta > 0 ? 1 : -1)
  }

  return (
    <div
      ref={ref}
      data-slot="orbit-frame-spin"
      data-ritual="orbit-frames"
      data-pace={rate}
      data-intensity={gain}
      data-auto={auto ? "on" : "off"}
      data-snap={snap ? "on" : "off"}
      data-frame={frame}
      data-angle={angle}
      data-state={phase}
      data-ease={ms}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      className={cn(
        "w-full max-w-md rounded-3xl border border-border bg-card p-3 text-card-foreground select-none motion-reduce:transition-none",
        className,
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Angle</p>
        <p className="text-sm font-semibold text-foreground">{angle}°</p>
      </div>
      <div
        role="slider"
        aria-label="Product angle"
        aria-valuemin={0}
        aria-valuemax={359}
        aria-valuenow={angle}
        aria-valuetext={`${angle} degrees`}
        tabIndex={0}
        data-part="stage"
        onKeyDown={onKeyDown}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="relative h-52 touch-none overflow-hidden rounded-2xl bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {ORBIT_FRAMES.map((item) => (
          <motion.div
            key={item.frame}
            data-frame-layer={item.frame}
            data-shape={item.shape}
            data-active={item.frame === frame ? "true" : "false"}
            className="absolute inset-0 grid place-items-center motion-reduce:transition-none"
            style={{
              opacity: item.frame === frame ? 1 : 0,
              transition: reduced ? "none" : `opacity ${ms}ms linear`,
            }}
          >
            <OrbitMark shape={item.shape} gain={gain} />
          </motion.div>
        ))}
      </div>
      <div className="relative mt-3 h-2 rounded-full bg-muted">
        <span
          data-part="tick"
          className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary motion-reduce:transition-none"
          style={{
            left: `${(frame / 7) * 100}%`,
            boxShadow: `0 0 ${4 + gain * 10}px color-mix(in srgb, var(--primary) 60%, transparent)`,
            transition: reduced ? "none" : `left ${ms}ms linear`,
          }}
        />
      </div>
      <p role="status" className="sr-only">
        {angle} degrees, frame {frame + 1}
      </p>
    </div>
  )
}
