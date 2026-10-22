"use client"

// 原创实现。按下时用弹簧积分把按钮压扁，松手后弹回，点击仍然会触发。不使用 matter-js。

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface JellyButtonProps {
  label?: string
  onClick?: () => void
  color?: string
  size?: number
  duration?: number
  className?: string
}

interface SoftBody {
  x: number
  y: number
  px: number
  py: number
  targetX: number
  targetY: number
  pressed: boolean
  elapsed: number
}

function stepBlob(body: SoftBody, dt: number, duration: number) {
  const span = Math.max(160, duration)
  const damp = Math.exp((-3.1 * dt) / span)
  const pull = (dt * dt) / (span * span) * 62
  const vx = (body.x - body.px) * damp
  const vy = (body.y - body.py) * damp
  body.px = body.x
  body.py = body.y
  body.x += vx + (body.targetX - body.x) * pull
  body.y += vy + (body.targetY - body.y) * pull
}

function JellyButton({ label = "按一下", onClick, color, size = 48, duration = 420, className }: JellyButtonProps) {
  const reduced = usePrefersReducedMotion()
  const [scale, setScale] = useState({ x: 1, y: 1 })
  const [pressed, setPressed] = useState(false)
  const [tick, setTick] = useState(0)
  const body = useRef<SoftBody>({
    x: 1,
    y: 1,
    px: 1,
    py: 1,
    targetX: 1,
    targetY: 1,
    pressed: false,
    elapsed: 0,
  })
  const running = useRef(false)
  const swallowClick = useRef(false)
  const onClickRef = useRef(onClick)
  const reducedRef = useRef(reduced)
  const durationRef = useRef(duration)
  useEffect(() => {
    onClickRef.current = onClick
    reducedRef.current = reduced
    durationRef.current = duration
  })

  useEffect(() => {
    if (reduced) {
      running.current = false
      const soft = body.current
      soft.x = 1
      soft.y = 1
      soft.px = 1
      soft.py = 1
      soft.targetX = 1
      soft.targetY = 1
      soft.pressed = false
      return
    }
    if (!running.current) return
    let last = 0
    let raf = 0
    let alive = true
    const step = (now: number) => {
      if (!alive) return
      if (reducedRef.current) {
        running.current = false
        setScale({ x: 1, y: 1 })
        return
      }
      const soft = body.current
      const dt = last === 0 ? 16 : Math.min(32, Math.max(0, now - last))
      last = now
      if (!soft.pressed) soft.elapsed += dt
      stepBlob(soft, dt, durationRef.current)
      const near =
        Math.abs(soft.x - soft.targetX) < 0.02 &&
        Math.abs(soft.y - soft.targetY) < 0.02 &&
        Math.hypot(soft.x - soft.px, soft.y - soft.py) < 0.015
      if (!soft.pressed && (near || soft.elapsed >= durationRef.current)) {
        running.current = false
        soft.x = 1
        soft.y = 1
        soft.px = 1
        soft.py = 1
        setScale({ x: 1, y: 1 })
        return
      }
      setScale({ x: soft.x, y: soft.y })
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => {
      alive = false
      cancelAnimationFrame(raf)
    }
  }, [tick, reduced])

  const accent = color ?? "var(--primary)"
  const scaleX = reduced ? 1 : scale.x
  const scaleY = reduced ? 1 : scale.y

  function activate() {
    onClickRef.current?.()
  }

  function pressDown() {
    setPressed(true)
    if (reduced) return
    const soft = body.current
    soft.pressed = true
    soft.targetX = 1.14
    soft.targetY = 0.8
    soft.elapsed = 0
    if (running.current) return
    running.current = true
    setTick((value) => value + 1)
  }

  function pressUp() {
    setPressed(false)
    const soft = body.current
    soft.pressed = false
    soft.targetX = 1
    soft.targetY = 1
    soft.elapsed = 0
  }

  function onPointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return
    event.currentTarget.setPointerCapture?.(event.pointerId)
    pressDown()
  }

  function onPointerUp(event: ReactPointerEvent<HTMLButtonElement>) {
    pressUp()
    if (event.pointerType !== "touch") return
    swallowClick.current = true
    activate()
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== "Enter" && event.key !== " ") return
    event.preventDefault()
    pressDown()
    activate()
  }

  function onKeyUp(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== "Enter" && event.key !== " ") return
    pressUp()
  }

  return (
    <button
      className={cn(
        "touch-none rounded-full px-6 font-medium shadow-md select-none",
        "motion-reduce:transition-none focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
        className,
      )}
      data-pressed={pressed ? "true" : undefined}
      data-reduced={reduced ? "true" : undefined}
      data-scale-x={scaleX.toFixed(3)}
      data-scale-y={scaleY.toFixed(3)}
      data-slot="jelly-button"
      onClick={() => {
        if (swallowClick.current) {
          swallowClick.current = false
          return
        }
        activate()
      }}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      onPointerCancel={() => pressUp()}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      style={{
        background: accent,
        color: "var(--primary-foreground)",
        height: size,
        transform: reduced ? undefined : `scale(${scaleX}, ${scaleY})`,
      }}
      type="button"
    >
      {label}
    </button>
  )
}

export { JellyButton }
