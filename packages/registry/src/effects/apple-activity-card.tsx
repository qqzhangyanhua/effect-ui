"use client"

import { motion } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface ActivityRing {
  label: string
  value: number
  color: string
}

export interface AppleActivityCardProps {
  rings?: ActivityRing[]
  className?: string
}

const defaultRings: ActivityRing[] = [
  { label: "Move", value: 0.72, color: "#fb2c36" },
  { label: "Exercise", value: 0.54, color: "#9ae600" },
  { label: "Stand", value: 0.86, color: "#00d3f2" },
]

function AppleActivityCard({ rings = defaultRings, className }: AppleActivityCardProps) {
  const reduced = usePrefersReducedMotion()
  const size = 168
  const center = size / 2

  return (
    <div className={cn("flex items-center gap-6 rounded-2xl border bg-zinc-950 p-5 text-white", className)}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="活动圆环">
        {rings.map((ring, index) => {
          const radius = 72 - index * 18
          const length = 2 * Math.PI * radius
          return (
            <g key={ring.label}>
              <circle cx={center} cy={center} r={radius} fill="none" stroke={ring.color} strokeOpacity={0.2} strokeWidth={12} />
              <motion.circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={ring.color}
                strokeWidth={12}
                strokeLinecap="round"
                strokeDasharray={length}
                initial={false}
                animate={{ strokeDashoffset: length * (1 - Math.min(Math.max(ring.value, 0), 1)) }}
                transition={reduced ? { duration: 0 } : { duration: 0.8, ease: "easeOut" }}
                transform={`rotate(-90 ${center} ${center})`}
              />
            </g>
          )
        })}
      </svg>
      <ul className="space-y-2 text-sm">
        {rings.map((ring) => (
          <li key={ring.label}>
            <span className="mr-2 inline-block size-2 rounded-full" style={{ background: ring.color }} />
            {ring.label}
            <span className="ml-2 font-mono">{Math.round(ring.value * 100)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export { AppleActivityCard }
