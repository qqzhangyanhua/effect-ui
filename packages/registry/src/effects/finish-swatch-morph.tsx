"use client"

import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent } from "react"
import { LayoutGroup, motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface FinishSwatchMorphProps {
  pace?: number
  intensity?: number
  count?: number
  gap?: number
  className?: string
  onIndexChange?: (index: number) => void
}

const hues = [
  { id: "a", name: "Hue A", tone: "bg-primary", ink: "text-primary-foreground" },
  { id: "b", name: "Hue B", tone: "bg-accent", ink: "text-accent-foreground" },
  { id: "c", name: "Hue C", tone: "bg-secondary", ink: "text-secondary-foreground" },
  { id: "d", name: "Hue D", tone: "bg-muted", ink: "text-foreground" },
  { id: "e", name: "Hue E", tone: "bg-primary/80", ink: "text-primary-foreground" },
  { id: "f", name: "Hue F", tone: "bg-foreground", ink: "text-background" },
] as const

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

export function FinishSwatchMorph({
  pace = 1,
  intensity = 0.6,
  count = 5,
  gap = 12,
  className,
  onIndexChange,
}: FinishSwatchMorphProps) {
  const ref = useRef<HTMLDivElement>(null)
  const frame = useRef(0)
  const liveRef = useRef(false)
  const onIndexRef = useRef(onIndexChange)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const baseId = useId()
  const total = clamp(Math.round(count), 4, 6)
  const items = hues.slice(0, total)
  const gain = clamp(intensity, 0, 1)
  const rate = rateOf(pace)
  const spacing = clamp(gap, 0, 48)
  const [index, setIndex] = useState(0)
  const [from, setFrom] = useState(0)
  const [phase, setPhase] = useState<"idle" | "morphing">("idle")
  const safe = clamp(index, 0, Math.max(0, items.length - 1))
  const current = items[safe]
  const origin = items[clamp(from, 0, Math.max(0, items.length - 1))]
  const scale = !reduced && phase === "morphing" ? 1 - gain * 0.08 : 1

  useEffect(() => {
    onIndexRef.current = onIndexChange
  }, [onIndexChange])

  useEffect(() => {
    liveRef.current = live
    if (live) return
    window.cancelAnimationFrame(frame.current)
    frame.current = 0
  }, [live])

  useEffect(() => {
    if (reduced || !live || phase !== "morphing") return
    let stopped = false
    let step = 0
    const steps = Math.max(4, Math.round(8 / rate))
    const tick = () => {
      if (stopped || !liveRef.current) {
        setPhase("idle")
        return
      }
      step += 1
      if (step >= steps) {
        setPhase("idle")
        frame.current = 0
        return
      }
      frame.current = window.requestAnimationFrame(tick)
    }
    frame.current = window.requestAnimationFrame(tick)
    return () => {
      stopped = true
      window.cancelAnimationFrame(frame.current)
      frame.current = 0
    }
  }, [reduced, live, phase, rate, safe])

  function go(next: number) {
    const clamped = clamp(next, 0, Math.max(0, items.length - 1))
    if (clamped === safe) return
    setFrom(safe)
    setIndex(clamped)
    setPhase(reduced || !liveRef.current ? "idle" : "morphing")
    onIndexRef.current?.(clamped)
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault()
      go(safe + 1)
    } else if (event.key === "ArrowLeft") {
      event.preventDefault()
      go(safe - 1)
    } else if (event.key === "Home") {
      event.preventDefault()
      go(0)
    } else if (event.key === "End") {
      event.preventDefault()
      go(items.length - 1)
    }
  }

  if (!current || !origin) return null

  return (
    <div
      ref={ref}
      data-slot="finish-swatch-morph"
      data-ritual="finish-swatch"
      data-pace={rate}
      data-intensity={gain}
      data-count={items.length}
      data-gap={spacing}
      data-index={safe}
      data-hue={current.name}
      data-tone={current.id}
      data-from={origin.id}
      data-to={current.id}
      data-scale={scale.toFixed(2)}
      data-state={reduced ? "idle" : phase}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      className={cn(
        "w-full max-w-md rounded-3xl border border-border bg-card p-4 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <style>
        {`@keyframes finish-swatch-in { from { opacity: 0; } to { opacity: 1; } }
.finish-swatch-in { animation: finish-swatch-in var(--swatch-ms, 280ms) ease; }
@media (prefers-reduced-motion: reduce) { .finish-swatch-in { animation: none; } }`}
      </style>
      <div
        key={current.id}
        data-media
        style={{ transform: `scale(${scale})`, "--swatch-ms": `${Math.round(280 / rate)}ms` } as CSSProperties}
        className={cn(
          "relative flex h-52 flex-col justify-between overflow-hidden rounded-3xl p-5 motion-reduce:transition-none",
          current.tone,
          current.ink,
          reduced ? "" : "finish-swatch-in",
        )}
      >
        <svg viewBox="0 0 200 140" aria-hidden className="h-28 w-full">
          <circle cx="100" cy="58" r="34" fill="none" stroke="var(--background)" strokeWidth="8" />
          <rect x="62" y="102" width="76" height="24" rx="12" fill="var(--background)" opacity="0.9" />
        </svg>
        <p className="text-lg font-medium">{current.name}</p>
      </div>
      <LayoutGroup id={baseId}>
        <div
          role="radiogroup"
          aria-label="色泽"
          onKeyDown={onKeyDown}
          className="mt-4 flex items-center justify-center"
          style={{ gap: spacing }}
        >
          {items.map((item, itemIndex) => {
            const selected = itemIndex === safe
            return (
              <button
                key={item.id}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={item.name}
                tabIndex={selected ? 0 : -1}
                onClick={() => go(itemIndex)}
                className="relative grid h-11 w-11 place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {selected ? (
                  reduced ? (
                    <span data-indicator className="absolute -inset-1 rounded-full ring-2 ring-foreground" />
                  ) : (
                    <motion.span
                      layoutId={`finish-swatch-${baseId}`}
                      data-indicator
                      className="absolute -inset-1 rounded-full ring-2 ring-foreground"
                      transition={{ type: "spring", stiffness: Math.round(380 * rate), damping: 32 }}
                    />
                  )
                ) : null}
                <span className={cn("block h-8 w-8 rounded-full", item.tone)} />
              </button>
            )
          })}
        </div>
      </LayoutGroup>
      <p role="status" aria-live="polite" className="sr-only">
        当前：{current.name}
      </p>
    </div>
  )
}
