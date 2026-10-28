"use client"

import { useEffect, useRef, useState, type KeyboardEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface SpineNodeMarchProps {
  pace?: number
  intensity?: number
  flow?: boolean
  showChecks?: boolean
  className?: string
  onValueChange?: (state: { activeIndex: number }) => void
}

export interface SpineStep {
  id: string
  title: string
  detail: string
}

export const SPINE_STEPS: readonly SpineStep[] = [
  { id: "gather", title: "Gather notes", detail: "Collect the loose pieces." },
  { id: "sketch", title: "Sketch the frame", detail: "Mark the vertical spine." },
  { id: "tune", title: "Tune the motion", detail: "Set the step between nodes." },
  { id: "check", title: "Check the edges", detail: "Confirm what is already done." },
  { id: "ship", title: "Ship the draft", detail: "Leave a quiet record." },
]

type SpinePhase = "idle" | "marching" | "settled"

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

export function spineSolid(index: number, length = SPINE_STEPS.length) {
  if (length <= 1) return 1
  return clamp(index, 0, length - 1) / (length - 1)
}

export function SpineNodeMarch({
  pace = 1,
  intensity = 0.7,
  flow = true,
  showChecks = true,
  className,
  onValueChange,
}: SpineNodeMarchProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const onValueRef = useRef(onValueChange)
  const gain = clamp(intensity, 0, 1)
  const paceRate = rateOf(pace)
  const ms = reduced ? 0 : Math.round(280 / paceRate)
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<SpinePhase>("idle")
  const [flowT, setFlowT] = useState(0)
  const playing = flow && live && !reduced
  const solid = spineSolid(index)
  const safe = clamp(index, 0, SPINE_STEPS.length - 1)

  useEffect(() => {
    onValueRef.current = onValueChange
  }, [onValueChange])

  useEffect(() => {
    if (phase !== "marching") return
    const id = window.setTimeout(() => setPhase("settled"), ms)
    return () => window.clearTimeout(id)
  }, [phase, safe, ms])

  useEffect(() => {
    if (!playing) return
    let frame = 0
    let stopped = false
    let last = 0
    const tick = (now: number) => {
      if (stopped) return
      const dt = now > last ? Math.min(0.05, (now - last) / 1000) : 1 / 12
      if (now > 0) last = now
      setFlowT((value) => (value + dt * paceRate) % 1)
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => {
      stopped = true
      window.cancelAnimationFrame(frame)
    }
  }, [playing, paceRate])

  function go(next: number) {
    const clamped = clamp(Math.round(next), 0, SPINE_STEPS.length - 1)
    if (clamped === safe) return
    setIndex(clamped)
    setPhase(reduced ? "settled" : "marching")
    onValueRef.current?.({ activeIndex: clamped })
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const key = event.key
    const atRoot = event.target === event.currentTarget
    if (key === "ArrowDown" || key === "j" || key === "J" || (key === "Enter" && atRoot)) go(safe + 1)
    else if (key === "ArrowUp" || key === "k" || key === "K") go(safe - 1)
    else if (key === "Home") go(0)
    else if (key === "End") go(SPINE_STEPS.length - 1)
    else return
    event.preventDefault()
  }

  return (
    <div
      ref={ref}
      data-slot="spine-node-march"
      data-ritual="spine-march"
      data-pace={paceRate}
      data-intensity={gain}
      data-index={safe}
      data-phase={phase}
      data-solid={solid.toFixed(2)}
      data-flow={flow ? "on" : "off"}
      data-playing={playing ? "on" : "off"}
      data-flow-t={flowT.toFixed(2)}
      data-checks={showChecks ? "on" : "off"}
      data-ease={ms}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      tabIndex={0}
      onKeyDown={onKeyDown}
      className={cn(
        "w-full max-w-md rounded-3xl border border-border bg-card p-4 text-card-foreground outline-none select-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
        className,
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">Steps</p>
        <p className="text-xs text-muted-foreground">
          {safe + 1} / {SPINE_STEPS.length}
        </p>
      </div>
      <div className="relative">
        <svg data-part="spine" viewBox="0 0 16 100" preserveAspectRatio="none" className="absolute top-3 bottom-3 left-3 w-4" aria-hidden="true">
          <line
            x1="8"
            y1="0"
            x2="8"
            y2="100"
            stroke="var(--border)"
            strokeWidth="2"
            strokeDasharray="4 5"
            strokeDashoffset={playing ? -flowT * 18 : 0}
          />
          <line
            x1="8"
            y1="0"
            x2="8"
            y2={solid * 100}
            stroke="var(--primary)"
            strokeWidth={2 + gain * 2}
            strokeLinecap="round"
          />
        </svg>
        <ol className="space-y-2 pl-10">
          {SPINE_STEPS.map((step, stepIndex) => {
            const current = stepIndex === safe
            const done = stepIndex < safe
            return (
              <li key={step.id}>
                <button
                  type="button"
                  aria-current={current ? "step" : undefined}
                  data-node={step.id}
                  data-check={done && showChecks ? "on" : "off"}
                  onClick={() => go(stepIndex)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-full border text-left outline-none motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-ring",
                    current ? "border-primary bg-primary px-3 py-2 text-primary-foreground" : "border-border bg-background px-2 py-1 text-foreground",
                  )}
                  style={{
                    transform: current ? `scale(${1 + gain * 0.04})` : undefined,
                    boxShadow: current ? `0 0 ${8 + gain * 16}px color-mix(in srgb, var(--primary) ${Math.round(24 + gain * 40)}%, transparent)` : undefined,
                    transition: reduced ? "none" : `transform ${ms}ms cubic-bezier(0.22, 1, 0.36, 1)`,
                  }}
                >
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-card text-xs text-card-foreground">
                    {done && showChecks ? "✓" : stepIndex + 1}
                  </span>
                  {current ? (
                    <span>
                      <span className="block text-sm font-semibold">{step.title}</span>
                      <span className="block text-xs opacity-80">{step.detail}</span>
                    </span>
                  ) : (
                    <span className="text-sm">{step.title}</span>
                  )}
                </button>
              </li>
            )
          })}
        </ol>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => go(safe - 1)}
          className="h-9 flex-1 rounded-full border border-border bg-background text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Back
        </button>
        <button
          type="button"
          onClick={() => go(safe + 1)}
          className="h-9 flex-1 rounded-full bg-primary text-sm text-primary-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Next
        </button>
      </div>
      <motion.span className="sr-only" aria-live="polite">
        {SPINE_STEPS[safe]?.title}
      </motion.span>
    </div>
  )
}
