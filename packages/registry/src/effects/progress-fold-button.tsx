"use client"

// Ported from GodUI (MIT, (c) 2026 Lucas Bassetti) — https://github.com/LucasBassetti/godui/blob/1f632a7/packages/lab/src/progress-fold-button/progress-fold-button.tsx

import { useEffect, useId, useRef, useState, type ButtonHTMLAttributes, type CSSProperties } from "react"
import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"

export type ProgressFoldButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  color?: string
  duration?: number
  intensity?: number
  speed?: number
  size?: number
  status?: "idle" | "loading"
  progress?: number
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

export function ProgressFoldButton({
  color = "var(--primary)",
  duration = 1200,
  intensity = 35,
  speed = 1,
  size = 48,
  status = "idle",
  progress,
  className,
  style,
  children,
  ...props
}: ProgressFoldButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const sweepName = `progress-fold-${useId().replace(/:/g, "")}`
  const loading = status === "loading"
  const determinate = loading && progress != null
  const clamped = progress != null ? clamp(progress, 0, 100) : undefined
  const [armed, setArmed] = useState(false)
  const fold = `${clamp(intensity, 0, 55)}deg`
  const sweepMs = Math.max(200, duration / Math.max(speed, 0.1))

  useEffect(() => {
    const frame = requestAnimationFrame(() => setArmed(loading))
    return () => cancelAnimationFrame(frame)
  }, [loading])

  return (
    <button
      ref={ref}
      type="button"
      data-slot="progress-fold-button"
      data-status={loading ? "loading" : undefined}
      data-determinate={determinate ? "true" : undefined}
      data-armed={armed ? "true" : undefined}
      data-motion={live && !reduced ? "on" : "off"}
      aria-busy={loading || undefined}
      className={`group relative inline-flex cursor-pointer select-none border-0 bg-transparent p-0 font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 ${className ?? ""}`}
      style={
        {
          ...style,
          perspective: "800px",
          "--fold-angle": fold,
          "--fold": reduced && loading ? fold : "0deg",
          "--progress-fold-fill": clamped != null ? clamped / 100 : 0,
          "--color": color,
        } as CSSProperties
      }
      {...props}
    >
      <style>{`@keyframes ${sweepName}{from{transform:translateX(-100%)}to{transform:translateX(250%)}}`}</style>
      <span
        aria-hidden="true"
        className="absolute inset-0 overflow-hidden"
        style={{ borderRadius: size / 4, background: "color-mix(in srgb, var(--color, var(--primary)) 18%, transparent)" }}
      >
        <span
          className="absolute top-0 left-0 h-full origin-left motion-reduce:animate-none"
          style={{
            width: determinate || reduced ? "100%" : "40%",
            background: "color-mix(in srgb, var(--color, var(--primary)) 45%, transparent)",
            transform: determinate ? "scaleX(var(--progress-fold-fill, 0))" : reduced ? "scaleX(0.4)" : undefined,
            transition: determinate && armed && !reduced ? "transform 250ms ease" : "none",
            animationName: !determinate && loading && !reduced ? sweepName : undefined,
            animationDuration: !determinate && loading && !reduced ? `${sweepMs}ms` : undefined,
            animationTimingFunction: !determinate && loading && !reduced ? "ease-in-out" : undefined,
            animationIterationCount: !determinate && loading && !reduced ? "infinite" : undefined,
            animationPlayState: live && !reduced ? "running" : "paused",
          }}
        />
      </span>
      <span
        data-slot="progress-fold-front"
        className="relative grid place-items-center motion-reduce:transition-none group-hover:[--fold:var(--fold-angle)] group-active:[--fold:var(--fold-angle)] group-focus-visible:[--fold:var(--fold-angle)] group-data-[status=loading]:[--fold:var(--fold-angle)]"
        style={{
          minHeight: size,
          paddingInline: size * 0.7,
          borderRadius: size / 4,
          background: "var(--color, var(--primary))",
          color: "var(--primary-foreground)",
          transformOrigin: "top center",
          transform: "rotateX(var(--fold, 0deg))",
          transition: reduced ? "none" : "transform 200ms ease",
        }}
      >
        {children}
      </span>
      {loading ? (
        <span className="sr-only" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={determinate ? clamped : undefined} aria-valuetext={determinate ? `${clamped}%` : "Loading"} />
      ) : null}
    </button>
  )
}
