"use client"

import * as React from "react"
import { motion } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface PulseHeartProps {
  active?: boolean
  defaultActive?: boolean
  onActiveChange?: (active: boolean) => void
  size?: number
  color?: string
  burst?: number
  duration?: number
  scale?: number
  disabled?: boolean
  className?: string
  ref?: React.Ref<HTMLButtonElement>
  "aria-label"?: string
}

function PulseHeart({
  active,
  defaultActive = false,
  onActiveChange,
  size = 28,
  color,
  burst = 8,
  duration,
  scale,
  disabled = false,
  className,
  ref,
  "aria-label": ariaLabel = "喜欢",
}: PulseHeartProps) {
  const reduced = usePrefersReducedMotion()
  const [uncontrolled, setUncontrolled] = React.useState(defaultActive)
  const [burstId, setBurstId] = React.useState(0)
  const on = active ?? uncontrolled
  const count = Math.max(0, Math.round(burst))

  const toggle = () => {
    if (disabled) return
    const next = !on
    if (active === undefined) setUncontrolled(next)
    if (next && !reduced) setBurstId((id) => id + 1)
    onActiveChange?.(next)
  }

  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled}
      aria-pressed={on}
      aria-label={ariaLabel}
      data-slot="pulse-heart"
      className={cn("relative rounded-full", className)}
      style={{ width: size + 16, height: size + 16, color }}
      onClick={toggle}
    >
      <motion.svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        aria-hidden
        initial={false}
        animate={
          reduced || burstId === 0
            ? { scale: 1 }
            : { scale: scale === undefined || scale === 1 ? [1, 1.22, 1] : [1, 1 + 0.22 * scale, 1] }
        }
        transition={{ duration: reduced ? 0 : duration === undefined || duration === 350 ? 0.35 : duration / 1000 }}
      >
        <path
          d="M12 20s-7-4.4-7-9a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 4.6-7 9-7 9z"
          fill={on ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </motion.svg>
      {burstId > 0 && !reduced
        ? Array.from({ length: count }, (_, index) => {
            const angle = (Math.PI * 2 * index) / Math.max(count, 1)
            return (
              <motion.span
                key={`${burstId}-${index}`}
                aria-hidden
                className="pointer-events-none absolute size-1 rounded-full bg-current"
                initial={{ opacity: 1, x: 0, y: 0 }}
                animate={{
                  opacity: 0,
                  x: Math.cos(angle) * size * 0.8,
                  y: Math.sin(angle) * size * 0.8,
                }}
                transition={{ duration: 0.45 }}
              />
            )
          })
        : null}
    </button>
  )
}

export { PulseHeart }
