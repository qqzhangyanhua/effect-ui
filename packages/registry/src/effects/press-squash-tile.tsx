"use client"

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

/**
 * Inspired by Insight Timer, Tide Guide, and Snapchat (via Mobbin), original implementation.
 * https://mobbin.com/screens/f42a0d01-ad79-4d5e-a32f-f234c8c65e4d
 * https://mobbin.com/screens/0a2e6244-f3ac-4dc8-80e5-480754feeb93
 * https://mobbin.com/screens/af80cd74-548e-4033-9233-6198aa74953c
 * https://mobbin.com/screens/a6e69b41-ae6e-4e2e-b6b6-b0bb75f27e9c
 */

export interface PressSquashTileProps {
  pace?: number
  intensity?: number
  shadow?: boolean
  axis?: "y" | "uniform"
  className?: string
  onValueChange?: (state: { tile: string; pose: PressPose }) => void
}

export type PressPose = "rest" | "pressed" | "return"
export type PressAxis = "y" | "uniform"

const TILES = [
  { id: "field", title: "Field note", body: "A short record from the morning pass." },
  { id: "shelf", title: "Shelf card", body: "Neutral copy stays readable while the tile settles." },
] as const

type TileId = (typeof TILES)[number]["id"]

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

export function pressAxisOf(axis: string | undefined): PressAxis {
  return axis === "uniform" ? "uniform" : "y"
}

export function squashScale(intensity: number, axis: PressAxis) {
  const drop = 0.045 + clamp(intensity, 0, 1) * 0.1
  if (axis === "uniform") {
    const next = Math.round((1 - drop * 0.72) * 1000) / 1000
    return { x: next, y: next }
  }
  return { x: 1, y: Math.round((1 - drop) * 1000) / 1000 }
}

export function settleFrames(pace: number, stiffness = 1) {
  const firm = clamp(stiffness, 0.5, 1.6)
  return clamp(Math.round(16 / (rateOf(pace) * firm)), 8, 22)
}

export function settleAt(step: number, total: number, from: number, to: number, overshoot: number) {
  const t = clamp(step / Math.max(1, total), 0, 1)
  if (t >= 1) return to
  const peak = to + overshoot
  if (Math.abs(overshoot) < 0.000001) return from + (to - from) * t
  if (t < 0.7) {
    const u = t / 0.7
    return from + (peak - from) * (1 - (1 - u) ** 3)
  }
  const u = (t - 0.7) / 0.3
  return peak + (to - peak) * (u * u * (3 - 2 * u))
}

function shadowFor(enabled: boolean, amount: number) {
  if (!enabled || amount <= 0.04) return "0 1px 2px color-mix(in oklab, var(--foreground) 10%, transparent)"
  const depth = Math.round(2 + amount * 7)
  const blur = Math.round(8 + amount * 8)
  const alpha = Math.round(16 + amount * 14)
  return `0 ${depth}px ${blur}px color-mix(in oklab, var(--foreground) ${alpha}%, transparent)`
}

function capture(event: PointerEvent<HTMLElement>) {
  if (typeof event.currentTarget.setPointerCapture !== "function") return
  try {
    event.currentTarget.setPointerCapture(event.pointerId)
  } catch {
    // jsdom 不一定能捕获指针。
  }
}

export function PressSquashTile({
  pace = 1,
  intensity = 0.4,
  shadow = true,
  axis = "y",
  className,
  onValueChange,
}: PressSquashTileProps) {
  const ref = useRef<HTMLDivElement>(null)
  const frameRef = useRef(0)
  const tileRef = useRef<TileId>(TILES[0].id)
  const phaseRef = useRef<PressPose>("rest")
  const amountRef = useRef(0)
  const liveRef = useRef(false)
  const reducedRef = useRef(false)
  const paceRef = useRef(1)
  const gainRef = useRef(0.4)
  const axisRef = useRef<PressAxis>("y")
  const buttons = useRef<Array<HTMLButtonElement | null>>([])
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const gain = clamp(intensity, 0, 1)
  const paceRate = rateOf(pace)
  const mode = pressAxisOf(axis)
  const ease = reduced ? 0 : Math.round(180 / paceRate)
  const [tile, setTile] = useState<TileId>(TILES[0].id)
  const [pose, setPose] = useState<PressPose>("rest")
  const [amount, setAmount] = useState(0)
  const resting = squashScale(gain, mode)
  const scaleX = 1 - (1 - resting.x) * amount
  const scaleY = 1 - (1 - resting.y) * amount

  useEffect(() => {
    liveRef.current = live
    reducedRef.current = reduced
    paceRef.current = paceRate
    gainRef.current = gain
    axisRef.current = mode
  }, [live, reduced, paceRate, gain, mode])

  useEffect(() => {
    if ((live && !reduced) || frameRef.current === 0) return
    window.cancelAnimationFrame(frameRef.current)
    frameRef.current = 0
    amountRef.current = 0
    phaseRef.current = "rest"
    setAmount(0)
    setPose("rest")
  }, [live, reduced])

  useEffect(() => {
    return () => {
      if (frameRef.current !== 0) window.cancelAnimationFrame(frameRef.current)
    }
  }, [])

  function publish(nextTile: TileId, nextAmount: number, nextPose: PressPose) {
    tileRef.current = nextTile
    amountRef.current = nextAmount
    phaseRef.current = nextPose
    setTile(nextTile)
    setAmount(nextAmount)
    setPose(nextPose)
  }

  function cancel() {
    if (frameRef.current === 0) return
    window.cancelAnimationFrame(frameRef.current)
    frameRef.current = 0
  }

  function release(id: TileId, from: number) {
    cancel()
    if (reducedRef.current || !liveRef.current) {
      publish(id, 0, "rest")
      onValueChange?.({ tile: id, pose: "rest" })
      return
    }
    const overshoot = -(0.16 + gainRef.current * 0.2)
    const frames = settleFrames(paceRef.current)
    let step = 0
    const tick = () => {
      if (!liveRef.current || reducedRef.current) {
        publish(id, 0, "rest")
        frameRef.current = 0
        return
      }
      step += 1
      const done = step >= frames
      const next = done ? 0 : settleAt(step, frames, from, 0, overshoot)
      publish(id, next, done ? "rest" : "return")
      if (done) {
        frameRef.current = 0
        onValueChange?.({ tile: id, pose: "rest" })
        return
      }
      frameRef.current = window.requestAnimationFrame(tick)
    }
    frameRef.current = window.requestAnimationFrame(tick)
  }

  function pressTile(id: TileId) {
    liveRef.current = live
    reducedRef.current = reduced
    cancel()
    if (reduced || !live) {
      publish(id, 0, "rest")
      onValueChange?.({ tile: id, pose: "rest" })
      return
    }
    publish(id, 1, "pressed")
    onValueChange?.({ tile: id, pose: "pressed" })
    release(id, 1)
  }

  function onPointerDown(event: PointerEvent<HTMLButtonElement>, id: TileId) {
    if (event.button !== undefined && event.button !== 0) return
    liveRef.current = live
    reducedRef.current = reduced
    cancel()
    publish(id, reduced || !live ? 0 : 1, reduced || !live ? "rest" : "pressed")
    if (!reduced && live) onValueChange?.({ tile: id, pose: "pressed" })
    capture(event)
  }

  function onPointerUp() {
    if (phaseRef.current === "rest" && amountRef.current === 0) return
    release(tileRef.current, amountRef.current || 1)
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, id: TileId, index: number) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      pressTile(id)
      return
    }
    const next = event.key === "ArrowRight" || event.key === "ArrowDown" ? index + 1 : event.key === "ArrowLeft" || event.key === "ArrowUp" ? index - 1 : null
    if (next === null) return
    event.preventDefault()
    const wrapped = (next + TILES.length) % TILES.length
    buttons.current[wrapped]?.focus()
  }

  return (
    <div
      ref={ref}
      data-slot="press-squash-tile"
      data-ritual="press-squash"
      data-pace={paceRate}
      data-intensity={gain}
      data-shadow={shadow ? "on" : "off"}
      data-axis={mode}
      data-tile={tile}
      data-pose={pose}
      data-amount={amount.toFixed(3)}
      data-playing={pose === "return" && live ? "on" : "off"}
      data-ease={ease}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      className={cn("w-full rounded-3xl border border-border bg-card p-4 text-card-foreground motion-reduce:transition-none", className)}
    >
      <p className="mb-3 text-sm text-muted-foreground">Press a tile. It flattens, then settles.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {TILES.map((item, index) => {
          const active = tile === item.id && pose !== "rest"
          return (
            <motion.button
              key={item.id}
              ref={(node) => {
                buttons.current[index] = node
              }}
              type="button"
              aria-label={item.title}
              data-tile={item.id}
              data-pose={tile === item.id ? pose : "rest"}
              onPointerDown={(event) => onPointerDown(event, item.id)}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onKeyDown={(event) => onKeyDown(event, item.id, index)}
              style={{
                transform: active ? `scale(${scaleX}, ${scaleY})` : "scale(1, 1)",
                boxShadow: shadowFor(shadow, tile === item.id ? Math.max(0, amount) : 0),
              }}
              className="origin-center rounded-2xl border border-border bg-background px-4 py-3 text-left outline-none touch-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
            >
              <span className="block text-sm font-semibold text-foreground">{item.title}</span>
              <span className="mt-1 block text-sm text-muted-foreground">{item.body}</span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
