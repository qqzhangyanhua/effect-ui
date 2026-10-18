import * as React from "react"

import { cn } from "@/lib/utils"

export interface GridPatternProps extends React.SVGAttributes<SVGSVGElement> {
  width?: number
  height?: number
  x?: number
  y?: number
  strokeDasharray?: string
}

function GridPattern({
  width = 40,
  height = 40,
  x = -1,
  y = -1,
  strokeDasharray = "0",
  className,
  ...props
}: GridPatternProps) {
  const id = React.useId()

  return (
    <svg
      aria-hidden
      data-slot="grid-pattern"
      className={cn(
        "pointer-events-none absolute inset-0 size-full fill-none stroke-foreground/12",
        className,
      )}
      {...props}
    >
      <defs>
        <pattern
          id={id}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path
            d={`M.5 ${height}V.5H${width}`}
            fill="none"
            strokeDasharray={strokeDasharray}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${id})`} />
    </svg>
  )
}

export { GridPattern }
