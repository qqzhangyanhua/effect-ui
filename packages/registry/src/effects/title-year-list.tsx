"use client"

import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent, type WheelEvent } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface TitleYearListProps {
  pace?: number
  intensity?: number
  count?: number
  leading?: number
  className?: string
  onIndexChange?: (index: number) => void
}

interface Work {
  id: string
  title: string
  year: number
}

const WORKS: readonly Work[] = [
  { id: "alpha", title: "Alpha", year: 2018 },
  { id: "bravo", title: "Bravo", year: 2019 },
  { id: "charlie", title: "Charlie", year: 2020 },
  { id: "delta", title: "Delta", year: 2021 },
  { id: "echo", title: "Echo", year: 2022 },
  { id: "foxtrot", title: "Foxtrot", year: 2023 },
  { id: "golf", title: "Golf", year: 2024 },
  { id: "hotel", title: "Hotel", year: 2025 },
]

type Phase = "idle" | "scrolling" | "settle"

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

function countOf(count: number) {
  return clamp(Math.round(count), 6, 8)
}

function leadingOf(leading: number) {
  return clamp(leading, 0.75, 1.5)
}

function opacityFor(distance: number, gain: number) {
  if (distance === 0) return 1
  const floor = 0.22 + (1 - gain) * 0.28
  const fade = 0.22 + gain * 0.18
  return Math.round(Math.max(floor, 1 - distance * fade) * 100) / 100
}

export function TitleYearList({
  pace = 1,
  intensity = 0.65,
  count = 7,
  leading = 1,
  className,
  onIndexChange,
}: TitleYearListProps) {
  const ref = useRef<HTMLDivElement>(null)
  const frame = useRef(0)
  const indexRef = useRef(0)
  const dragRef = useRef(false)
  const originRef = useRef(0)
  const skipClick = useRef(false)
  const onIndexRef = useRef(onIndexChange)
  const liveRef = useRef(false)
  const reducedRef = useRef(false)
  const baseId = useId()
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const gain = clamp(intensity, 0, 1)
  const rate = rateOf(pace)
  const total = countOf(count)
  const gap = leadingOf(leading)
  const items = WORKS.slice(0, total)
  const last = items.length - 1
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>("idle")
  const safe = clamp(index, 0, last)
  const fallback: Work = { id: "alpha", title: "Alpha", year: 2018 }
  const current = items[safe] ?? items[0] ?? fallback
  const ease = reduced ? 0 : Math.round(280 / rate)
  const row = Math.round(52 * gap)

  useEffect(() => {
    onIndexRef.current = onIndexChange
  }, [onIndexChange])

  useEffect(() => {
    reducedRef.current = reduced
    liveRef.current = live
    if (indexRef.current > last) {
      indexRef.current = last
      setIndex(last)
    }
    if (live) return
    window.cancelAnimationFrame(frame.current)
    frame.current = 0
    queueMicrotask(() => {
      if (liveRef.current) return
      setPhase("idle")
    })
  }, [live, last, reduced])

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
    if (!animate || reducedRef.current || !liveRef.current) {
      setPhase("idle")
      return
    }
    setPhase("scrolling")
    let left = Math.max(4, Math.round(6 / rate))
    const tick = () => {
      if (!liveRef.current) {
        setPhase("idle")
        frame.current = 0
        return
      }
      left -= 1
      if (left === 1) setPhase("settle")
      if (left <= 0) {
        setPhase("idle")
        frame.current = 0
        return
      }
      frame.current = window.requestAnimationFrame(tick)
    }
    frame.current = window.requestAnimationFrame(tick)
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault()
      commit(indexRef.current + 1, !reducedRef.current)
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      commit(indexRef.current - 1, !reducedRef.current)
    }
  }

  function onWheel(event: WheelEvent<HTMLDivElement>) {
    if (event.cancelable) event.preventDefault()
    if (event.deltaY > 0) commit(indexRef.current + 1, !reducedRef.current)
    else if (event.deltaY < 0) commit(indexRef.current - 1, !reducedRef.current)
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
    const steps = Math.round(-dy / row)
    const target = clamp(indexRef.current + steps, 0, last)
    if (target === indexRef.current && Math.abs(dy) < row * 0.85) {
      setPhase("idle")
      return
    }
    commit(target, !reducedRef.current && liveRef.current)
  }

  return (
    <div
      ref={ref}
      data-slot="title-year-list"
      data-ritual="title-year"
      data-layout="title-list"
      data-pace={rate}
      data-intensity={gain}
      data-count={total}
      data-leading={gap}
      data-index={safe}
      data-year={current.year}
      data-title={current.title}
      data-state={phase}
      data-ease={ease}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      className={cn(
        "grid w-full max-w-xl gap-4 rounded-3xl border border-border bg-card p-4 text-card-foreground motion-reduce:transition-none md:grid-cols-[minmax(0,1fr)_7rem]",
        className,
      )}
    >
      <div
        role="listbox"
        aria-label="片名列表"
        aria-activedescendant={`${baseId}-${current.id}`}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="touch-none outline-none focus-visible:ring-2 focus-visible:ring-ring"
        style={{ display: "grid", rowGap: `${Math.round(4 + gap * 10)}px` }}
      >
        {items.map((item, itemIndex) => {
          const distance = Math.abs(itemIndex - safe)
          const active = itemIndex === safe
          const opacity = opacityFor(distance, gain)
          const weight = active ? Math.round(620 + gain * 180) : 440
          return (
            <button
              key={item.id}
              id={`${baseId}-${item.id}`}
              type="button"
              role="option"
              aria-selected={active}
              aria-label={`${item.title}, ${item.year}`}
              data-index={itemIndex}
              data-year={item.year}
              data-opacity={opacity.toFixed(2)}
              data-weight={weight}
              data-active={active ? "yes" : "no"}
              onClick={() => {
                if (skipClick.current) {
                  skipClick.current = false
                  return
                }
                commit(itemIndex, !reducedRef.current)
              }}
              className="rounded-xl px-1 text-left text-foreground outline-none transition-[opacity,font-weight] motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-ring"
              style={{ opacity, fontWeight: weight, transitionDuration: `${ease}ms` }}
            >
              <span className="font-sans text-3xl tracking-tight sm:text-4xl">
                {item.title}
                <sup data-part="year" className="ml-1 align-super text-[0.42em] font-medium text-muted-foreground">
                  {item.year}
                </sup>
              </span>
            </button>
          )
        })}
      </div>
      <div
        data-media="swatch"
        data-swatch={current.id}
        className="hidden min-h-24 rounded-2xl md:block"
        style={{ background: `color-mix(in oklab, var(--primary) ${28 + safe * 8}%, var(--muted))` }}
      />
      <p role="status" className="sr-only">
        {`${current.title}, ${current.year}`}
      </p>
    </div>
  )
}
