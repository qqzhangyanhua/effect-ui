"use client"

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface CaseStudy {
  id: string
  title: string
  summary: string
}

export interface CaseStudyCarouselProps {
  pace?: number
  peek?: number
  intensity?: number
  gap?: number
  studies?: readonly CaseStudy[]
  className?: string
  onIndexChange?: (index: number) => void
}

const builtIn: readonly CaseStudy[] = [
  { id: "harbor", title: "晨港", summary: "把货运和步行拆成上下两层，码头重新能让人走过去。" },
  { id: "lantern", title: "纸灯", summary: "展览用可折叠的光，收起来只有一本册子那么厚。" },
  { id: "salt", title: "盐田", summary: "蒸发池收成一条参观路线，风从格子中间穿过去。" },
  { id: "north", title: "北窗", summary: "朝北的阅读室，白天不需要拉帘。" },
  { id: "loop", title: "回线", summary: "旧轨改成步行环，站台留下作休息点。" },
]

const swipeThreshold = 56

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

export function CaseStudyCarousel({
  pace = 1,
  peek = 0.22,
  intensity = 0.7,
  gap = 12,
  studies = builtIn,
  className,
  onIndexChange,
}: CaseStudyCarouselProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const items = studies.length > 0 ? studies : builtIn
  const reveal = clamp(peek, 0.05, 0.45)
  const gain = clamp(intensity, 0, 1)
  const gapPx = clamp(gap, 0, 80)
  const ms = Math.round(420 / rateOf(pace))
  const basis = 100 / (1 + 2 * reveal)
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<"idle" | "transitioning" | "settled">("idle")
  const [from, setFrom] = useState(0)
  const [dragX, setDragX] = useState(0)
  const indexRef = useRef(0)
  const dragRef = useRef<{ x: number; pointerId: number } | null>(null)
  const onIndexChangeRef = useRef(onIndexChange)
  const count = items.length
  const safe = ((index % count) + count) % count
  const current = items[safe] ?? items[0]

  useEffect(() => {
    onIndexChangeRef.current = onIndexChange
  }, [onIndexChange])

  useEffect(() => {
    if (phase !== "transitioning" || reduced || !live) return
    let second = 0
    const first = window.requestAnimationFrame(() => {
      second = window.requestAnimationFrame(() => setPhase("settled"))
    })
    return () => {
      window.cancelAnimationFrame(first)
      window.cancelAnimationFrame(second)
    }
  }, [phase, reduced, live, index])

  function go(next: number) {
    const wrapped = ((next % count) + count) % count
    if (wrapped === indexRef.current) {
      setPhase("settled")
      return
    }
    const previous = indexRef.current
    indexRef.current = wrapped
    setFrom(previous)
    setIndex(wrapped)
    setPhase(reduced || !live ? "settled" : "transitioning")
    onIndexChangeRef.current?.(wrapped)
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== undefined && event.button !== 0) return
    dragRef.current = { x: event.clientX, pointerId: event.pointerId }
    if (typeof event.currentTarget.setPointerCapture === "function") {
      try {
        event.currentTarget.setPointerCapture(event.pointerId)
      } catch {
        return
      }
    }
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    setDragX(event.clientX - drag.x)
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    const dx = event.clientX - drag.x
    dragRef.current = null
    setDragX(0)
    if (dx <= -swipeThreshold) go(indexRef.current + 1)
    else if (dx >= swipeThreshold) go(indexRef.current - 1)
    else setPhase((currentPhase) => (currentPhase === "idle" ? "idle" : "settled"))
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault()
      go(indexRef.current + 1)
    } else if (event.key === "ArrowLeft") {
      event.preventDefault()
      go(indexRef.current - 1)
    }
  }

  if (!current) return null

  return (
    <div
      ref={ref}
      data-slot="case-study-carousel"
      data-ritual="case-study"
      data-pace={Number.isFinite(pace) ? pace : 1}
      data-peek={reveal}
      data-intensity={gain}
      data-gap={gapPx}
      data-motion={reduced ? "off" : "on"}
      data-instant={reduced ? "on" : "off"}
      data-live={live ? "on" : "off"}
      data-state={phase}
      data-index={safe}
      data-from={from}
      data-count={count}
      data-basis={basis.toFixed(2)}
      role="region"
      aria-roledescription="carousel"
      aria-label="作品集"
      tabIndex={0}
      onKeyDown={onKeyDown}
      className={cn(
        "w-full max-w-3xl rounded-3xl border border-border bg-card p-4 text-card-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
        className,
      )}
    >
      <div
        data-track=""
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="relative h-52 overflow-hidden rounded-2xl bg-muted touch-none"
      >
        {items.map((study, studyIndex) => {
          const delta = studyIndex - safe
          const distance = Math.abs(delta)
          const scale = reduced || distance === 0 ? 1 : distance === 1 ? Number((1 - gain * 0.24).toFixed(3)) : Number((1 - gain * 0.36).toFixed(3))
          return (
            <article
              key={study.id}
              data-slide={study.id}
              data-distance={distance}
              data-scale={scale}
              data-role={distance === 0 ? "current" : distance === 1 ? "peek" : "far"}
              aria-hidden={distance !== 0}
              style={{
                width: `${basis}%`,
                left: "50%",
                transform: `translateX(calc(-50% + ${delta * 100}% + ${delta * gapPx + (reduced ? 0 : dragX)}px)) scale(${scale})`,
                transition: reduced ? "none" : `transform ${ms}ms ease`,
                zIndex: distance === 0 ? 2 : 1,
                opacity: distance > 1 ? 0 : 1,
              }}
              className="pointer-events-none absolute top-3 bottom-3 overflow-hidden rounded-2xl border border-border bg-background motion-reduce:transition-none"
            >
              <div
                aria-hidden
                data-figure=""
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(${48 + studyIndex * 28}deg, color-mix(in oklch, var(--primary) ${50 + studyIndex * 6}%, var(--card)), var(--muted))`,
                }}
              />
              <div aria-hidden className="absolute bottom-4 left-4 h-14 w-14 rounded-full bg-background/80" />
              <p className="absolute left-4 top-4 text-xs text-background">{studyIndex + 1}</p>
            </article>
          )
        })}
      </div>
      <div
        data-caption=""
        aria-live="polite"
        className="mt-4 min-h-16 motion-reduce:transition-none"
        style={{
          opacity: !reduced && phase === "transitioning" ? 0.35 : 1,
          transition: reduced ? "none" : `opacity ${ms}ms ease`,
        }}
      >
        <h3 className="text-lg font-medium">{current.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{current.summary}</p>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex gap-2" role="group" aria-label="作品序号">
          {items.map((study, studyIndex) => (
            <button
              key={study.id}
              type="button"
              aria-label={`第 ${studyIndex + 1} 则`}
              aria-current={studyIndex === safe ? "true" : undefined}
              onClick={() => go(studyIndex)}
              className={cn("size-2.5 rounded-full bg-muted-foreground/40", studyIndex === safe && "bg-primary")}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => go(safe - 1)} className="rounded-full border border-border px-3 py-1.5 text-sm">
            上一则
          </button>
          <button type="button" onClick={() => go(safe + 1)} className="rounded-full bg-primary px-3 py-1.5 text-sm text-primary-foreground">
            下一则
          </button>
        </div>
      </div>
    </div>
  )
}
