"use client"

import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent, type WheelEvent } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface YearSnapRailProps {
  pace?: number
  intensity?: number
  gap?: number
  count?: number
  className?: string
  onIndexChange?: (index: number) => void
}

interface YearEntry {
  year: number
  title: string
  summary: string
}

const YEARS: readonly YearEntry[] = [
  { year: 2014, title: "起点", summary: "第一张草图钉在工作室墙上。" },
  { year: 2016, title: "样机", summary: "模型离开桌面，轨迹还不稳定。" },
  { year: 2018, title: "航线", summary: "试飞改成固定的周计划。" },
  { year: 2020, title: "走廊", summary: "里程碑写进了公开的年份轨。" },
  { year: 2022, title: "编队", summary: "两架样机开始共用一条时间线。" },
  { year: 2024, title: "交接", summary: "下一段从这条中线继续往下写。" },
  { year: 2026, title: "回看", summary: "选中的年份停在参考线中央。" },
  { year: 2028, title: "留白", summary: "后面的格子还空着，等下一笔。" },
]

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

export function YearSnapRail({
  pace = 1,
  intensity = 0.7,
  gap = 12,
  count = 6,
  className,
  onIndexChange,
}: YearSnapRailProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const baseId = useId()
  const onIndexRef = useRef(onIndexChange)
  const dragging = useRef(false)
  const startRef = useRef(0)
  const originRef = useRef(0)
  const dragRef = useRef(0)
  const skipClick = useRef(false)
  const gain = clamp(intensity, 0, 1)
  const rate = rateOf(pace)
  const total = clamp(Math.round(count), 4, 8)
  const items = YEARS.slice(0, total)
  const row = 48 + clamp(gap, 0, 64)
  const scale = reduced ? 1 : Math.round((1 + gain * 0.4) * 100) / 100
  const ms = Math.round(320 / rate)
  const [index, setIndex] = useState(0)
  const [drag, setDrag] = useState(0)
  const [phase, setPhase] = useState<"idle" | "scrolling" | "snapped">("idle")
  const safe = Math.min(index, Math.max(0, items.length - 1))
  const current = items[safe] ?? items[0]
  const windowH = row * 5
  const translate = windowH / 2 - row / 2 - safe * row + drag

  useEffect(() => {
    onIndexRef.current = onIndexChange
  }, [onIndexChange])

  function snap(next: number) {
    const clamped = clamp(next, 0, items.length - 1)
    dragRef.current = 0
    setDrag(0)
    setIndex(clamped)
    setPhase("snapped")
    if (clamped !== safe) onIndexRef.current?.(clamped)
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== undefined && event.button !== 0) return
    dragging.current = true
    skipClick.current = false
    startRef.current = safe
    originRef.current = event.clientY
    dragRef.current = 0
    setPhase("scrolling")
    if (typeof event.currentTarget.setPointerCapture === "function") {
      try {
        event.currentTarget.setPointerCapture(event.pointerId)
      } catch {
        // jsdom 里不一定有指针捕获。
      }
    }
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!dragging.current) return
    const next = event.clientY - originRef.current
    dragRef.current = next
    setDrag(next)
  }

  function onPointerUp() {
    if (!dragging.current) return
    dragging.current = false
    const dragPx = dragRef.current
    if (Math.abs(dragPx) < 1) {
      setDrag(0)
      setPhase("idle")
      return
    }
    skipClick.current = Math.abs(dragPx) > 6
    snap(startRef.current + -Math.round(dragPx / row))
  }

  function onWheel(event: WheelEvent<HTMLDivElement>) {
    event.preventDefault()
    setPhase("scrolling")
    snap(safe + (event.deltaY > 0 ? 1 : -1))
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault()
      snap(safe + 1)
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      snap(safe - 1)
    }
  }

  if (!current) return null

  return (
    <div
      ref={ref}
      data-slot="year-snap-rail"
      data-ritual="year-snap"
      className={cn(
        "grid w-full max-w-xl grid-cols-[9.5rem_1fr] gap-6 rounded-3xl border border-border bg-card p-4 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <div
        role="listbox"
        aria-label="年份"
        aria-activedescendant={`${baseId}-${current.year}`}
        tabIndex={0}
        data-rail="year"
        data-pace={Number.isFinite(pace) ? pace : 1}
        data-intensity={gain}
        data-gap={clamp(gap, 0, 64)}
        data-count={items.length}
        data-row={row}
        data-index={safe}
        data-year={current.year}
        data-title={current.title}
        data-scale={scale.toFixed(2)}
        data-motion={reduced ? "off" : "on"}
        data-live={live ? "on" : "off"}
        data-state={phase}
        data-ease={reduced ? "off" : "on"}
        onKeyDown={onKeyDown}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="relative overflow-hidden rounded-2xl outline-none touch-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
        style={{ height: windowH }}
      >
        <div data-centerline aria-hidden className="pointer-events-none absolute inset-x-2 top-1/2 z-10 h-px bg-primary" />
        <div
          data-list
          className="motion-reduce:transition-none"
          style={{
            transform: `translateY(${translate}px)`,
            transition: reduced || phase === "scrolling" ? "none" : `transform ${ms}ms cubic-bezier(0.22, 1, 0.36, 1)`,
          }}
        >
          {items.map((item, itemIndex) => {
            const selected = itemIndex === safe
            return (
              <div
                key={item.year}
                id={`${baseId}-${item.year}`}
                role="option"
                aria-selected={selected}
                tabIndex={-1}
                data-year={item.year}
                onClick={() => {
                  if (skipClick.current) {
                    skipClick.current = false
                    return
                  }
                  snap(itemIndex)
                }}
                className="grid cursor-pointer place-items-center text-foreground motion-reduce:transition-none"
                style={{
                  height: row,
                  opacity: selected ? 1 : 0.38,
                  fontWeight: selected ? 700 : 500,
                  transform: `scale(${selected ? scale : 1})`,
                  transition: reduced ? "none" : `transform ${ms}ms, opacity ${ms}ms`,
                }}
              >
                {item.year}
              </div>
            )
          })}
        </div>
      </div>
      <div className="relative min-h-28 self-center">
        {items.map((item, itemIndex) => {
          const selected = itemIndex === safe
          return (
            <div
              key={item.year}
              data-copy={item.year}
              data-active={selected ? "true" : "false"}
              className="motion-reduce:transition-none"
              style={{
                opacity: selected ? 1 : 0,
                position: selected ? "relative" : "absolute",
                inset: selected ? undefined : 0,
                transition: reduced ? "none" : `opacity ${ms}ms ease`,
              }}
            >
              <p data-title className="text-xl text-foreground">
                {item.title}
              </p>
              <p data-summary className="mt-2 text-sm text-muted-foreground">
                {item.summary}
              </p>
            </div>
          )
        })}
      </div>
      <p role="status" aria-live="polite" className="sr-only">
        {current.year} {current.title}
      </p>
    </div>
  )
}
