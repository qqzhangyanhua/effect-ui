"use client"

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface DragLockEscapeProps {
  radius?: number
  threshold?: number
  pace?: number
  intensity?: number
  className?: string
  onUnlock?: () => void
}

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

export function DragLockEscape({
  radius = 88,
  threshold = 1,
  pace = 1,
  intensity = 0.6,
  className,
  onUnlock,
}: DragLockEscapeProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const ring = clamp(radius, 24, 220)
  const gateRatio = clamp(threshold, 0.2, 2)
  const gate = ring * gateRatio
  const gain = clamp(intensity, 0, 1)
  const step = Math.round(ring * 40) / 100
  const decay = clamp(0.45 + (1 - clamp(rateOf(pace), 0.4, 2)) * 0.15, 0.35, 0.75)
  const stage = Math.round(ring * 2 + 112)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [phase, setPhase] = useState<"locked" | "dragging" | "unlocked" | "snapped-back">("locked")
  const [snapping, setSnapping] = useState(false)
  const offsetRef = useRef({ x: 0, y: 0 })
  const unlockedRef = useRef(false)
  const dragRef = useRef<{ x: number; y: number; ox: number; oy: number; pointerId: number } | null>(null)
  const onUnlockRef = useRef(onUnlock)
  const distance = Math.hypot(offset.x, offset.y)
  const outside = distance + 0.01 >= gate

  useEffect(() => {
    onUnlockRef.current = onUnlock
  }, [onUnlock])

  useEffect(() => {
    if (!snapping || reduced || !live || unlockedRef.current) return
    let frame = 0
    let stopped = false
    const tick = () => {
      if (stopped) return
      const current = offsetRef.current
      const next = { x: current.x * decay, y: current.y * decay }
      if (Math.hypot(next.x, next.y) < 0.8) {
        offsetRef.current = { x: 0, y: 0 }
        setOffset({ x: 0, y: 0 })
        setSnapping(false)
        setPhase("snapped-back")
        return
      }
      offsetRef.current = next
      setOffset(next)
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => {
      stopped = true
      window.cancelAnimationFrame(frame)
    }
  }, [snapping, reduced, live, decay])

  function unlock() {
    if (unlockedRef.current) return
    unlockedRef.current = true
    dragRef.current = null
    setSnapping(false)
    setPhase("unlocked")
    onUnlockRef.current?.()
  }

  function reset() {
    unlockedRef.current = false
    dragRef.current = null
    offsetRef.current = { x: 0, y: 0 }
    setOffset({ x: 0, y: 0 })
    setSnapping(false)
    setPhase("locked")
  }

  function place(x: number, y: number) {
    if (unlockedRef.current || reduced) return
    const dist = Math.hypot(x, y)
    if (dist >= gate) {
      const scale = dist === 0 ? 0 : gate / dist
      const next = { x: x * scale, y: y * scale }
      offsetRef.current = next
      setOffset(next)
      unlock()
      return
    }
    offsetRef.current = { x, y }
    setOffset({ x, y })
    setSnapping(false)
    setPhase("dragging")
  }

  function nudge(dx: number, dy: number) {
    if (reduced || unlockedRef.current) return
    const next = { x: offsetRef.current.x + dx, y: offsetRef.current.y + dy }
    offsetRef.current = next
    setOffset(next)
    setSnapping(false)
    setPhase("dragging")
  }

  function onPointerDown(event: PointerEvent<HTMLButtonElement>) {
    if (reduced || unlockedRef.current || (event.button !== undefined && event.button !== 0)) return
    event.preventDefault()
    dragRef.current = {
      x: event.clientX,
      y: event.clientY,
      ox: offsetRef.current.x,
      oy: offsetRef.current.y,
      pointerId: event.pointerId,
    }
    setPhase("dragging")
    if (typeof event.currentTarget.setPointerCapture === "function") {
      try {
        event.currentTarget.setPointerCapture(event.pointerId)
      } catch {
        return
      }
    }
  }

  function onPointerMove(event: PointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    place(drag.ox + event.clientX - drag.x, drag.oy + event.clientY - drag.y)
  }

  function onPointerUp(event: PointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    dragRef.current = null
    if (unlockedRef.current) return
    const dist = Math.hypot(offsetRef.current.x, offsetRef.current.y)
    if (dist >= gate) unlock()
    else if (dist > 0.5) setSnapping(true)
    else setPhase("locked")
  }

  function onLockKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "Escape") {
      event.preventDefault()
      reset()
      return
    }
    if (event.key === "ArrowRight") nudge(step, 0)
    else if (event.key === "ArrowLeft") nudge(-step, 0)
    else if (event.key === "ArrowDown") nudge(0, step)
    else if (event.key === "ArrowUp") nudge(0, -step)
    else if (event.key === "Enter") {
      event.preventDefault()
      if (Math.hypot(offsetRef.current.x, offsetRef.current.y) >= gate) unlock()
      return
    } else return
    event.preventDefault()
  }

  const message =
    phase === "unlocked" ? "已解锁" : outside ? "已离开安全圆，按 Enter 确认" : `拖拽进度 ${Math.min(100, Math.round((distance / gate) * 100))}%`

  return (
    <div
      ref={ref}
      data-slot="drag-lock-escape"
      data-ritual="drag-lock"
      data-radius={ring}
      data-threshold={gateRatio}
      data-pace={Number.isFinite(pace) ? pace : 1}
      data-intensity={gain}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      data-state={phase}
      data-snapping={snapping ? "on" : "off"}
      data-distance={distance.toFixed(1)}
      data-outside={outside ? "on" : "off"}
      data-step={step}
      role="group"
      aria-label="把锁拖出安全圆"
      onKeyDown={(event) => {
        if (event.key !== "Escape") return
        event.preventDefault()
        reset()
      }}
      className={cn(
        "w-full max-w-md rounded-3xl border border-border bg-card p-4 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <div className="relative mx-auto" style={{ width: stage, height: stage }} data-stage="">
        <div
          aria-hidden
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: ring * 2,
            height: ring * 2,
            boxShadow: `0 0 ${16 + gain * 36}px color-mix(in oklch, var(--primary) ${Math.round(20 + gain * 45)}%, transparent)`,
          }}
        />
        <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox={`0 0 ${stage} ${stage}`} aria-hidden>
          <circle
            data-safe-circle=""
            cx={stage / 2}
            cy={stage / 2}
            r={ring}
            fill="none"
            stroke="var(--foreground)"
            strokeOpacity={0.35 + gain * 0.45}
            strokeWidth={2}
            strokeDasharray="6 8"
          />
        </svg>
        <button
          type="button"
          data-lock=""
          aria-label="锁"
          disabled={reduced}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onKeyDown={onLockKeyDown}
          style={{
            left: stage / 2,
            top: stage / 2,
            transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
          }}
          className="absolute grid size-14 place-items-center rounded-full border border-border bg-background text-foreground outline-none touch-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-70 motion-reduce:transition-none"
        >
          <svg viewBox="0 0 24 24" aria-hidden className="size-6">
            <rect x="5" y="10" width="14" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <path d="M8 10 V7 a4 4 0 0 1 8 0 V10" fill="none" stroke="currentColor" strokeWidth="1.8" />
          </svg>
        </button>
      </div>
      <p role="status" data-announcement="" className="mt-2 text-center text-sm text-muted-foreground">
        {message}
      </p>
      <div className="mt-3 flex justify-center gap-2">
        {reduced ? (
          <button type="button" onClick={() => unlock()} className="rounded-full bg-primary px-3 py-1.5 text-sm text-primary-foreground">
            Unlock
          </button>
        ) : null}
        <button type="button" onClick={reset} className="rounded-full border border-border px-3 py-1.5 text-sm">
          复位
        </button>
      </div>
    </div>
  )
}
