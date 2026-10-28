"use client"

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface SwipeStyleCycleProps {
  pace?: number
  intensity?: number
  count?: number
  threshold?: number
  className?: string
  onThemeChange?: (index: number) => void
}

const WIDTH = 280

const THEMES = [
  { id: "plain", name: "默认", card: "border-border bg-card text-card-foreground" },
  { id: "accent", name: "强调", card: "border-primary bg-card text-card-foreground" },
  { id: "ink", name: "深底", card: "border-foreground bg-foreground text-background" },
  { id: "soft", name: "软底", card: "border-accent bg-accent text-accent-foreground" },
] as const

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

function themeCount(count: number) {
  return clamp(Math.round(count), 3, 4)
}

function thresholdOf(threshold: number) {
  return clamp(threshold, 0.2, 0.6)
}

export function SwipeStyleCycle({
  pace = 1,
  intensity = 0.7,
  count = 3,
  threshold = 0.28,
  className,
  onThemeChange,
}: SwipeStyleCycleProps) {
  const ref = useRef<HTMLDivElement>(null)
  const frame = useRef(0)
  const dragRef = useRef(false)
  const originRef = useRef(0)
  const themeRef = useRef(0)
  const onThemeRef = useRef(onThemeChange)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const liveRef = useRef(live)
  const gain = clamp(intensity, 0, 1)
  const rate = rateOf(pace)
  const total = themeCount(count)
  const gate = thresholdOf(threshold)
  const damp = 0.45 + gain * 0.55
  const themes = THEMES.slice(0, total)
  const [theme, setTheme] = useState(0)
  const [dx, setDx] = useState(0)
  const [phase, setPhase] = useState<"idle" | "dragging" | "settle">("idle")
  const safe = ((theme % total) + total) % total
  const current = themes[safe] ?? themes[0] ?? THEMES[0]
  const bar = current.id === "plain" ? 0 : Math.round(4 + gain * 10)

  if (theme !== safe) setTheme(safe)

  useEffect(() => {
    onThemeRef.current = onThemeChange
  }, [onThemeChange])

  useEffect(() => {
    themeRef.current = safe
  }, [safe])

  useEffect(() => {
    liveRef.current = live
    if (live) return
    window.cancelAnimationFrame(frame.current)
    frame.current = 0
    queueMicrotask(() => {
      if (liveRef.current) return
      setDx(0)
      setPhase("idle")
    })
  }, [live])

  useEffect(() => {
    return () => window.cancelAnimationFrame(frame.current)
  }, [])

  function stopFrame() {
    window.cancelAnimationFrame(frame.current)
    frame.current = 0
  }

  function applyTheme(next: number) {
    const wrapped = ((next % total) + total) % total
    themeRef.current = wrapped
    setTheme(wrapped)
    onThemeRef.current?.(wrapped)
  }

  function glide(from: number) {
    if (reduced || !liveRef.current || Math.abs(from) < 1) {
      setDx(0)
      setPhase("idle")
      return
    }
    setDx(Math.round(from))
    setPhase("settle")
    let currentDx = from
    const tick = () => {
      if (!liveRef.current) {
        setDx(0)
        setPhase("idle")
        frame.current = 0
        return
      }
      currentDx *= 1 - (0.28 + rate * 0.12)
      if (Math.abs(currentDx) < 1) {
        setDx(0)
        setPhase("idle")
        frame.current = 0
        return
      }
      setDx(Math.round(currentDx))
      frame.current = window.requestAnimationFrame(tick)
    }
    frame.current = window.requestAnimationFrame(tick)
  }

  function step(direction: number) {
    stopFrame()
    dragRef.current = false
    applyTheme(themeRef.current + direction)
    setDx(0)
    setPhase("idle")
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (reduced) return
    if (event.button !== undefined && event.button !== 0) return
    stopFrame()
    dragRef.current = true
    originRef.current = event.clientX
    setPhase("dragging")
    setDx(0)
    if (typeof event.currentTarget.setPointerCapture === "function") {
      try {
        event.currentTarget.setPointerCapture(event.pointerId)
      } catch {
        // jsdom 里不一定能捕获指针。
      }
    }
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current || reduced) return
    setDx(Math.round(event.clientX - originRef.current))
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current || reduced) return
    dragRef.current = false
    const raw = event.clientX - originRef.current
    const passed = Math.abs(raw * damp) >= WIDTH * gate
    if (passed) applyTheme(themeRef.current + (raw < 0 ? 1 : -1))
    glide(raw)
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault()
      step(1)
    } else if (event.key === "ArrowLeft") {
      event.preventDefault()
      step(-1)
    }
  }

  return (
    <div
      ref={ref}
      data-slot="swipe-style-cycle"
      data-ritual="style-cycle"
      data-pace={rate}
      data-intensity={gain}
      data-count={total}
      data-threshold={gate}
      data-theme={safe}
      data-theme-name={current.name}
      data-dx={dx}
      data-state={phase}
      data-actions="none"
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      className={cn("w-full max-w-sm text-foreground motion-reduce:transition-none", className)}
    >
      <div
        role="group"
        aria-label="风格卡片"
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className={cn(
          "relative touch-none overflow-hidden rounded-3xl border p-5 outline-none transition-transform motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-ring",
          current.card,
        )}
        style={{ transform: `translateX(${dx}px)` }}
      >
        <span
          aria-hidden
          data-bar
          className="mb-3 block rounded-full bg-primary"
          style={{ width: bar, height: bar > 0 ? 4 : 0 }}
        />
        <p className="text-lg font-semibold">同一张卡片</p>
        <p className="mt-1 text-sm opacity-80">标题和正文留在原地，只换这一张卡的皮肤。</p>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => step(1)}
          className="rounded-full border border-border bg-card px-3 py-1.5 text-sm text-foreground"
        >
          Next style
        </button>
        <div className="flex gap-1.5">
          {themes.map((item, index) => (
            <button
              key={item.id}
              type="button"
              aria-label={`主题 ${item.name}`}
              aria-current={index === safe ? "true" : undefined}
              onClick={() => step(index - safe)}
              className={cn("h-2.5 w-2.5 rounded-full", index === safe ? "bg-primary" : "bg-muted")}
            />
          ))}
        </div>
      </div>
      <p role="status" className="mt-2 text-sm text-muted-foreground">
        当前主题 {current.name}
      </p>
    </div>
  )
}
