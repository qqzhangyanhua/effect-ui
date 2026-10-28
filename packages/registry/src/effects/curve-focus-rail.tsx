"use client"

import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent, type WheelEvent } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface CurveFocusRailProps {
  pace?: number
  intensity?: number
  count?: number
  spread?: number
  className?: string
  onIndexChange?: (index: number) => void
}

const ROW = 56

const ITEMS = [
  { id: "capture", title: "Capture", copy: "先把素材收进来，不急着下判断。", swatch: "bg-chart-1" },
  { id: "triage", title: "Triage", copy: "挑出值得继续的部分。", swatch: "bg-chart-2" },
  { id: "align", title: "Align", copy: "把方向对齐到同一句话。", swatch: "bg-chart-3" },
  { id: "review", title: "Review", copy: "对照原意再看一遍。", swatch: "bg-chart-4" },
  { id: "share", title: "Share", copy: "交给下一位接着看。", swatch: "bg-chart-5" },
  { id: "archive", title: "Archive", copy: "收好这一轮的结果。", swatch: "bg-chart-1" },
  { id: "reset", title: "Reset", copy: "清空后重新开始。", swatch: "bg-chart-2" },
] as const

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

function itemCount(count: number) {
  return clamp(Math.round(count), 4, 7)
}

function spreadOf(spread: number) {
  return clamp(Math.round(spread), 1, 3)
}

export function CurveFocusRail({
  pace = 1,
  intensity = 0.65,
  count = 5,
  spread = 2,
  className,
  onIndexChange,
}: CurveFocusRailProps) {
  const ref = useRef<HTMLDivElement>(null)
  const frame = useRef(0)
  const dragRef = useRef(false)
  const originRef = useRef(0)
  const skipClick = useRef(false)
  const indexRef = useRef(0)
  const onIndexRef = useRef(onIndexChange)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const liveRef = useRef(live)
  const baseId = useId()
  const gain = clamp(intensity, 0, 1)
  const rate = rateOf(pace)
  const total = itemCount(count)
  const arc = spreadOf(spread)
  const last = total - 1
  const ease = reduced ? 0 : Math.round(240 / rate)
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<"idle" | "scrolling">("idle")
  const safe = Math.min(index, last)
  const items = ITEMS.slice(0, total)
  const current = items[safe] ?? items[0] ?? ITEMS[0]
  const step = 7 + gain * 12
  const focusScale = Math.round((1 + gain * 0.28) * 100) / 100

  if (index !== safe) setIndex(safe)

  useEffect(() => {
    onIndexRef.current = onIndexChange
  }, [onIndexChange])

  useEffect(() => {
    indexRef.current = safe
  }, [safe])

  useEffect(() => {
    liveRef.current = live
    if (live) return
    window.cancelAnimationFrame(frame.current)
    frame.current = 0
    queueMicrotask(() => {
      if (liveRef.current) return
      setPhase((currentPhase) => (currentPhase === "scrolling" ? "idle" : currentPhase))
    })
  }, [live])

  useEffect(() => {
    return () => window.cancelAnimationFrame(frame.current)
  }, [])

  function stopFrame() {
    window.cancelAnimationFrame(frame.current)
    frame.current = 0
  }

  function commit(next: number, animate: boolean) {
    stopFrame()
    const clamped = clamp(Math.round(next), 0, last)
    const changed = clamped !== indexRef.current
    indexRef.current = clamped
    setIndex(clamped)
    if (changed) onIndexRef.current?.(clamped)
    if (!animate || reduced || !liveRef.current) {
      setPhase("idle")
      return
    }
    setPhase("scrolling")
    let left = Math.max(6, Math.round(8 / rate))
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

  function jump(next: number) {
    commit(next, false)
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault()
      jump(indexRef.current + 1)
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      jump(indexRef.current - 1)
    }
  }

  function onWheel(event: WheelEvent<HTMLDivElement>) {
    if (event.cancelable) event.preventDefault()
    if (event.deltaY > 0) jump(indexRef.current + 1)
    else if (event.deltaY < 0) jump(indexRef.current - 1)
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== undefined && event.button !== 0) return
    dragRef.current = true
    originRef.current = event.clientY
    stopFrame()
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return
    dragRef.current = false
    const dy = event.clientY - originRef.current
    if (Math.abs(dy) > 4) skipClick.current = true
    const steps = Math.round(-dy / ROW)
    const target = clamp(indexRef.current + steps, 0, last)
    const flicked = Math.abs(dy) >= ROW * 0.85
    if (target === indexRef.current && !flicked) {
      setPhase("idle")
      return
    }
    commit(target, !reduced && liveRef.current)
  }

  return (
    <div
      ref={ref}
      data-slot="curve-focus-rail"
      data-ritual="curve-rail"
      data-pace={rate}
      data-intensity={gain}
      data-count={total}
      data-spread={arc}
      data-index={safe}
      data-layout={reduced ? "flat" : "arc"}
      data-state={phase}
      data-ease={ease}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      className={cn(
        "grid w-full max-w-xl gap-4 rounded-3xl border border-border bg-card p-4 text-card-foreground motion-reduce:transition-none md:grid-cols-[180px_1fr]",
        className,
      )}
    >
      <div
        role="listbox"
        aria-label="弧形焦点"
        aria-activedescendant={`${baseId}-${current.id}`}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="relative h-72 touch-none outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {items.map((item, itemIndex) => {
          const delta = itemIndex - safe
          const dist = Math.abs(delta)
          const hidden = !reduced && dist > arc
          const rotate = reduced ? 0 : delta * step
          const shift = reduced ? delta * 36 : delta * (46 - gain * 8)
          const scale = reduced || dist === 0 ? (reduced ? 1 : focusScale) : Math.max(0.8, 1 - dist * 0.07)
          const opacity = reduced ? 1 : hidden ? 0 : 1 - dist * 0.24
          return (
            <button
              key={item.id}
              id={`${baseId}-${item.id}`}
              type="button"
              role="option"
              aria-selected={itemIndex === safe}
              data-rotate={rotate.toFixed(1)}
              data-hidden={hidden ? "yes" : "no"}
              data-focus={itemIndex === safe ? "yes" : "no"}
              onClick={() => {
                if (skipClick.current) {
                  skipClick.current = false
                  return
                }
                jump(itemIndex)
              }}
              className="absolute left-2 right-2 rounded-full px-3 py-2 text-left text-sm font-medium text-foreground transition-transform motion-reduce:transition-none"
              style={{
                top: "38%",
                transform: `translateY(${shift}px) rotate(${rotate}deg) scale(${scale})`,
                opacity,
                transitionDuration: `${ease}ms`,
              }}
            >
              {item.title}
            </button>
          )
        })}
      </div>
      <div data-media={current.id} data-media-title={current.title} className="flex flex-col justify-center">
        <div className={cn("h-36 rounded-2xl", current.swatch)} />
        <p className="mt-3 text-lg font-semibold">{current.title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{current.copy}</p>
      </div>
      <p role="status" className="sr-only">
        当前 {current.title}
      </p>
    </div>
  )
}
