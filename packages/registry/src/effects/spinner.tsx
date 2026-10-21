import * as React from "react"

import { cn } from "@/lib/utils"

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number
  duration?: number
  color?: string
}

function Spinner({ className, size = 28, duration, color, ...props }: SpinnerProps) {
  const spinMs = duration === undefined || duration === 1000 ? undefined : duration
  return (
    <div
      role="status"
      data-slot="spinner"
      className={cn(
        "animate-spin motion-reduce:animate-pulse rounded-full border-2 border-muted-foreground/25",
        !color && "border-t-primary",
        className,
      )}
      style={{
        width: size,
        height: size,
        ...(spinMs === undefined ? null : { animationDuration: `${spinMs}ms` }),
        ...(color ? { borderTopColor: color } : null),
      }}
      {...props}
    >
      <span className="sr-only">Loading</span>
    </div>
  )
}

export { Spinner }
