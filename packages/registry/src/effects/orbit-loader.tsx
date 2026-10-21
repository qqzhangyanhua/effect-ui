import * as React from "react"

import { cn } from "@/lib/utils"

export interface OrbitLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number
  dots?: number
  duration?: number
  delay?: number
  color?: string
}

function OrbitLoader({
  className,
  size = 56,
  dots = 6,
  duration,
  delay,
  color,
  ...props
}: OrbitLoaderProps) {
  const spinMs = duration === undefined || duration === 1400 ? undefined : duration
  const staggerMs = delay === undefined || delay === 80 ? undefined : delay
  return (
    <div
      role="status"
      data-slot="orbit-loader"
      className={cn("relative", className)}
      style={{ width: size, height: size }}
      {...props}
    >
      {Array.from({ length: dots }, (_, index) => {
        const angle = (360 / dots) * index
        return (
          <span
            key={index}
            className={
              color
                ? "absolute top-1/2 left-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full animate-[orbit-spin_1.4s_linear_infinite] motion-reduce:animate-pulse"
                : "absolute top-1/2 left-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary animate-[orbit-spin_1.4s_linear_infinite] motion-reduce:animate-pulse"
            }
            style={{
              transform: `rotate(${angle}deg) translateY(-${size / 2 - 6}px)`,
              animationDelay: staggerMs === undefined ? `${index * 0.08}s` : `${index * staggerMs}ms`,
              opacity: 0.35 + (index / dots) * 0.65,
              ...(spinMs === undefined ? null : { animationDuration: `${spinMs}ms` }),
              ...(color ? { backgroundColor: color } : null),
            }}
          />
        )
      })}
      <span className="sr-only">Loading</span>
    </div>
  )
}

export { OrbitLoader }
