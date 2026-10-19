import * as React from "react"

import { cn } from "@/lib/utils"

export type ShimmerTextProps = React.HTMLAttributes<HTMLSpanElement>

function ShimmerText({ className, children, ...props }: ShimmerTextProps) {
  return (
    <span
      data-slot="shimmer-text"
      className={cn(
        "inline-flex animate-[shimmer-sweep_2.4s_linear_infinite] bg-linear-to-r from-muted-foreground/40 via-foreground to-muted-foreground/40 bg-size-[200%_100%] bg-clip-text text-transparent motion-reduce:animate-none",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}

export { ShimmerText }
