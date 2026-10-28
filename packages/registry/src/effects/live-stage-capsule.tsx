"use client"

import { useEffect, useRef, useState, type KeyboardEvent } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface LiveStageCapsuleProps {
  pace?: number
  intensity?: number
  stages?: number
  autoAdvance?: boolean
  className?: string
  onIndexChange?: (index: number) => void
}

const STAGE_LABELS = ["Stage A", "Stage B", "Stage C", "Stage D", "Stage E"] as const

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

function stageCount(stages: number) {
  return clamp(Math.round(stages), 3, 5)
}

export function LiveStageCapsule({
  pace = 1,
  intensity = 0.65,
  stages = 4,
  autoAdvance = false,
  className,
  onIndexChange,
}: LiveStageCapsuleProps) {
  const ref = useRef<HTMLDivElement>(null)
  const indexRef = useRef(0)
  const lastRef = useRef(0)
  const onIndexRef = useRef(onIndexChange)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const liveRef = useRef(live)
  const gain = clamp(intensity, 0, 1)
  const rate = rateOf(pace)
  const total = stageCount(stages)
  const last = total - 1
  const node = Math.round(14 + gain * 12)
  const ease = reduced ? 0 : Math.round(280 / rate)
  const [index, setIndex] = useState(0)
  const [open, setOpen] = useState(true)
  const [phase, setPhase] = useState<"idle" | "advancing" | "complete">("idle")
  const safe = Math.min(index, last)
  const label = STAGE_LABELS[safe] ?? STAGE_LABELS[0]
  const letter = label.slice(-1)

  if (index !== safe) setIndex(safe)

  useEffect(() => {
    onIndexRef.current = onIndexChange
  }, [onIndexChange])

  useEffect(() => {
    liveRef.current = live
    indexRef.current = safe
    lastRef.current = last
  }, [live, safe, last])

  useEffect(() => {
    if (phase !== "advancing" || reduced || !live) return
    let frameId = 0
    let stopped = false
    frameId = window.requestAnimationFrame(() => {
      if (stopped) return
      setPhase(indexRef.current >= lastRef.current ? "complete" : "idle")
    })
    return () => {
      stopped = true
      window.cancelAnimationFrame(frameId)
    }
  }, [phase, reduced, live])

  useEffect(() => {
    if (!autoAdvance || reduced || !live || safe >= last) return
    const gap = Math.round(900 / rate)
    let frameId = 0
    let stopped = false
    let lastTime: number | null = null
    let acc = 0
    const tick = (now: number) => {
      if (stopped || !liveRef.current) return
      if (lastTime === null) lastTime = now
      else {
        acc += Math.max(0, now - lastTime)
        lastTime = now
      }
      if (acc >= gap) {
        const next = Math.min(lastRef.current, indexRef.current + 1)
        indexRef.current = next
        setIndex(next)
        onIndexRef.current?.(next)
        setPhase(next >= lastRef.current ? "complete" : "advancing")
        return
      }
      frameId = window.requestAnimationFrame(tick)
    }
    frameId = window.requestAnimationFrame(tick)
    return () => {
      stopped = true
      window.cancelAnimationFrame(frameId)
    }
  }, [autoAdvance, reduced, live, safe, last, rate])

  function go(next: number) {
    const clamped = clamp(Math.round(next), 0, lastRef.current)
    if (clamped === indexRef.current) {
      if (clamped >= lastRef.current) setPhase("complete")
      return
    }
    indexRef.current = clamped
    setIndex(clamped)
    onIndexRef.current?.(clamped)
    if (reduced || !liveRef.current) {
      setPhase(clamped >= lastRef.current ? "complete" : "idle")
      return
    }
    setPhase("advancing")
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

  return (
    <div
      ref={ref}
      data-slot="live-stage-capsule"
      data-ritual="stage-capsule"
      data-pace={rate}
      data-intensity={gain}
      data-stages={total}
      data-auto={autoAdvance ? "on" : "off"}
      data-index={safe}
      data-label={label}
      data-expanded={open ? "on" : "off"}
      data-state={safe >= last ? "complete" : phase}
      data-ease={ease}
      data-node={node}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      tabIndex={0}
      onKeyDown={onKeyDown}
      className={cn("w-full max-w-sm text-foreground outline-none motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-ring", className)}
    >
      <div
        className={cn(
          "bg-foreground text-background transition-transform motion-reduce:transition-none",
          open ? "rounded-3xl px-4 py-3" : "flex items-center rounded-full px-3 py-2",
        )}
        style={{ transitionDuration: `${ease}ms` }}
      >
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="grid shrink-0 place-items-center rounded-full bg-background font-semibold text-foreground"
            style={{ width: node + 10, height: node + 10 }}
          >
            {letter}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{label}</p>
            {open ? <p className="text-xs text-background/70">{safe >= last ? "完成" : "进行中"}</p> : null}
          </div>
          <button
            type="button"
            aria-expanded={open}
            onClick={() => setOpen((current) => !current)}
            className="rounded-full bg-background px-3 py-1 text-xs font-medium text-foreground"
          >
            {open ? "收起" : "展开"}
          </button>
        </div>
        <div hidden={!open} className="mt-3">
          <div className="flex items-center justify-between gap-2">
            {STAGE_LABELS.slice(0, total).map((name, i) => {
              const reached = i <= safe
              const current = i === safe
              return (
                <button
                  key={name}
                  type="button"
                  aria-label={name}
                  aria-current={current ? "step" : undefined}
                  data-reached={reached ? "yes" : "no"}
                  data-current={current ? "yes" : "no"}
                  onClick={() => go(i)}
                  className={cn(
                    "rounded-full transition-transform motion-reduce:transition-none",
                    reached ? "bg-background" : "bg-background/30",
                    current ? "ring-2 ring-background" : "",
                  )}
                  style={{ width: node, height: node, transitionDuration: `${ease}ms` }}
                />
              )
            })}
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          disabled={safe >= last}
          onClick={() => go(safe + 1)}
          className="rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground disabled:opacity-40"
        >
          Next stage
        </button>
        <button
          type="button"
          onClick={() => go(0)}
          className="rounded-full border border-border px-3 py-1.5 text-sm text-foreground"
        >
          Reset
        </button>
      </div>
      <p role="status" className="mt-2 text-sm text-muted-foreground">
        当前 {label}，{safe + 1} / {total}
      </p>
    </div>
  )
}