import * as React from "react"

import { cn } from "@/lib/utils"

export interface DotsLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  count?: number
  size?: number
  gap?: number
  duration?: number
  delay?: number
  color?: string
}

function DotsLoader({ className, count, size, gap, duration, delay, color, ...props }: DotsLoaderProps) {
  const total = count === undefined || count === 3 ? 3 : count
  const keepSize = size === undefined || size === 8
  const dot = size === undefined || size === 8 ? undefined : size
  const spinMs = duration === undefined || duration === 900 ? undefined : duration
  const staggerMs = delay === undefined || delay === 120 ? undefined : delay
  return (
    <div
      role="status"
      data-slot="dots-loader"
      className={cn(gap === undefined || gap === 6 ? "flex items-center gap-1.5" : "flex items-center", className)}
      style={gap === undefined || gap === 6 ? undefined : { gap }}
      {...props}
    >
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          className={
            keepSize && !color
              ? "size-2 rounded-full bg-primary animate-[dot-bounce_0.9s_ease-in-out_infinite] motion-reduce:animate-pulse"
              : cn(
                  "rounded-full animate-[dot-bounce_0.9s_ease-in-out_infinite] motion-reduce:animate-pulse",
                  keepSize && "size-2",
                  !color && "bg-primary",
                )
          }
          style={{
            animationDelay: staggerMs === undefined ? `${index * 0.12}s` : `${index * staggerMs}ms`,
            ...(dot === undefined ? null : { width: dot, height: dot }),
            ...(spinMs === undefined ? null : { animationDuration: `${spinMs}ms` }),
            ...(color ? { backgroundColor: color } : null),
          }}
        />
      ))}
      <span className="sr-only">Loading</span>
    </div>
  )
}

export { DotsLoader }
