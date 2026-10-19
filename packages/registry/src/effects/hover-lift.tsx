import * as React from "react"

import { cn } from "@/lib/utils"

export type HoverLiftProps = React.HTMLAttributes<HTMLDivElement>

function HoverLift({ className, children, ...props }: HoverLiftProps) {
  return (
    <div
      data-slot="hover-lift"
      className={cn(
        "rounded-xl border bg-card p-6 text-card-foreground shadow-sm transition-all duration-300 hover:-translate-y-1.5 motion-reduce:hover:translate-y-0 hover:shadow-xl",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export { HoverLift }
