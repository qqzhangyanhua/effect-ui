"use client"

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface StripStepExpandProps {
  pace?: number
  intensity?: number
  count?: number
  gap?: number
  className?: string
  onIndexChange?: (index: number) => void
}

interface Step {
  id: string
  title: string
  summary: string
}

const steps: readonly Step[] = [
  { id: "01", title: "取景", summary: "窄条上的字竖着排，编号留得很大。" },
  { id: "02", title: "展开", summary: "点开之后标题横过来，旁边多一块色。" },
  { id: "03", title: "收窄", summary: "其余条子让出宽度，同时只留一条展开。" },
  { id: "04", title: "换条", summary: "左右方向键或回车都能换到下一条。" },
  { id: "05", title: "停住", summary: "没有循环动画，离开视口也不再排帧。" },
]

const tones = ["bg-primary", "bg-accent", "bg-secondary", "bg-muted", "bg-primary/70"] as const

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

function stepCount(count: number) {
  return clamp(Math.round(count), 3, 5)
}

export function StripStepExpand({
  pace = 1,
  intensity = 0.7,
  count = 3,
  gap = 8,
  className,
  onIndexChange,
}: StripStepExpandProps) {
  const ref = useRef<HTMLDivElement>(null)
  const buttons = useRef<Array<HTMLButtonElement | null>>([])
  const frame = useRef(0)
  const liveRef = useRef(false)
  const onIndexRef = useRef(onIndexChange)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const baseId = useId()
  const items = steps.slice(0, stepCount(count))
  const gain = clamp(intensity, 0, 1)
  const rate = rateOf(pace)
  const space = clamp(gap, 0, 32)
  const radius = Math.round(12 + gain * 16)
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<"expanding" | "expanded">("expanded")
  const safe = clamp(index, 0, Math.max(0, items.length - 1))
  const current = items[safe]

  useEffect(() => {
    onIndexRef.current = onIndexChange
  }, [onIndexChange])

  useEffect(() => {
    liveRef.current = live
    if (live) return
    window.cancelAnimationFrame(frame.current)
    frame.current = 0
    queueMicrotask(() => {
      if (!liveRef.current) setPhase("expanded")
    })
  }, [live])

  useEffect(() => {
    return () => window.cancelAnimationFrame(frame.current)
  }, [])

  function select(next: number) {
    const clamped = clamp(next, 0, Math.max(0, items.length - 1))
    if (clamped === safe) return
    setIndex(clamped)
    onIndexRef.current?.(clamped)
    buttons.current[clamped]?.focus()
    window.cancelAnimationFrame(frame.current)
    frame.current = 0
    if (reduced || !liveRef.current) {
      setPhase("expanded")
      return
    }
    setPhase("expanding")
    frame.current = window.requestAnimationFrame(() => {
      frame.current = window.requestAnimationFrame(() => {
        frame.current = 0
        setPhase("expanded")
      })
    })
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault()
      select(safe + 1)
    } else if (event.key === "ArrowLeft") {
      event.preventDefault()
      select(safe - 1)
    }
  }

  const spring = reduced || !live ? { duration: 0 } : { type: "spring" as const, stiffness: Math.round(240 * rate), damping: 28 }

  return (
    <div
      ref={ref}
      data-slot="strip-step-expand"
      data-ritual="strip-step"
      data-layout="horizontal-strips"
      data-pace={rate}
      data-intensity={gain}
      data-count={items.length}
      data-gap={space}
      data-index={safe}
      data-state={phase}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      role="tablist"
      aria-label="编号步骤"
      aria-orientation="horizontal"
      onKeyDown={onKeyDown}
      className={cn(
        "flex h-72 w-full max-w-3xl items-stretch rounded-3xl border border-border bg-card p-2 text-card-foreground outline-none motion-reduce:transition-none",
        className,
      )}
      style={{ gap: space }}
    >
      {items.map((step, itemIndex) => {
        const open = itemIndex === safe
        const tone = tones[itemIndex] ?? "bg-primary"
        return (
          <motion.button
            key={step.id}
            ref={(node) => {
              buttons.current[itemIndex] = node
            }}
            type="button"
            role="tab"
            id={`${baseId}-${step.id}`}
            aria-selected={open}
            aria-label={`${step.id} ${step.title}`}
            tabIndex={0}
            layout={!reduced && live}
            transition={spring}
            data-open={open ? "true" : "false"}
            data-state={open ? phase : "collapsed"}
            data-writing={open ? "horizontal" : "vertical"}
            data-step={step.id}
            onClick={() => select(itemIndex)}
            className={cn(
              "relative flex min-w-14 overflow-hidden border border-border bg-background text-left text-foreground outline-none motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-ring",
              open ? "flex-row items-stretch gap-3 px-4 py-3" : "flex-col items-center justify-between px-2 py-3",
            )}
            style={{
              flexGrow: open ? 1 : 0,
              flexBasis: open ? `${Math.round(168 + gain * 96)}px` : "3.5rem",
              borderRadius: radius,
            }}
          >
            <span className={cn("font-display text-3xl leading-none", open ? "text-primary" : "text-muted-foreground")}>{step.id}</span>
            <span className="flex min-w-0 flex-1 flex-col gap-2">
              <span data-title className={cn("font-medium tracking-tight", open ? "text-lg" : "text-sm")} style={{ writingMode: open ? "horizontal-tb" : "vertical-rl" }}>
                {step.title}
              </span>
              {open ? <span className="text-sm text-muted-foreground">{step.summary}</span> : null}
            </span>
            {open ? <span aria-hidden data-swatch className={cn("h-16 w-16 shrink-0 rounded-2xl", tone)} /> : null}
          </motion.button>
        )
      })}
      <p role="status" aria-live="polite" className="sr-only">
        展开 {current?.title ?? ""}
      </p>
    </div>
  )
}
