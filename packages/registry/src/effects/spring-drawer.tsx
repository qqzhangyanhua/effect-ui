"use client"

// 原创实现。抽屉用 Verlet 惯性跟着拉手走，甩一下会自己弹开或关上。不使用 matter-js。

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface SpringDrawerProps {
  title?: string
  onOpenChange?: (open: boolean) => void
  color?: string
  size?: number
  duration?: number
  className?: string
}

interface Track {
  x: number
  px: number
  target: number
  travel: number
  elapsed: number
  done: boolean
}

interface Grip {
  originX: number
  originOffset: number
  offset: number
  time: number
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function stepTrack(body: Track, dt: number, duration: number) {
  const damp = Math.exp(-dt / Math.max(120, duration * 0.42))
  const pull = 1 - Math.exp(-dt / Math.max(90, duration * 0.22))
  const vx = (body.x - body.px) * damp
  body.px = body.x
  body.x += vx
  body.x += (body.target - body.x) * pull
  const slack = 28
  if (body.x < -slack) body.x = -slack
  if (body.x > body.travel + slack) body.x = body.travel + slack
}

function SpringDrawer({
  title = "快捷抽屉",
  onOpenChange,
  color,
  size = 280,
  duration = 560,
  className,
}: SpringDrawerProps) {
  const reduced = usePrefersReducedMotion()
  const [offset, setOffset] = useState(0)
  const [open, setOpen] = useState(false)
  const [tick, setTick] = useState(0)
  const track = useRef<Track | null>(null)
  const grip = useRef<Grip | null>(null)
  const offsetRef = useRef(0)
  const openRef = useRef(false)
  const goalRef = useRef(false)
  const onOpenChangeRef = useRef(onOpenChange)
  const reducedRef = useRef(reduced)
  const durationRef = useRef(duration)
  const sizeRef = useRef(size)
  useEffect(() => {
    onOpenChangeRef.current = onOpenChange
    reducedRef.current = reduced
    durationRef.current = duration
    sizeRef.current = size
    offsetRef.current = offset
    openRef.current = open
  })

  function commit(nextOpen: boolean, nextOffset: number) {
    offsetRef.current = nextOffset
    setOffset(nextOffset)
    if (openRef.current === nextOpen) return
    openRef.current = nextOpen
    setOpen(nextOpen)
    onOpenChangeRef.current?.(nextOpen)
  }

  useEffect(() => {
    const current = track.current
    if (!current || current.done || reduced) return
    let last = 0
    let raf = 0
    let alive = true
    const step = (now: number) => {
      if (!alive) return
      if (reducedRef.current) {
        current.done = true
        commit(current.target > 0, current.target)
        return
      }
      const dt = last === 0 ? 16 : Math.min(32, Math.max(0, now - last))
      last = now
      current.elapsed += dt
      stepTrack(current, dt, Math.max(160, durationRef.current))
      const speed = Math.abs(current.x - current.px)
      const near = Math.abs(current.x - current.target) < 2 && speed < 1.2
      if (near || current.elapsed >= durationRef.current) {
        current.done = true
        commit(current.target > 0, current.target)
        return
      }
      offsetRef.current = current.x
      setOffset(current.x)
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => {
      alive = false
      cancelAnimationFrame(raf)
    }
  }, [tick, reduced])

  const accent = color ?? "var(--primary)"

  function seek(nextOpen: boolean, from = offsetRef.current) {
    goalRef.current = nextOpen
    const travel = sizeRef.current
    const target = nextOpen ? travel : 0
    if (reduced) {
      track.current = null
      commit(nextOpen, target)
      return
    }
    const kick = nextOpen ? 18 : -18
    track.current = { x: from, px: from - kick, target, travel, elapsed: 0, done: false }
    setTick((value) => value + 1)
  }

  function decideOpen(next: number, speed: number) {
    if (speed > 1.5) return true
    if (speed < -1.5) return false
    return next > size * 0.45
  }

  function onPointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return
    event.currentTarget.setPointerCapture?.(event.pointerId)
    const current = offsetRef.current
    grip.current = { originX: event.clientX, originOffset: current, offset: current, time: event.timeStamp }
  }

  function onPointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
    const current = grip.current
    if (!current || reduced) return
    const next = clamp(current.originOffset + event.clientX - current.originX, 0, size)
    current.offset = next
    current.time = event.timeStamp
    offsetRef.current = next
    setOffset(next)
  }

  function onPointerUp(event: ReactPointerEvent<HTMLButtonElement>) {
    const current = grip.current
    grip.current = null
    if (!current) return
    const next = clamp(current.originOffset + event.clientX - current.originX, 0, size)
    const dt = Math.max(16, event.timeStamp - current.time)
    const speed = (next - current.offset) / dt
    const nextOpen = decideOpen(next, speed)
    if (reduced) {
      seek(nextOpen, next)
      return
    }
    offsetRef.current = next
    setOffset(next)
    seek(nextOpen, next)
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault()
      seek(true)
      return
    }
    if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault()
      seek(false)
      return
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      seek(!goalRef.current)
    }
  }

  return (
    <div
      className={cn("bg-background relative h-64 overflow-hidden rounded-2xl border", className)}
      data-open={open ? "true" : "false"}
      data-reduced={reduced ? "true" : undefined}
      data-slot="spring-drawer"
      style={{ borderColor: accent, width: size + 48 }}
    >
      <div
        className="absolute inset-y-0 left-0 flex flex-col gap-3 border-r p-4 motion-reduce:transition-none"
        data-offset={Math.round(offset)}
        style={{
          background: "var(--card)",
          borderColor: accent,
          color: "var(--card-foreground)",
          transform: `translateX(${offset - size}px)`,
          width: size,
        }}
      >
        <p className="text-sm font-medium">{title}</p>
        <p className="text-muted-foreground text-sm">{open ? "已经拉开" : "按住拉手甩开，或按回车切换"}</p>
        <div className="mt-auto flex gap-2">
          <span className="bg-muted rounded-full px-3 py-1 text-xs">新建</span>
          <span className="bg-muted rounded-full px-3 py-1 text-xs">归档</span>
        </div>
      </div>
      <button
        aria-expanded={open}
        aria-label={open ? "关闭抽屉" : "打开抽屉"}
        className={cn(
          "absolute top-8 z-10 flex h-20 w-8 touch-none items-center justify-center rounded-r-xl border text-xs select-none",
          "motion-reduce:transition-none focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
        )}
        onKeyDown={onKeyDown}
        onPointerCancel={() => {
          grip.current = null
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{
          background: accent,
          borderColor: accent,
          color: "var(--primary-foreground)",
          transform: `translateX(${offset}px)`,
        }}
        type="button"
      >
        拉
      </button>
    </div>
  )
}

export { SpringDrawer }
