import * as React from "react"

import { cn } from "@/lib/utils"

export interface AnimatedGridProps extends React.SVGAttributes<SVGSVGElement> {
  cell?: number
}

function AnimatedGrid({ className, cell = 36, ...props }: AnimatedGridProps) {
  const id = React.useId()
  return (
    <svg
      aria-hidden
      data-slot="animated-grid"
      className={cn(
        "pointer-events-none absolute inset-0 size-full stroke-foreground/15",
        className,
      )}
      {...props}
    >
      <defs>
        <pattern id={id} width={cell} height={cell} patternUnits="userSpaceOnUse">
          <path d={`M ${cell} 0 L 0 0 0 ${cell}`} fill="none" />
        </pattern>
      </defs>
      <rect
        width="100%"
        height="100%"
        fill={`url(#${id})`}
        className="animate-[grid-drift_12s_linear_infinite] motion-reduce:animate-none"
      />
    </svg>
  )
}

export { AnimatedGrid }
