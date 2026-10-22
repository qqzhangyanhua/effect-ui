"use client"

// Ported from Spectrum UI (Apache-2.0, (c) Spectrum UI / arihantcodes) — https://github.com/arihantcodes/spectrum-ui/blob/main/app/registry/star-rating/star-rating.tsx. Modified for effect-ui.

import { motion } from "motion/react"
import { useCallback, useRef, useState, type KeyboardEvent } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface StarRatingProps {
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  max?: number
  size?: "sm" | "md" | "lg"
  allowClear?: boolean
  readOnly?: boolean
  showValue?: boolean
  label?: string
  color?: string
  className?: string
}

const SIZES = {
  sm: { icon: 16, pad: "p-1", text: "text-xs" },
  md: { icon: 22, pad: "p-0.5", text: "text-sm" },
  lg: { icon: 28, pad: "p-0.5", text: "text-sm" },
} as const

const STAR_PATH = "M12 2L14.65 8.36L21.51 8.91L16.28 13.39L17.88 20.09L12 16.5L6.12 20.09L7.72 13.39L2.49 8.91L9.35 8.36Z"

function formatValue(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

function Star({ size, filled = false, className }: { size: number; filled?: boolean; className?: string }) {
  return (
    <svg aria-hidden className={cn("block", className)} fill={filled ? "currentColor" : "none"} height={size} stroke="currentColor" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width={size}>
      <path d={STAR_PATH} />
    </svg>
  )
}

export function StarRating({
  value: valueProp,
  defaultValue = 0,
  onValueChange,
  max = 5,
  size = "md",
  allowClear = true,
  readOnly = false,
  showValue = false,
  label = "评分",
  color = "var(--primary)",
  className,
}: StarRatingProps) {
  const reduced = usePrefersReducedMotion()
  const [internal, setInternal] = useState(defaultValue)
  const [hovered, setHovered] = useState<number | null>(null)
  const [burst, setBurst] = useState<{ key: number; index: number } | null>(null)
  const starRefs = useRef<Array<HTMLButtonElement | null>>([])
  const value = valueProp ?? internal
  const metrics = SIZES[size]
  const preview = !readOnly && hovered !== null ? hovered : value
  const commit = useCallback(
    (next: number) => {
      if (valueProp === undefined) setInternal(next)
      onValueChange?.(next)
    },
    [onValueChange, valueProp],
  )

  const select = (starValue: number) => {
    const next = allowClear && starValue === value ? 0 : starValue
    commit(next)
    if (next > 0 && !reduced) setBurst((previous) => ({ key: (previous?.key ?? 0) + 1, index: starValue - 1 }))
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    let next = value
    if (event.key === "ArrowRight" || event.key === "ArrowUp") next = Math.min(value + 1, max)
    else if (event.key === "ArrowLeft" || event.key === "ArrowDown") next = Math.max(value - 1, 1)
    else if (event.key === "Home") next = 1
    else if (event.key === "End") next = max
    else return
    event.preventDefault()
    if (next !== value) commit(next)
    starRefs.current[next - 1]?.focus()
  }

  const focusIndex = value >= 1 && value <= max ? Math.round(value) - 1 : 0

  return (
    <div
      aria-label={readOnly ? `${label}: ${formatValue(value)} / ${max}` : label}
      className={cn("inline-flex items-center select-none", className)}
      data-reduced={reduced ? "true" : "false"}
      data-slot="star-rating"
      onKeyDown={readOnly ? undefined : onKeyDown}
      onPointerLeave={readOnly ? undefined : () => setHovered(null)}
      role={readOnly ? "img" : "radiogroup"}
    >
      <div className="flex items-center" style={{ color }}>
        {Array.from({ length: max }, (_, index) => {
          const starValue = index + 1
          if (readOnly) {
            const fill = Math.max(0, Math.min(1, value - index)) * 100
            return (
              <span key={starValue} className={cn("relative block", metrics.pad)}>
                <span className="relative block text-muted-foreground" style={{ width: metrics.icon, height: metrics.icon }}>
                  <Star size={metrics.icon} />
                  {fill > 0 ? (
                    <span className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - fill}% 0 0)` }}>
                      <Star filled size={metrics.icon} />
                    </span>
                  ) : null}
                </span>
              </span>
            )
          }
          const filled = starValue <= preview
          const distance = hovered === null ? 99 : Math.abs(index + 1 - hovered)
          const scale = reduced || hovered === null ? 1 : distance === 0 ? 1.2 : distance === 1 ? 1.08 : 1
          const bursting = burst?.index === index
          return (
            <button
              key={starValue}
              ref={(node) => {
                starRefs.current[index] = node
              }}
              aria-checked={starValue === value}
              aria-label={`${starValue} 星`}
              className={cn("relative rounded-md outline-hidden focus-visible:ring-1 focus-visible:ring-ring", metrics.pad)}
              role="radio"
              tabIndex={index === focusIndex ? 0 : -1}
              type="button"
              onClick={() => select(starValue)}
              onPointerEnter={(event) => {
                if (event.pointerType === "mouse") setHovered(starValue)
              }}
            >
              <motion.span
                animate={bursting && !reduced ? { scale: [1, 0.7, 1.3, 1] } : { scale }}
                className="relative block"
                initial={false}
                style={{ width: metrics.icon, height: metrics.icon }}
                transition={reduced || bursting ? { duration: reduced ? 0 : 0.45 } : { type: "spring", stiffness: 500, damping: 30 }}
              >
                <Star className="text-muted-foreground" size={metrics.icon} />
                <motion.span animate={{ scale: filled ? 1 : 0, opacity: filled ? 1 : 0 }} className="absolute inset-0" initial={false} transition={{ duration: reduced ? 0 : filled ? 0.2 : 0.15 }}>
                  <Star filled size={metrics.icon} />
                </motion.span>
              </motion.span>
            </button>
          )
        })}
      </div>
      {showValue ? (
        <span aria-hidden className={cn("ml-2 inline-flex font-medium text-muted-foreground tabular-nums", metrics.text)}>
          <span>{formatValue(preview)}</span>
          <span>/{max}</span>
        </span>
      ) : null}
    </div>
  )
}
