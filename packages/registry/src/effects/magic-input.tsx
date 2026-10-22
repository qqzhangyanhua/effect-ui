"use client"

// Ported from GodUI (MIT, (c) 2026 Lucas Bassetti) — https://github.com/LucasBassetti/godui/blob/1f632a7/packages/lab/src/magic-input/magic-input.tsx

import { ArrowRight, Check, LoaderCircle, X } from "lucide-react"
import { useEffect, useId, useRef, useState, type CSSProperties, type InputHTMLAttributes, type KeyboardEvent } from "react"
import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"

export type MagicInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "onSubmit" | "color"> & {
  color?: string
  duration?: number
  intensity?: number
  speed?: number
  size?: number
  depth?: "focus" | "always"
  rainbow?: boolean
  submitButton?: boolean
  onSubmit?: (value: string) => void
  submitLabel?: string
  status?: "idle" | "loading" | "success" | "error"
  progress?: number
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, value))
}

export function MagicInput({
  color = "var(--primary)",
  duration = 600,
  intensity = 4,
  speed = 1,
  size = 48,
  depth = "focus",
  rainbow = true,
  submitButton = false,
  onSubmit,
  submitLabel = "Submit",
  status = "idle",
  progress,
  className,
  style,
  disabled,
  readOnly,
  onKeyDown,
  ...props
}: MagicInputProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef)
  const indeterminate = `magic-input-slide-${useId().replace(/:/g, "")}`
  const sweep = `magic-input-sweep-${useId().replace(/:/g, "")}`
  const spin = `magic-input-spin-${useId().replace(/:/g, "")}`
  const loading = status === "loading"
  const success = status === "success"
  const error = status === "error"
  const idle = status === "idle"
  const determinate = loading && progress != null
  const clamped = progress != null ? clamp(progress) : undefined
  const [armed, setArmed] = useState(false)
  const showButton = submitButton || onSubmit != null
  const lift = Math.max(0, intensity)
  const play = live && !reduced
  const fill = success ? "var(--chart-2)" : error ? "var(--destructive)" : color
  const cycle = `${Math.max(0.4, 1.2 / Math.max(speed, 0.1))}s`

  useEffect(() => {
    const frame = requestAnimationFrame(() => setArmed(loading))
    return () => cancelAnimationFrame(frame)
  }, [loading])

  const onKey = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event)
    if (idle && onSubmit && event.key === "Enter" && !event.defaultPrevented) onSubmit(event.currentTarget.value)
  }

  const restingLift = !disabled && (depth === "always" || !idle) ? lift : 0

  return (
    <div
      ref={rootRef}
      data-slot="magic-input"
      data-status={idle ? undefined : status}
      data-motion={play ? "on" : "off"}
      className={`group relative inline-block w-full rounded-xl ${disabled ? "cursor-not-allowed" : ""} ${className ?? ""}`}
      style={{ ...style, "--magic-fill": fill, "--magic-progress": `${clamped ?? 0}%` } as CSSProperties}
    >
      <style>{`@keyframes ${indeterminate}{from{background-position:110% center}to{background-position:-10% center}}@keyframes ${sweep}{from{background-size:0% 100%}to{background-size:100% 100%}}@keyframes ${spin}{to{transform:rotate(360deg)}}`}</style>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-xl motion-reduce:animate-none motion-reduce:transition-none group-focus-within:opacity-70 group-active:opacity-70"
        style={{
          opacity: disabled ? 0 : !idle ? 0.75 : depth === "always" ? 0.45 : undefined,
          transform: `translateY(${restingLift > 0 ? 6 : 0}px)`,
          filter: "blur(12px)",
          backgroundImage: idle && rainbow ? "linear-gradient(90deg, var(--chart-1), var(--chart-5), var(--chart-3), var(--chart-4), var(--chart-2))" : undefined,
          backgroundColor: idle && rainbow ? undefined : fill,
          backgroundSize: determinate ? "var(--magic-progress) 100%" : loading ? "45% 100%" : "100% 100%",
          backgroundRepeat: "no-repeat",
          transition: reduced || (determinate && !armed) ? "none" : `transform ${duration}ms cubic-bezier(0.3,0.7,0.4,1), opacity 250ms ease, background-size 250ms ease`,
          animationName: !idle && !determinate && !reduced ? (loading ? indeterminate : sweep) : undefined,
          animationDuration: !idle && !determinate && !reduced ? cycle : undefined,
          animationTimingFunction: !idle && !determinate && !reduced ? "ease-in-out" : undefined,
          animationIterationCount: !idle && !determinate && !reduced ? (loading ? "infinite" : "1") : undefined,
          animationPlayState: play ? "running" : "paused",
        }}
      />
      <input
        ref={inputRef}
        disabled={disabled}
        readOnly={readOnly || loading || success}
        aria-busy={loading || undefined}
        onKeyDown={onKey}
        className="relative box-border w-full rounded-xl border border-border bg-background text-foreground outline-none placeholder:text-muted-foreground motion-reduce:transition-none group-focus-within:-translate-y-1 group-focus-within:border-transparent group-active:-translate-y-1 disabled:opacity-50"
        style={{
          minHeight: size,
          paddingInline: showButton ? `16px ${size}px` : 16,
          transform: restingLift ? `translateY(-${restingLift}px)` : undefined,
          transition: reduced ? "none" : `transform ${duration}ms cubic-bezier(0.3,0.7,0.4,1)`,
        }}
        {...props}
      />
      {!idle ? (
        <span className="sr-only" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={determinate ? clamped : undefined} aria-valuetext={success ? "Success" : error ? "Error" : determinate ? `${clamped}%` : "Loading"} />
      ) : null}
      {showButton ? (
        <button
          type={onSubmit ? "button" : "submit"}
          aria-label={submitLabel}
          disabled={disabled || !idle}
          onClick={() => {
            if (!idle) return
            onSubmit?.(inputRef.current?.value ?? "")
          }}
          className="absolute top-1.5 right-1.5 bottom-1.5 z-10 inline-flex aspect-square items-center justify-center rounded-lg border-0 text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50"
          style={{
            background: success ? "var(--chart-2)" : error ? "var(--destructive)" : color,
            transform: restingLift ? `translateY(-${restingLift}px)` : undefined,
          }}
        >
          {idle ? <ArrowRight className="size-4" aria-hidden="true" /> : null}
          {loading && !determinate ? (
            <LoaderCircle
              className="size-4 motion-reduce:animate-none"
              style={{
                animationName: reduced ? undefined : spin,
                animationDuration: reduced ? undefined : cycle,
                animationTimingFunction: reduced ? undefined : "linear",
                animationIterationCount: reduced ? undefined : "infinite",
                animationPlayState: play ? "running" : "paused",
              }}
              aria-hidden="true"
            />
          ) : null}
          {loading && determinate ? <span className="text-xs tabular-nums">{clamped}</span> : null}
          {success ? <Check className="size-4" aria-hidden="true" /> : null}
          {error ? <X className="size-4" aria-hidden="true" /> : null}
        </button>
      ) : null}
      </div>
  )
}
