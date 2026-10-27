"use client"

// 原创实现。挂绳是自己的 Verlet 积分，拖开工牌后会摆动并弹回竖直。不使用 matter-js。

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface LanyardBadgeProps {
  label?: string
  onSettle?: () => void
  color?: string
  size?: number
  duration?: number
  className?: string
}

const ROPE_COUNT = 8

interface RopePoint {
  x: number
  y: number
  px: number
  py: number
}

interface RopeSim {
  points: RopePoint[]
  elapsed: number
  settled: boolean
}

interface Pull {
  x: number
  y: number
  t: number
  endX: number
  endY: number
}

function hangPoints(length: number): RopePoint[] {
  const gap = length / (ROPE_COUNT - 1)
  return Array.from({ length: ROPE_COUNT }, (_, index) => {
    const y = gap * index
    return { x: 0, y, px: 0, py: y }
  })
}

function clonePoints(points: readonly RopePoint[]): RopePoint[] {
  return points.map((point) => ({ x: point.x, y: point.y, px: point.px, py: point.py }))
}

function satisfyRope(points: RopePoint[], gap: number, pinEnd: boolean, endX: number, endY: number) {
  const anchor = points[0]
  if (!anchor) return
  anchor.x = 0
  anchor.y = 0
  anchor.px = 0
  anchor.py = 0
  for (let index = 0; index < points.length - 1; index += 1) {
    const left = points[index]
    const right = points[index + 1]
    if (!left || !right) continue
    const dx = right.x - left.x
    const dy = right.y - left.y
    const dist = Math.hypot(dx, dy) || 0.0001
    const share = (dist - gap) / dist
    const ox = dx * share * 0.5
    const oy = dy * share * 0.5
    const rightIsEnd = index + 1 === points.length - 1
    if (index > 0) {
      left.x += ox
      left.y += oy
    }
    if (!(pinEnd && rightIsEnd)) {
      right.x -= ox
      right.y -= oy
    }
  }
  anchor.x = 0
  anchor.y = 0
  if (!pinEnd) return
  const end = points[ROPE_COUNT - 1]
  if (!end) return
  end.x = endX
  end.y = endY
}

function pose(length: number, endX: number, endY: number, vx: number, vy: number): RopePoint[] {
  const points = hangPoints(length)
  const end = points[ROPE_COUNT - 1]
  if (!end) return points
  end.x = endX
  end.y = endY
  const gap = length / (ROPE_COUNT - 1)
  for (let pass = 0; pass < 8; pass += 1) satisfyRope(points, gap, true, endX, endY)
  for (const point of points) {
    point.px = point.x
    point.py = point.y
  }
  end.px = end.x - vx
  end.py = end.y - vy
  return points
}

function integrateRope(points: RopePoint[], dt: number, duration: number, length: number) {
  const damp = Math.exp(-dt / (duration * 0.85))
  const pull = 1 - Math.exp(-dt / (duration * 0.33))
  for (let index = 1; index < points.length; index += 1) {
    const point = points[index]
    if (!point) continue
    const vx = (point.x - point.px) * damp
    const vy = (point.y - point.py) * damp
    point.px = point.x
    point.py = point.y
    point.x += vx
    point.y += vy + dt * dt * 0.0016
  }
  const end = points[ROPE_COUNT - 1]
  if (end) {
    end.x += (0 - end.x) * pull * 0.18
    end.y += (length - end.y) * pull * 0.35
  }
  const gap = length / (ROPE_COUNT - 1)
  for (let pass = 0; pass < 6; pass += 1) satisfyRope(points, gap, false, 0, 0)
}

function LanyardBadge({
  label = "访客证",
  onSettle,
  color,
  size = 120,
  duration = 640,
  className,
}: LanyardBadgeProps) {
  const reduced = usePrefersReducedMotion()
  const length = size * 1.15
  const [points, setPoints] = useState<RopePoint[]>(() => hangPoints(length))
  const [dragging, setDragging] = useState(false)
  const [swinging, setSwinging] = useState(false)
  const [tick, setTick] = useState(0)
  const pull = useRef<Pull | null>(null)
  const sim = useRef<RopeSim | null>(null)
  const onSettleRef = useRef(onSettle)
  const reducedRef = useRef(reduced)
  const durationRef = useRef(duration)
  const lengthRef = useRef(length)
  useEffect(() => {
    onSettleRef.current = onSettle
    reducedRef.current = reduced
    durationRef.current = duration
    lengthRef.current = length
  })

  useEffect(() => {
    const current = sim.current
    if (!current || current.settled || reduced) return
    let last = 0
    let raf = 0
    let alive = true
    const step = (now: number) => {
      if (!alive) return
      if (reducedRef.current) {
        current.settled = true
        setSwinging(false)
        onSettleRef.current?.()
        return
      }
      const dt = last === 0 ? 16 : Math.min(32, Math.max(0, now - last))
      last = now
      current.elapsed += dt
      const rope = lengthRef.current
      integrateRope(current.points, dt, Math.max(180, durationRef.current), rope)
      const end = current.points[ROPE_COUNT - 1]
      const speed = end ? Math.hypot(end.x - end.px, end.y - end.py) : 0
      const offset = end ? Math.hypot(end.x, end.y - rope) : 0
      const done = (offset < 1.5 && speed < 0.5) || current.elapsed >= durationRef.current
      if (done) {
        current.settled = true
        setSwinging(false)
        onSettleRef.current?.()
        return
      }
      setPoints(clonePoints(current.points))
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => {
      alive = false
      cancelAnimationFrame(raf)
    }
  }, [tick, reduced])

  const accent = color ?? "var(--primary)"
  const resting = !dragging && !swinging
  const shown = resting ? hangPoints(length) : points
  const end = shown[ROPE_COUNT - 1]
  const prev = shown[ROPE_COUNT - 2]
  const endX = end?.x ?? 0
  const endY = end?.y ?? length
  const lean = prev && end ? (Math.atan2(end.x - prev.x, end.y - prev.y) * 180) / Math.PI : 0
  const frame = Math.round(size * 2.6)

  function begin(next: RopePoint[]) {
    if (reduced) {
      sim.current = null
      setDragging(false)
      setSwinging(false)
      onSettleRef.current?.()
      return
    }
    sim.current = { points: clonePoints(next), elapsed: 0, settled: false }
    setPoints(clonePoints(next))
    setDragging(false)
    setSwinging(true)
    setTick((value) => value + 1)
  }

  function onPointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
    if (swinging) return
    if (event.pointerType === "mouse" && event.button !== 0) return
    if (reduced) return
    event.currentTarget.setPointerCapture?.(event.pointerId)
    pull.current = { x: event.clientX, y: event.clientY, t: event.timeStamp, endX: 0, endY: length }
    setDragging(true)
  }

  function onPointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
    const current = pull.current
    if (!current || reduced) return
    const endX = event.clientX - current.x
    const endY = Math.max(28, length + (event.clientY - current.y))
    current.endX = endX
    current.endY = endY
    current.t = event.timeStamp
    setPoints(pose(length, endX, endY, 0, 0))
  }

  function onPointerUp(event: ReactPointerEvent<HTMLButtonElement>) {
    const current = pull.current
    pull.current = null
    if (reduced) {
      setDragging(false)
      onSettleRef.current?.()
      return
    }
    if (!current) return
    const endX = event.clientX - current.x
    const endY = Math.max(28, length + (event.clientY - current.y))
    const dt = Math.max(16, event.timeStamp - current.t)
    const vx = ((endX - current.endX) / dt) * 16
    const vy = ((endY - current.endY) / dt) * 16
    begin(pose(length, endX, endY, vx, vy))
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const x = event.key === "ArrowRight" ? 72 : event.key === "ArrowLeft" ? -72 : 0
    const y = event.key === "ArrowDown" ? 36 : event.key === "ArrowUp" ? -28 : 0
    if (x === 0 && y === 0) return
    event.preventDefault()
    if (reduced) {
      onSettleRef.current?.()
      return
    }
    begin(pose(length, x, Math.max(28, length + y), x * 0.35, y * 0.15))
  }

  const rope = shown.map((point) => `${frame / 2 + point.x},${point.y}`).join(" ")

  return (
    <div
      className={cn("relative mx-auto", className)}
      data-reduced={reduced ? "true" : undefined}
      data-slot="lanyard-badge"
      style={{ width: frame, height: length + size * 0.72 }}
    >
      <span
        aria-hidden
        className="absolute top-0 size-3 -translate-x-1/2 rounded-full border-2"
        style={{ left: frame / 2, borderColor: accent }}
      />
      <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
        <polyline fill="none" points={rope} stroke={accent} strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} />
      </svg>
      <button
        aria-label={label}
        className={cn(
          "absolute top-0 touch-none rounded-2xl border px-3 py-2 text-left shadow-md select-none",
          "motion-reduce:transition-none focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
        )}
        data-x={Math.round(endX)}
        data-y={Math.round(endY - length)}
        onKeyDown={onKeyDown}
        onPointerCancel={() => {
          pull.current = null
          setDragging(false)
          if (!reduced) begin(hangPoints(length))
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{
          background: "var(--card)",
          borderColor: accent,
          color: "var(--card-foreground)",
          left: frame / 2 - size / 2,
          transform: `translate(${endX}px, ${endY}px) rotate(${lean}deg)`,
          width: size,
        }}
        type="button"
      >
        <span className="block text-sm font-medium">{label}</span>
        <span className="text-muted-foreground mt-1 block text-xs">拖一拖，它会荡回来</span>
      </button>
    </div>
  )
}

export { LanyardBadge }
