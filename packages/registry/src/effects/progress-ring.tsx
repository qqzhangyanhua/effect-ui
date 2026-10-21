"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface ProgressRingProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  size?: number
  strokeWidth?: number
  duration?: number
  color?: string
}

function ProgressRing({
  value,
  size = 72,
  strokeWidth = 6,
  duration,
  color,
  className,
  ...props
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference

  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      data-slot="progress-ring"
      className={cn("relative inline-grid place-items-center", className)}
      style={{ width: size, height: size }}
      {...props}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-muted"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color ?? "currentColor"}
          className={
            !color && (duration === undefined || duration === 500)
              ? "text-primary transition-[stroke-dashoffset] duration-500 motion-reduce:transition-none"
              : cn(
                  "transition-[stroke-dashoffset] motion-reduce:transition-none",
                  !color && "text-primary",
                  (duration === undefined || duration === 500) && "duration-500",
                )
          }
          style={duration === undefined || duration === 500 ? undefined : { transitionDuration: `${duration}ms` }}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute text-sm font-medium tabular-nums">{value}%</span>
    </div>
  )
}

export { ProgressRing }
