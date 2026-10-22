"use client"

// Ported from Framekit UI (MIT, (c) 2026 Framekit UI contributors) — https://github.com/Sid9022/framekit-ui/blob/master/src/components/ui/cook-loading.tsx

import { useEffect, useId, useRef, useState } from "react"
import { Check, Pause, Play, RotateCcw, TriangleAlert } from "lucide-react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export type CookLoadingState = "loading" | "done" | "error"

export interface CookLoadingProps {
  progress?: number
  state?: CookLoadingState
  label?: string
  description?: string
  doneLabel?: string
  errorLabel?: string
  showLabel?: boolean
  size?: number
  speed?: number
  color?: string
  intensity?: number
  paused?: boolean
  defaultPaused?: boolean
  onPausedChange?: (paused: boolean) => void
  onRetry?: () => void
  retryLabel?: string
  className?: string
}

function bounded(value: number, fallback: number, min: number, max: number) {
  return Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback
}

export function CookLoading({
  progress,
  state: stateProp,
  label = "Cooking things up…",
  description,
  doneLabel = "Ready to serve.",
  errorLabel = "Something needs another try.",
  showLabel = true,
  size = 280,
  speed = 1,
  color = "var(--primary)",
  intensity = 1,
  paused: pausedProp,
  defaultPaused = false,
  onPausedChange,
  onRetry,
  retryLabel = "Try again",
  className,
}: CookLoadingProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const armRef = useRef<SVGGElement>(null)
  const steamRef = useRef<SVGGElement>(null)
  const clock = useRef(0)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef)
  const [innerPaused, setInnerPaused] = useState(defaultPaused)
  const paused = pausedProp ?? innerPaused
  const determinate = typeof progress === "number" && Number.isFinite(progress)
  const pct = determinate ? bounded(progress ?? 0, 0, 0, 100) : undefined
  const state = stateProp ?? (pct === 100 ? "done" : "loading")
  const width = bounded(size, 280, 160, 480)
  const rate = bounded(speed, 1, 0.5, 2)
  const moving = live && !reduced && !paused && state === "loading"
  const text = state === "done" ? doneLabel : state === "error" ? errorLabel : label
  const detail = description ?? (state === "done" ? "Everything is ready." : state === "error" ? "We couldn’t finish loading." : "Good things take a moment.")
  const displayProgress = state === "done" ? 100 : pct
  const barId = useId()
  const indeterminate = `cook-${barId.replace(/:/g, "")}`

  useEffect(() => {
    const arm = armRef.current
    const steam = steamRef.current
    if (!arm) return
    if (reduced || state !== "loading") {
      arm.style.transform = "rotate(0deg)"
      if (steam) steam.style.opacity = "0"
      return
    }
    if (!moving) return
    let frame = 0
    let last = 0
    const step = (now: number) => {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016
      last = now
      clock.current += dt * rate
      const pose = Math.floor(clock.current * 8) % 8
      arm.setAttribute("transform", `rotate(${pose < 4 ? -18 - pose * 6 : 8} 168 150)`)
      if (steam) {
        const wisps = steam.querySelectorAll("path")
        wisps.forEach((node, index) => {
          const phase = (clock.current * 0.42 * intensity + index / 3) % 1
          node.setAttribute("opacity", String(Math.sin(phase * Math.PI) * 0.7 * intensity))
          node.setAttribute("transform", `translate(0 ${-phase * 28})`)
        })
      }
      frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [intensity, moving, rate, reduced, state])

  const setPaused = () => {
    const next = !paused
    if (pausedProp === undefined) setInnerPaused(next)
    onPausedChange?.(next)
  }

  return (
    <div ref={rootRef} data-state={state} data-motion={moving ? "on" : "off"} className={cn("inline-flex max-w-full flex-col items-center text-center text-foreground motion-reduce:animate-none", className)} style={{ width }}>
      <style>{`@keyframes ${indeterminate}{from{transform:translateX(-120%)}to{transform:translateX(320%)}}@media (prefers-reduced-motion:reduce){.${indeterminate}{animation:none!important}}`}</style>
      <div className="relative aspect-square w-full" aria-hidden>
        <div className="absolute inset-x-[10%] top-[8%] bottom-[9%] rounded-full" style={{ background: `color-mix(in oklab, ${color} 55%, var(--muted))` }} />
        <svg viewBox="0 0 320 320" className="relative size-full">
          <g ref={steamRef} fill="none" stroke="var(--foreground)" strokeWidth="3" strokeLinecap="round">
            <path d="M150 150 C142 140 158 132 150 122" opacity="0" />
            <path d="M168 146 C160 134 176 126 168 114" opacity="0" />
            <path d="M186 150 C178 138 194 130 186 118" opacity="0" />
          </g>
          <ellipse cx="168" cy="214" rx="54" ry="16" fill="var(--foreground)" />
          <path d="M118 206h100" stroke="var(--muted-foreground)" strokeWidth="8" strokeLinecap="round" />
          <circle cx="132" cy="168" r="28" fill="var(--card)" />
          <path d="M150 176c18 10 36 4 48-12" fill="var(--accent)" />
          <g ref={armRef}>
            <path d="M168 168c22-6 36 8 28 24" fill="none" stroke="var(--foreground)" strokeWidth="8" strokeLinecap="round" />
            <circle cx="196" cy="196" r="7" fill={color} />
          </g>
          <path d="M120 150c8-28 40-36 52-8" fill="var(--muted)" />
        </svg>
        {state !== "loading" ? (
          <span className="absolute top-4 right-4 grid size-9 place-items-center rounded-full bg-background text-foreground shadow">
            {state === "done" ? <Check size={20} /> : <TriangleAlert size={19} />}
          </span>
        ) : null}
      </div>
      <div className={cn("w-full px-3", !showLabel && "sr-only")}>
        <p className="text-2xl leading-tight">{text}</p>
        {detail ? <p className="mt-2 text-sm text-muted-foreground">{detail}</p> : null}
      </div>
      {state !== "error" ? (
        <div id={barId} role="progressbar" aria-label={text} aria-valuemin={0} aria-valuemax={100} aria-valuenow={displayProgress === undefined ? undefined : Math.round(displayProgress)} className="mt-3 w-full px-3">
          <div aria-hidden className="h-1 overflow-hidden rounded-full bg-muted">
            {displayProgress !== undefined ? (
              <div className="h-full rounded-full bg-foreground" style={{ width: `${displayProgress}%` }} />
            ) : (
              <div className={cn("h-full w-1/3 rounded-full bg-foreground motion-reduce:animate-none", indeterminate)} style={{ animation: moving ? `${indeterminate} 1.1s linear infinite` : "none" }} />
            )}
          </div>
          {displayProgress !== undefined && showLabel ? <p aria-hidden className="mt-2 text-xs text-muted-foreground tabular-nums">{Math.round(displayProgress)}%</p> : null}
        </div>
      ) : null}
      <div className="mt-2 flex min-h-11 items-center justify-center">
        {state === "loading" && !reduced ? (
          <button type="button" onClick={setPaused} aria-pressed={paused} className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-xs text-muted-foreground ring-1 ring-border">
            {paused ? <Play size={12} aria-hidden /> : <Pause size={12} aria-hidden />}
            {paused ? "Resume animation" : "Pause animation"}
          </button>
        ) : null}
        {state === "error" && onRetry ? (
          <button type="button" onClick={onRetry} className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-xs text-foreground ring-1 ring-border">
            <RotateCcw size={14} aria-hidden />
            {retryLabel}
          </button>
        ) : null}
      </div>
    </div>
  )
}
