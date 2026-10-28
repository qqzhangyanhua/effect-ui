"use client"

import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent, type PointerEvent, type WheelEvent } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface BarrelValueWheelProps {
  pace?: number
  intensity?: number
  visible?: number
  className?: string
  onValueChange?: (value: number) => void
}

const row = 40
const minValue = 48
const maxValue = 96
const valueStep = 2

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

function buildValues() {
  const list: number[] = []
  for (let value = minValue; value <= maxValue; value += valueStep) list.push(value)
  return list
}

const values = buildValues()
const initialIndex = Math.max(0, values.indexOf(72))

function visibleRows(visible: number) {
  const rounded = Math.round(visible)
  if (!Number.isFinite(rounded)) return 5
  const odd = rounded % 2 === 0 ? rounded - 1 : rounded
  return clamp(odd, 3, 7)
}

export function BarrelValueWheel({ pace = 1, intensity = 0.7, visible = 5, className, onValueChange }: BarrelValueWheelProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const onValueRef = useRef(onValueChange)
  const indexRef = useRef(initialIndex)
  const valueRef = useRef(values[initialIndex] ?? 72)
  const liveRef = useRef(false)
  const dragging = useRef(false)
  const startRef = useRef(initialIndex)
  const originRef = useRef(0)
  const dragRef = useRef(0)
  const lastDelta = useRef(0)
  const inertiaRef = useRef(0)
  const gain = clamp(intensity, 0, 1)
  const rate = rateOf(pace)
  const rows = visibleRows(visible)
  const [index, setIndex] = useState(initialIndex)
  const [drag, setDrag] = useState(0)
  const [phase, setPhase] = useState<"idle" | "spinning" | "snapped">("idle")
  const safe = clamp(index, 0, values.length - 1)
  const current = values[safe] ?? 72
  const float = safe - drag / row

  useEffect(() => {
    onValueRef.current = onValueChange
  }, [onValueChange])

  useEffect(() => {
    liveRef.current = live
    if (live) return
    window.cancelAnimationFrame(inertiaRef.current)
    inertiaRef.current = 0
  }, [live])

  useEffect(() => {
    return () => window.cancelAnimationFrame(inertiaRef.current)
  }, [])

  function commit(nextIndex: number, nextPhase: "idle" | "spinning" | "snapped") {
    const clamped = clamp(nextIndex, 0, values.length - 1)
    const nextValue = values[clamped] ?? 72
    indexRef.current = clamped
    dragRef.current = 0
    setDrag(0)
    setIndex(clamped)
    setPhase(nextPhase)
    if (nextValue !== valueRef.current) {
      valueRef.current = nextValue
      onValueRef.current?.(nextValue)
    }
  }

  function finishDrag() {
    const moved = dragRef.current / row
    const base = clamp(Math.round(startRef.current - moved), 0, values.length - 1)
    const flung = Math.abs(lastDelta.current) > 28 ? Math.sign(-lastDelta.current) : 0
    const goal = clamp(base + flung, 0, values.length - 1)
    if (reduced || !liveRef.current || goal === base) {
      commit(base, "snapped")
      return
    }
    commit(base, "spinning")
    let left = Math.max(3, Math.round(4 / rate))
    const tick = () => {
      if (!liveRef.current) {
        setPhase("snapped")
        return
      }
      left -= 1
      if (left <= 0) {
        commit(goal, "snapped")
        return
      }
      inertiaRef.current = window.requestAnimationFrame(tick)
    }
    window.cancelAnimationFrame(inertiaRef.current)
    inertiaRef.current = window.requestAnimationFrame(tick)
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (reduced || (event.button !== undefined && event.button !== 0)) return
    window.cancelAnimationFrame(inertiaRef.current)
    dragging.current = true
    startRef.current = indexRef.current
    originRef.current = event.clientY
    dragRef.current = 0
    lastDelta.current = 0
    setPhase("spinning")
    if (typeof event.currentTarget.setPointerCapture === "function") {
      try {
        event.currentTarget.setPointerCapture(event.pointerId)
      } catch {
        // jsdom 里不一定有指针捕获。
      }
    }
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (reduced || !dragging.current) return
    const next = event.clientY - originRef.current
    lastDelta.current = next - dragRef.current
    dragRef.current = next
    setDrag(next)
    setPhase("spinning")
  }

  function onPointerUp() {
    if (!dragging.current) return
    dragging.current = false
    finishDrag()
  }

  function onWheel(event: WheelEvent<HTMLDivElement>) {
    event.preventDefault()
    commit(indexRef.current + (event.deltaY > 0 ? 1 : -1), "snapped")
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault()
      commit(indexRef.current + 1, "snapped")
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      commit(indexRef.current - 1, "snapped")
    }
  }

  function onSelect(event: ChangeEvent<HTMLSelectElement>) {
    const next = Number(event.target.value)
    const found = values.indexOf(next)
    if (found >= 0) commit(found, "snapped")
  }

  return (
    <div
      ref={ref}
      data-slot="barrel-value-wheel"
      data-ritual="barrel-wheel"
      data-pace={Number.isFinite(pace) ? pace : 1}
      data-intensity={gain}
      data-visible={rows}
      data-motion={reduced ? "off" : "on"}
      data-perspective={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      data-state={reduced ? "snapped" : phase}
      data-value={current}
      data-index={safe}
      onKeyDown={onKeyDown}
      className={cn(
        "w-full max-w-xs rounded-3xl border border-border bg-card p-4 text-card-foreground outline-none motion-reduce:transition-none",
        reduced ? "focus-within:ring-2 focus-within:ring-ring" : "",
        className,
      )}
    >
      {reduced ? (
        <div>
          <p className="text-sm text-muted-foreground">数值</p>
          <select
            aria-label="数值"
            value={current}
            onChange={onSelect}
            className="mt-2 w-full rounded-2xl border border-border bg-background px-3 py-2 text-foreground"
          >
            {values.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={() => commit(indexRef.current - 1, "snapped")} className="rounded-full border border-border px-3 py-1.5 text-sm">
              上一档
            </button>
            <button type="button" onClick={() => commit(indexRef.current + 1, "snapped")} className="rounded-full border border-border px-3 py-1.5 text-sm">
              下一档
            </button>
          </div>
        </div>
      ) : (
        <div
          role="slider"
          aria-label="数值"
          aria-valuemin={minValue}
          aria-valuemax={maxValue}
          aria-valuenow={current}
          aria-valuetext={String(current)}
          tabIndex={0}
          onWheel={onWheel}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="relative overflow-hidden rounded-2xl outline-none touch-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
          style={{ height: rows * row, perspective: `${Math.round(980 - gain * 460)}px` }}
          data-window={rows * row}
        >
          <div aria-hidden className="pointer-events-none absolute inset-x-3 top-1/2 h-10 -translate-y-1/2 rounded-xl border border-border bg-muted/50" />
          {values.map((item, itemIndex) => {
            const delta = itemIndex - float
            if (Math.abs(delta) > rows / 2 + 1) return null
            const distance = Math.abs(delta)
            const opacity = Math.max(0.15, 1 - distance * (0.18 + gain * 0.28))
            const itemScale = Math.max(0.72, 1 - distance * (0.05 + gain * 0.08))
            const rotate = delta * (4 + gain * 16)
            const active = itemIndex === safe && drag === 0
            return (
              <div
                key={item}
                data-item={item}
                data-active={active ? "true" : "false"}
                data-rotate={rotate.toFixed(1)}
                className="absolute right-0 left-0 grid place-items-center text-foreground motion-reduce:transition-none"
                style={{
                  top: "50%",
                  height: row,
                  opacity,
                  transform: `translateY(calc(-50% + ${delta * row}px)) rotateX(${rotate}deg) scale(${itemScale})`,
                }}
              >
                {item}
              </div>
            )
          })}
        </div>
      )}
      <p role="status" aria-live="polite" className="sr-only">
        {current}
      </p>
    </div>
  )
}
