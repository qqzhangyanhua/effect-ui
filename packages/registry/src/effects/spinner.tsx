import * as React from "react"

import { cn } from "@/lib/utils"

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number
}

function Spinner({ className, size = 28, ...props }: SpinnerProps) {
  return (
    <div
      role="status"
      data-slot="spinner"
      className={cn(
        "animate-spin motion-reduce:animate-pulse rounded-full border-2 border-muted-foreground/25 border-t-primary",
        className,
      )}
      style={{ width: size, height: size }}
      {...props}
    >
      <span className="sr-only">Loading</span>
    </div>
  )
}

export { Spinner }
