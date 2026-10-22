"use client"

// Ported from daisyUI（MIT，(c) 2020 Pouya Saadeghi）— https://github.com/saadeghi/daisyui/blob/main/packages/daisyui/src/components/range.css. Modified for effect-ui.

import { useState, type InputHTMLAttributes } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface TickRangeProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  ticks?: number
  onValueChange?: (value: number) => void
}

const rules = `
[data-slot="tick-range"] {
  container-type: inline-size;
  appearance: none;
  overflow: hidden;
  height: 1.25rem;
  background: transparent;
  --range-dir: 1;
}
[dir="rtl"] [data-slot="tick-range"] { --range-dir: -1; }
[data-slot="tick-range"]::-webkit-slider-runnable-track {
  height: 0.45rem;
  border-radius: 999px;
  background: color-mix(in oklab, currentColor 14%, transparent);
}
[data-slot="tick-range"]::-webkit-slider-thumb {
  appearance: none;
  width: 1.25rem;
  height: 1.25rem;
  margin-top: -0.4rem;
  border-radius: 0.4rem;
  border: 0.2rem solid var(--primary);
  background: var(--background);
  box-shadow: calc(var(--range-dir, 1) * -100cqw) 0 0 100cqw var(--primary);
}
[data-slot="tick-range"]::-moz-range-track {
  height: 0.45rem;
  border-radius: 999px;
  background: color-mix(in oklab, currentColor 14%, transparent);
}
[data-slot="tick-range"]::-moz-range-thumb {
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 0.4rem;
  border: 0.2rem solid var(--primary);
  background: var(--background);
  box-shadow: calc(var(--range-dir, 1) * -100cqw) 0 0 100cqw var(--primary);
}
[data-slot="tick-range"]:focus-visible { outline: 2px solid var(--ring); outline-offset: 2px; }
`

export function TickRange({ ticks = 0, onValueChange, className, value, defaultValue, min = 0, max = 100, ...props }: TickRangeProps) {
  const reduced = usePrefersReducedMotion()
  const [uncontrolled, setUncontrolled] = useState(Number(defaultValue ?? min))
  const current = Number(value ?? uncontrolled)
  const low = Number(min)
  const high = Number(max)
  const span = high - low || 1
  const fill = Math.min(1, Math.max(0, (current - low) / span))
  const count = Math.max(0, ticks)
  const marks = Array.from({ length: count }, (_, index) => (count === 1 ? 0 : index / (count - 1)))

  return (
    <div className={cn("relative grid w-full max-w-xs gap-1", className)} data-reduced={reduced ? "true" : "false"} data-slot="tick-range-field">
      <style>{rules}</style>
      <input
        {...props}
        className="w-full cursor-pointer"
        data-slot="tick-range"
        max={max}
        min={min}
        style={{ ["--range-fill" as string]: String(fill), transition: reduced ? "none" : undefined }}
        type="range"
        value={value !== undefined ? Number(value) : undefined}
        defaultValue={value === undefined ? Number(defaultValue ?? min) : undefined}
        onChange={(event) => {
          props.onChange?.(event)
          const next = Number(event.target.value)
          if (value === undefined) setUncontrolled(next)
          onValueChange?.(next)
        }}
      />
      {count > 0 ? (
        <div aria-hidden className="relative mx-[0.625rem] h-2" data-part="ticks" data-count={count}>
          {marks.map((mark) => (
            <span key={mark} className="absolute top-0 size-1 -translate-x-1/2 rounded-full bg-muted-foreground" data-part="tick" style={{ left: `${mark * 100}%` }} />
          ))}
        </div>
      ) : null}
    </div>
  )
}
