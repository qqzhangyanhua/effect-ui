"use client"

import * as React from "react"
import { motion, useSpring, useTransform } from "motion/react"

import { NumberFlow } from "@/components/ui/number-flow"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface GaugeSegment {
  until: number
  color: string
}

export interface RadialGaugeProps {
  value?: number
  min?: number
  max?: number
  variant?: "semi" | "three-quarter"
  segments?: GaugeSegment[]
  thresholds?: number[]
  className?: string
}

const DEFAULT_SEGMENTS: GaugeSegment[] = [
  { until: 60, color: "#34d399" },
  { until: 85, color: "#fbbf24" },
  { until: 100, color: "#fb7185" },
]

function point(cx: number, cy: number, radius: number, angle: number) {
  return [cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius]
}

function arcPath(cx: number, cy: number, radius: number, start: number, end: number) {
  const [x1, y1] = point(cx, cy, radius, start)
  const [x2, y2] = point(cx, cy, radius, end)
  const large = end - start > Math.PI ? 1 : 0
  return `M ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2}`
}

function RadialGauge({
  value = 42,
  min = 0,
  max = 100,
  variant = "semi",
  segments = DEFAULT_SEGMENTS,
  thresholds = [80],
  className,
}: RadialGaugeProps) {
  const reduced = usePrefersReducedMotion()
  const sweep = variant === "three-quarter" ? Math.PI * 1.5 : Math.PI
  const start = variant === "three-quarter" ? Math.PI * 0.75 : Math.PI
  const ratio = Math.min(1, Math.max(0, (value - min) / Math.max(max - min, 1)))
  const angle = start + sweep * ratio
  const spring = useSpring(angle, { stiffness: reduced ? 400 : 120, damping: reduced ? 40 : 16 })

  React.useEffect(() => {
    if (reduced) spring.jump(angle)
    else spring.set(angle)
  }, [angle, reduced, spring])

  const x2 = useTransform(spring, (next) => point(100, 108, 58, next)[0] ?? 100)
  const y2 = useTransform(spring, (next) => point(100, 108, 58, next)[1] ?? 108)
  const color = segments.find((segment) => value <= segment.until)?.color ?? segments.at(-1)?.color ?? "#34d399"
  const span = Math.max(max - min, 1)
  const bands = segments.map((segment, index) => {
    const previous = index === 0 ? min : (segments[index - 1]?.until ?? min)
    return {
      ...segment,
      from: (previous - min) / span,
      to: (Math.min(segment.until, max) - min) / span,
    }
  })

  return (
    <div data-slot="radial-gauge" className={cn("w-56", className)}>
      <svg viewBox="0 0 200 150" className="w-full" role="meter" aria-valuenow={value} aria-valuemin={min} aria-valuemax={max} aria-label="仪表">
        {bands.map((segment) => (
          <path key={segment.until} d={arcPath(100, 108, 70, start + sweep * segment.from, start + sweep * segment.to)} fill="none" stroke={segment.color} strokeOpacity="0.35" strokeWidth="12" strokeLinecap="butt" />
        ))}
        <path d={arcPath(100, 108, 70, start, start + sweep * ratio)} fill="none" stroke={color} strokeWidth="12" strokeLinecap="round" />
        {thresholds.map((mark) => {
          const markAngle = start + sweep * ((mark - min) / Math.max(max - min, 1))
          const [x1, y1] = point(100, 108, 60, markAngle)
          const [mx, my] = point(100, 108, 80, markAngle)
          return <line key={mark} x1={x1} y1={y1} x2={mx} y2={my} stroke="currentColor" strokeWidth="2" />
        })}
        <motion.line x1={100} y1={108} x2={x2} y2={y2} stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <circle cx="100" cy="108" r="4" fill="currentColor" />
      </svg>
      <div className="-mt-8 text-center text-3xl">
        <NumberFlow value={value} />
      </div>
    </div>
  )
}

export { RadialGauge }
