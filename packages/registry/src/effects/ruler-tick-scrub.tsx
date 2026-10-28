"use client"

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface RulerTickScrubProps {
  gap?: number
  pace?: number
  intensity?: number
  majorEvery?: number
  className?: string
  onIndexChange?: (index: number) => void
}

interface RulerMark {
  id: string
  date: string
  title: string
  body: string
}

const MARKS: readonly RulerMark[] = [
  { id: "sketch", date: "03 / 14", title: "草图", body: "先把主刻度画在纸边上。" },
  { id: "model", date: "06 / 02", title: "样机", body: "箭头停在第一段说明上。" },
  { id: "align", date: "09 / 18", title: "对齐", body: "次刻度开始跟着主刻度走。" },
  { id: "note", date: "12 / 07", title: "注记", body: "松手以后文案停在最近的主刻度。" },
  { id: "archive", date: "02 / 11", title: "归档", body: "这一段先留在尺的末尾。" },
]

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

export function RulerTickScrub({
  gap = 14,
  pace = 1,
  intensity = 0.65,
  majorEvery = 4,
  className,
  onIndexChange,
}: RulerTickScrubProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const onIndexRef = useRef(onIndexChange)
  const dragging = useRef(false)
  const startRef = useRef(0)
  const originRef = useRef(0)
  const dragRef = useRef(0)
  const gain = clamp(intensity, 0, 1)
  const rate = rateOf(pace)
  const spacing = clamp(gap, 8, 28)
  const every = clamp(Math.round(majorEvery), 2, 6)
  const ms = Math.round(280 / rate)
  const handle = Math.round(10 + gain * 18)
  const [index, setIndex] = useState(0)
  const [drag, setDrag] = useState(0)
  const [phase, setPhase] = useState<"rest" | "scrubbing" | "snapped">("rest")
  const safe = clamp(index, 0, MARKS.length - 1)
  const current = MARKS[safe] ?? MARKS[0]
  const tickCount = (MARKS.length - 1) * every + 1
  const ticks = Array.from({ length: tickCount }, (_, tick) => tick)

  useEffect(() => {
    onIndexRef.current = onIndexChange
  }, [onIndexChange])

  function commit(next: number) {
    const clamped = clamp(next, 0, MARKS.length - 1)
    dragRef.current = 0
    setDrag(0)
    setIndex(clamped)
    setPhase("snapped")
    if (clamped !== safe) onIndexRef.current?.(clamped)
  }

  function indexFromDrag(dragPx: number, from: number) {
    const tick = from * every
    const raw = tick - dragPx / spacing
    const maxTick = (MARKS.length - 1) * every
    const nearest = clamp(Math.round(raw / every) * every, 0, maxTick)
    return nearest / every
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (reduced || (event.button !== undefined && event.button !== 0)) return
    dragging.current = true
    startRef.current = safe
    originRef.current = event.clientX
    dragRef.current = 0
    setPhase("scrubbing")
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
    const next = event.clientX - originRef.current
    dragRef.current = next
    setDrag(next)
    setPhase("scrubbing")
  }

  function onPointerUp() {
    if (!dragging.current) return
    dragging.current = false
    if (reduced) {
      setDrag(0)
      setPhase("rest")
      return
    }
    commit(indexFromDrag(dragRef.current, startRef.current))
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault()
      commit(safe + 1)
    } else if (event.key === "ArrowLeft") {
      event.preventDefault()
      commit(safe - 1)
    }
  }

  if (!current) return null

  return (
    <div
      ref={ref}
      data-slot="ruler-tick-scrub"
      data-ritual="ruler-tick"
      data-pace={Number.isFinite(pace) ? pace : 1}
      data-intensity={gain}
      data-gap={spacing}
      data-major={every}
      data-index={safe}
      data-date={current.date}
      data-title={current.title}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      data-state={phase}
      data-ease={reduced ? "off" : "on"}
      className={cn(
        "w-full max-w-xl rounded-3xl border border-border bg-card p-4 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          data-arrow="prev"
          aria-label="上一里程碑"
          onClick={() => commit(safe - 1)}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-background text-foreground"
        >
          ←
        </button>
        <div
          role="slider"
          aria-label="里程碑刻度"
          aria-valuemin={0}
          aria-valuemax={MARKS.length - 1}
          aria-valuenow={safe}
          aria-valuetext={`${current.date} ${current.title}`}
          tabIndex={0}
          data-track
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="relative h-24 flex-1 overflow-hidden rounded-2xl outline-none touch-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
        >
          <div
            data-ruler
            className="absolute top-8 left-1/2 motion-reduce:transition-none"
            style={{
              transform: `translateX(${drag - safe * every * spacing}px)`,
              transition: reduced || phase === "scrubbing" ? "none" : `transform ${ms}ms ease`,
            }}
          >
            {ticks.map((tick) => {
              const major = tick % every === 0
              return (
                <span
                  key={tick}
                  data-tick={major ? "major" : "minor"}
                  className="absolute top-0 w-px bg-foreground"
                  style={{ left: tick * spacing, height: major ? 16 + gain * 20 : 8, opacity: major ? 1 : 0.38 }}
                />
              )
            })}
          </div>
          <div
            data-handle
            aria-hidden
            className="absolute top-3 bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-primary"
            style={{ width: Math.max(2, handle / 8) }}
          />
        </div>
        <button
          type="button"
          data-arrow="next"
          aria-label="下一里程碑"
          onClick={() => commit(safe + 1)}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-background text-foreground"
        >
          →
        </button>
      </div>
      <div className="relative mt-4 min-h-20">
        {MARKS.map((mark, markIndex) => {
          const selected = markIndex === safe
          return (
            <div
              key={mark.id}
              data-mark={mark.id}
              data-active={selected ? "true" : "false"}
              className="motion-reduce:transition-none"
              style={{
                opacity: selected ? 1 : 0,
                position: selected ? "relative" : "absolute",
                inset: selected ? undefined : 0,
                transition: reduced ? "none" : `opacity ${ms}ms ease`,
              }}
            >
              <p data-date className="text-xs tracking-wide text-muted-foreground">
                {mark.date}
              </p>
              <p data-title className="mt-1 text-lg text-foreground">
                {mark.title}
              </p>
              <p data-body className="mt-1 text-sm text-muted-foreground">
                {mark.body}
              </p>
            </div>
          )
        })}
      </div>
      <p role="status" aria-live="polite" className="sr-only">
        {current.date} {current.title}
      </p>
    </div>
  )
}
