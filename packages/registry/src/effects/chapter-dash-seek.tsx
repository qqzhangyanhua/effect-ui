"use client"

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface ChapterDashSeekProps {
  pace?: number
  intensity?: number
  dashed?: boolean
  labels?: boolean
  className?: string
  onValueChange?: (state: { t: number; chapterIndex: number }) => void
}

export interface ChapterSpan {
  id: string
  weight: number
  title: string
  start: number
  end: number
}

export const CHAPTERS = [
  { id: "c1", weight: 1, title: "Chapter 1" },
  { id: "c2", weight: 2.4, title: "Chapter 2" },
  { id: "c3", weight: 1.5, title: "Chapter 3" },
  { id: "c4", weight: 0.8, title: "Chapter 4" },
] as const

const TOTAL = CHAPTERS.reduce((sum, item) => sum + item.weight, 0)
export const CHAPTER_LANE = 320

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

export function chapterSpans(): ChapterSpan[] {
  let cursor = 0
  return CHAPTERS.map((item) => {
    const start = cursor / TOTAL
    cursor += item.weight
    return { id: item.id, weight: item.weight, title: item.title, start, end: cursor / TOTAL }
  })
}

export function chapterIndexAt(t: number) {
  const spans = chapterSpans()
  if (t >= 1) return spans.length - 1
  const value = clamp(t, 0, 1)
  const found = spans.findIndex((span) => value >= span.start && value < span.end)
  return found < 0 ? spans.length - 1 : found
}

export function chapterStart(index: number) {
  const spans = chapterSpans()
  const safe = clamp(Math.round(index), 0, spans.length - 1)
  return spans[safe]?.start ?? 0
}

export function chapterFromPointer(clientX: number, rect: { left: number; width: number }) {
  const width = rect.width > 1 ? rect.width : CHAPTER_LANE
  const left = rect.width > 1 ? rect.left : 0
  return clamp((clientX - left) / width, 0, 1)
}

function capture(event: PointerEvent<HTMLElement>) {
  if (typeof event.currentTarget.setPointerCapture !== "function") return
  try {
    event.currentTarget.setPointerCapture(event.pointerId)
  } catch {
    // jsdom 不一定能捕获指针。
  }
}

export function ChapterDashSeek({
  pace = 1,
  intensity = 0.7,
  dashed = true,
  labels = true,
  className,
  onValueChange,
}: ChapterDashSeekProps) {
  const ref = useRef<HTMLDivElement>(null)
  const laneRef = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const gain = clamp(intensity, 0, 1)
  const paceRate = rateOf(pace)
  const ms = reduced ? 0 : Math.round(180 / paceRate)
  const spans = chapterSpans()
  const [t, setT] = useState(0)
  const [drag, setDrag] = useState(false)
  const [running, setRunning] = useState(false)
  const tRef = useRef(0)
  const dragRef = useRef(false)
  const movedRef = useRef(0)
  const originRef = useRef(0)
  const onValueRef = useRef(onValueChange)
  const playing = running && live && !reduced && !drag
  const chapter = chapterIndexAt(t)
  const phase = drag ? (reduced ? "idle" : "seeking") : playing ? "playing" : "idle"
  const dash = Math.round(4 + (1 - gain) * 8)
  const title = spans[chapter]?.title ?? "Chapter 1"

  useEffect(() => {
    tRef.current = t
    onValueRef.current = onValueChange
  }, [t, onValueChange])

  useEffect(() => {
    if (!playing) return
    let frame = 0
    let stopped = false
    let last = 0
    const tick = (now: number) => {
      if (stopped) return
      const dt = now > last ? Math.min(0.05, (now - last) / 1000) : 1 / 12
      if (now > 0) last = now
      let next = tRef.current + dt * 0.5 * paceRate
      if (next >= 1) next = 0
      tRef.current = next
      setT(next)
      onValueRef.current?.({ t: next, chapterIndex: chapterIndexAt(next) })
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => {
      stopped = true
      window.cancelAnimationFrame(frame)
    }
  }, [playing, paceRate])

  function commit(value: number) {
    const next = clamp(value, 0, 1)
    tRef.current = next
    setT(next)
    onValueRef.current?.({ t: next, chapterIndex: chapterIndexAt(next) })
  }

  function box() {
    const rect = laneRef.current?.getBoundingClientRect()
    if (rect && rect.width > 1) return { left: rect.left, width: rect.width }
    return { left: 0, width: CHAPTER_LANE }
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== undefined && event.button !== 0) return
    dragRef.current = true
    movedRef.current = 0
    originRef.current = event.clientX
    setDrag(true)
    commit(chapterFromPointer(event.clientX, box()))
    capture(event)
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return
    movedRef.current = Math.max(movedRef.current, Math.abs(event.clientX - originRef.current))
    commit(chapterFromPointer(event.clientX, box()))
  }

  function onPointerUp() {
    if (!dragRef.current) return
    dragRef.current = false
    setDrag(false)
  }

  function jumpChapter(index: number) {
    commit(chapterStart(index))
  }

  function onSegmentClick(start: number) {
    if (movedRef.current > 4) return
    commit(start)
  }

  function togglePlay() {
    if (reduced) {
      setRunning(false)
      return
    }
    setRunning((value) => !value)
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") commit(tRef.current + 0.02)
    else if (event.key === "ArrowLeft") commit(tRef.current - 0.02)
    else if (event.key === "]") jumpChapter(chapterIndexAt(tRef.current) + 1)
    else if (event.key === "[") jumpChapter(chapterIndexAt(tRef.current) - 1)
    else if (event.key === "Home") commit(0)
    else if (event.key === "End") commit(1)
    else if (event.key === " " && event.target === event.currentTarget) togglePlay()
    else return
    event.preventDefault()
  }

  return (
    <div
      ref={ref}
      data-slot="chapter-dash-seek"
      data-ritual="chapter-dash"
      data-pace={paceRate}
      data-intensity={gain}
      data-t={t.toFixed(3)}
      data-chapter={chapter}
      data-phase={phase}
      data-playing={playing ? "on" : "off"}
      data-dashed={dashed ? "on" : "off"}
      data-labels={labels ? "on" : "off"}
      data-dash={dash}
      data-ease={ms}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      tabIndex={0}
      role="slider"
      aria-label="Chapter position"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(t * 100)}
      aria-valuetext={title}
      onKeyDown={onKeyDown}
      className={cn(
        "w-full max-w-xl rounded-3xl border border-border bg-card p-4 text-card-foreground outline-none select-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
        className,
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-foreground">Chapters</p>
        {labels ? (
          <p data-title className="text-xs text-muted-foreground">
            {title}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">{chapter + 1}</p>
        )}
      </div>
      <div
        ref={laneRef}
        data-lane
        className="relative h-14 touch-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div className="pointer-events-none absolute inset-x-0 top-4 flex h-3 gap-1">
          {spans.map((span, index) => {
            const local = clamp((t - span.start) / Math.max(0.0001, span.end - span.start), 0, 1)
            const current = index === chapter
            const ink = dashed && local < 1 ? "dash" : "solid"
            return (
              <span
                key={span.id}
                data-ink={ink}
                className="relative h-full overflow-hidden rounded-full bg-muted"
                style={{ flexGrow: span.weight }}
              >
                {ink === "dash" ? (
                  <span
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `repeating-linear-gradient(90deg, var(--muted-foreground) 0 ${dash}px, transparent ${dash}px ${dash + 4 + Math.round(gain * 4)}px)`,
                      opacity: 0.35 + (1 - gain) * 0.25,
                    }}
                  />
                ) : null}
                <span
                  className="absolute inset-y-0 left-0 bg-primary"
                  style={{ width: `${local * 100}%`, opacity: current ? 0.55 + gain * 0.45 : 0.85 }}
                />
              </span>
            )
          })}
        </div>
        {spans.map((span) => (
          <button
            key={span.id}
            type="button"
            aria-label={span.title}
            aria-current={span.id === spans[chapter]?.id ? "true" : undefined}
            data-segment={span.id}
            data-start={span.start.toFixed(3)}
            onClick={() => onSegmentClick(span.start)}
            className="absolute top-2 h-8 outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{ left: `${span.start * 100}%`, width: `${Math.max(0, span.end - span.start) * 100}%` }}
          />
        ))}
        <span
          data-thumb
          className="pointer-events-none absolute top-2 size-8 -translate-x-1/2 rounded-full border-2 border-primary bg-background"
          style={{ left: `${t * 100}%` }}
        />
      </div>
      <div className="mt-2">
        <button
          type="button"
          onClick={togglePlay}
          className="h-9 rounded-full bg-primary px-4 text-sm text-primary-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {running && !reduced ? "Pause" : "Play"}
        </button>
      </div>
      <motion.span className="sr-only" aria-live="polite" initial={false} animate={{ opacity: 1 }} transition={{ duration: reduced ? 0 : 0.16 / paceRate }}>
        {`${title} position`}
      </motion.span>
    </div>
  )
}
