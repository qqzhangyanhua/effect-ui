"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface PeekRatingProps {
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  max?: number
  allowHalf?: boolean
  readOnly?: boolean
  disabled?: boolean
  color?: string
  size?: number
  intensity?: number
  className?: string
  ref?: React.Ref<HTMLDivElement>
  "aria-label"?: string
  name?: string
}

function formatScore(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

function starSteps(max: number, allowHalf: boolean) {
  const count = Math.max(1, Math.round(max))
  const steps: number[] = []
  for (let star = 1; star <= count; star += 1) {
    if (allowHalf) steps.push(star - 0.5)
    steps.push(star)
  }
  return { count, steps }
}

function PeekRating({
  value,
  defaultValue = 0,
  onValueChange,
  max = 5,
  allowHalf = false,
  readOnly = false,
  disabled = false,
  color,
  size,
  intensity,
  className,
  ref,
  "aria-label": ariaLabel = "评分",
  name,
}: PeekRatingProps) {
  const reduced = usePrefersReducedMotion()
  const generatedName = React.useId()
  const groupName = name ?? generatedName
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue)
  const [preview, setPreview] = React.useState<number | null>(null)
  const selected = value ?? uncontrolled
  const { count, steps } = starSteps(max, allowHalf)
  const shown = preview ?? selected
  const locked = readOnly || disabled
  const starPx = size === undefined || size === 28 ? undefined : size

  const commit = (next: number) => {
    if (locked) return
    if (value === undefined) setUncontrolled(next)
    onValueChange?.(next)
  }

  return (
    <div
      ref={ref}
      role="slider"
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={count}
      aria-valuenow={selected}
      aria-readonly={readOnly || undefined}
      aria-disabled={disabled || undefined}
      tabIndex={locked ? -1 : 0}
      data-slot="peek-rating"
      className={cn("inline-flex items-center gap-3", className)}
      onMouseLeave={() => setPreview(null)}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget || locked) return
        const step = allowHalf ? 0.5 : 1
        if (event.key === "ArrowRight" || event.key === "ArrowUp") {
          event.preventDefault()
          commit(Math.min(count, selected + step))
        } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
          event.preventDefault()
          commit(Math.max(0, selected - step))
        }
      }}
    >
      <div className="inline-flex" style={color ? { color } : undefined}>
        {Array.from({ length: count }, (_, index) => {
          const star = index + 1
          const filled = shown >= star
          const half = !filled && shown >= star - 0.5
          return (
            <span
              key={star}
              className={starPx === undefined ? "relative size-7 text-muted-foreground" : "relative text-muted-foreground"}
              style={starPx === undefined ? undefined : { width: starPx, height: starPx }}
            >
              <Star filled={filled} half={half} reduced={reduced} size={starPx} intensity={intensity} />
              {steps
                .filter((step) => step === star || step === star - 0.5)
                .map((step) => (
                  <input
                    key={step}
                    type="radio"
                    name={groupName}
                    value={step}
                    checked={selected === step}
                    disabled={disabled}
                    aria-label={`${formatScore(step)} 星`}
                    className={cn(
                      "absolute inset-y-0 m-0 cursor-pointer appearance-none opacity-0",
                      step === star - 0.5 ? "left-0 w-1/2" : allowHalf ? "right-0 w-1/2" : "inset-x-0 w-full",
                    )}
                    onMouseEnter={() => {
                      if (!locked) setPreview(step)
                    }}
                    onFocus={() => {
                      if (!locked) setPreview(step)
                    }}
                    onKeyDown={(event) => {
                      if (locked) event.preventDefault()
                    }}
                    onClick={(event) => {
                      if (locked) event.preventDefault()
                    }}
                    onChange={() => commit(step)}
                  />
                ))}
            </span>
          )
        })}
      </div>
      <span className="min-w-8 text-sm text-muted-foreground tabular-nums">{formatScore(shown)}</span>
    </div>
  )
}

function Star({
  filled,
  half,
  reduced,
  size,
  intensity,
}: {
  filled: boolean
  half: boolean
  reduced: boolean
  size?: number
  intensity?: number
}) {
  const faded = !filled && !(intensity === undefined || intensity === 0.25)
  return (
    <svg
      viewBox="0 0 24 24"
      className={size === undefined ? "size-7" : undefined}
      style={size === undefined ? undefined : { width: size, height: size }}
      aria-hidden
    >
      <path
        d="m12 3.2 2.4 5.2 5.7.7-4.2 3.9 1.1 5.6L12 16.8 6.9 18.6 8 13 3.9 9.1l5.7-.7L12 3.2Z"
        className={cn(
          "fill-current",
          reduced ? "transition-none" : "transition-opacity",
          filled ? "opacity-100" : !faded && "opacity-25",
        )}
        style={faded ? { opacity: intensity } : undefined}
      />
      {half ? (
        <path
          d="m12 3.2 2.4 5.2 5.7.7-4.2 3.9 1.1 5.6L12 16.8 6.9 18.6 8 13 3.9 9.1l5.7-.7L12 3.2Z"
          className="fill-current"
          style={{ clipPath: "inset(0 50% 0 0)" }}
        />
      ) : null}
    </svg>
  )
}

export { PeekRating }
