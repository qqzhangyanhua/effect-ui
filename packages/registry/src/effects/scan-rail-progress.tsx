"use client"

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export type ScanRailMode = "auto" | "hold"

export interface ScanRailProgressProps {
  pace?: number
  intensity?: number
  mode?: ScanRailMode
  className?: string
  onComplete?: () => void
}

type Phase = "ready" | "scanning" | "complete"

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

function fixed(value: number) {
  return (Math.round(value * 1000) / 1000).toFixed(3)
}

export function ScanRailProgress({
  pace = 1,
  intensity = 0.7,
  mode = "auto",
  className,
  onComplete,
}: ScanRailProgressProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const gain = clamp(intensity, 0, 1)
  const rate = rateOf(pace)
  const [progress, setProgress] = useState(0)
  const [scan, setScan] = useState(0)
  const [phase, setPhase] = useState<Phase>("ready")
  const [holding, setHolding] = useState(false)
  const progressRef = useRef(0)
  const dirRef = useRef(1)
  const doneRef = useRef(false)
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    if (reduced || !live || phase === "complete") return
    if (mode === "hold" && !holding) return
    let frame = 0
    let stopped = false
    let stage: Phase = phase
    const tick = () => {
      if (stopped) return
      const next = Math.min(1, Math.round((progressRef.current + 0.02 * rate) * 1000) / 1000)
      progressRef.current = next
      setProgress(next)
      setScan((prev) => {
        let value = Math.round((prev + dirRef.current * 0.04 * rate) * 1000) / 1000
        if (value >= 1) {
          value = 1
          dirRef.current = -1
        } else if (value <= 0) {
          value = 0
          dirRef.current = 1
        }
        return value
      })
      if (next >= 1) {
        stopped = true
        stage = "complete"
        setPhase("complete")
        if (!doneRef.current) {
          doneRef.current = true
          onCompleteRef.current?.()
        }
        return
      }
      if (stage !== "scanning") {
        stage = "scanning"
        setPhase("scanning")
      }
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => {
      stopped = true
      window.cancelAnimationFrame(frame)
    }
  }, [reduced, live, mode, holding, rate, phase])

  useEffect(() => {
    if (!holding) return
    const stop = () => setHolding(false)
    window.addEventListener("pointerup", stop)
    window.addEventListener("pointercancel", stop)
    return () => {
      window.removeEventListener("pointerup", stop)
      window.removeEventListener("pointercancel", stop)
    }
  }, [holding])

  function finish() {
    if (doneRef.current) return
    doneRef.current = true
    progressRef.current = 1
    setProgress(1)
    setPhase("complete")
    onCompleteRef.current?.()
  }

  function reset() {
    doneRef.current = false
    progressRef.current = 0
    dirRef.current = 1
    setProgress(0)
    setScan(0)
    setHolding(false)
    setPhase("ready")
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (mode !== "hold" || reduced || phase === "complete" || event.button !== 0) return
    event.preventDefault()
    setHolding(true)
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (mode !== "hold" || reduced || phase === "complete") return
    if (event.key !== " " && event.key !== "Spacebar") return
    if ((event.target as HTMLElement).closest("button")) return
    event.preventDefault()
    if (event.repeat) return
    setHolding(true)
  }

  function onKeyUp(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== " " && event.key !== "Spacebar") return
    setHolding(false)
  }

  const dim = 0.28 + gain * 0.42

  return (
    <div
      ref={ref}
      data-slot="scan-rail-progress"
      data-pace={Number.isFinite(pace) ? pace : 1}
      data-intensity={gain}
      data-mode={mode}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      data-holding={holding ? "on" : "off"}
      data-state={phase}
      data-progress={fixed(progress)}
      data-scan={fixed(reduced ? 0 : scan)}
      tabIndex={0}
      role="group"
      aria-label="扫描轨"
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      className={cn(
        "w-full max-w-md rounded-3xl border border-border bg-card p-4 text-card-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
        phase === "complete" && "border-primary",
        className,
      )}
    >
      <div
        data-hold-target=""
        onPointerDown={onPointerDown}
        onPointerUp={() => setHolding(false)}
        onPointerCancel={() => setHolding(false)}
        className="relative h-56 overflow-hidden rounded-2xl border border-border bg-background touch-none"
      >
        <div
          aria-hidden
          data-mask=""
          className="absolute left-1/2 top-1/2 h-36 w-44 -translate-x-1/2 -translate-y-1/2 rounded-[2rem] border border-border"
          style={{ boxShadow: `0 0 0 999px color-mix(in oklch, var(--background) ${Math.round(dim * 100)}%, transparent)` }}
        />
        {reduced ? null : (
          <div className="absolute left-1/2 top-1/2 h-36 w-44 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[2rem]">
            <div
              data-rail=""
              className="absolute inset-x-0 h-0.5 bg-primary motion-reduce:transition-none"
              style={{ top: `${scan * 100}%`, opacity: 0.35 + gain * 0.65 }}
            />
          </div>
        )}
        {phase === "complete" ? (
          <p className="absolute inset-x-0 bottom-3 text-center text-sm text-primary" role="status">
            完成
          </p>
        ) : null}
      </div>
      <div
        role="progressbar"
        aria-label="扫描进度"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
        className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted"
      >
        <div className="h-full bg-primary motion-reduce:transition-none" style={{ width: `${progress * 100}%` }} />
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          {reduced ? "直接完成" : mode === "hold" ? "按住空格或按住画面" : "自动扫描"}
        </p>
        {reduced && phase !== "complete" ? (
          <button type="button" onClick={finish} className="rounded-full bg-primary px-3 py-1.5 text-sm text-primary-foreground">
            Complete
          </button>
        ) : (
          <button
            type="button"
            onClick={reset}
            disabled={phase === "ready" && progress === 0}
            className="rounded-full border border-border px-3 py-1.5 text-sm disabled:opacity-40"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  )
}
