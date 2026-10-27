"use client"

import { useRef } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface SliceShiftTextProps {
  text?: string
  slices?: number
  intensity?: number
  pace?: number
  className?: string
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

export function SliceShiftText({
  text = "竖着切开，再对齐",
  slices = 8,
  intensity = 0.7,
  pace = 1,
  className,
}: SliceShiftTextProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const count = Math.round(clamp(slices, 4, 14))
  const amp = clamp(intensity, 0, 1)
  const shift = Math.round(amp * 56)
  const rate = rateOf(pace)
  const aligned = reduced || live

  return (
    <div
      ref={ref}
      data-slot="slice-shift-text"
      data-slices={count}
      data-intensity={amp}
      data-pace={pace}
      data-shift={reduced ? 0 : shift}
      data-motion={reduced ? "off" : "on"}
      data-state={aligned ? "aligned" : "waiting"}
      className={cn("relative mx-auto w-full max-w-3xl px-4 py-8 motion-reduce:transform-none", className)}
    >
      <h2 className={cn("font-display text-center text-5xl tracking-tight text-foreground sm:text-6xl", reduced ? "" : "sr-only")}>
        {text}
      </h2>
      {reduced ? null : (
        <div aria-hidden className="relative h-24 sm:h-28">
          <p className="font-display invisible text-center text-5xl tracking-tight sm:text-6xl">{text}</p>
          {Array.from({ length: count }, (_, index) => {
            const left = (index / count) * 100
            const right = 100 - ((index + 1) / count) * 100
            const direction = index % 2 === 0 ? -1 : 1
            return (
              <motion.span
                key={index}
                data-slice={index}
                initial={false}
                animate={{ y: live ? 0 : direction * shift }}
                transition={live ? { duration: 0.72 / rate, delay: (index * 0.035) / rate, ease: [0.22, 1, 0.36, 1] } : { duration: 0 }}
                style={{ clipPath: `inset(0 ${right}% 0 ${left}%)` }}
                className="font-display absolute inset-0 text-center text-5xl tracking-tight text-foreground motion-reduce:translate-y-0 sm:text-6xl"
              >
                {text}
              </motion.span>
            )
          })}
        </div>
      )}
    </div>
  )
}
