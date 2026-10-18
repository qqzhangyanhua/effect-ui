import * as React from "react"

import { cn } from "@/lib/utils"

export interface DotPatternProps extends React.SVGAttributes<SVGSVGElement> {
  width?: number
  height?: number
  cx?: number
  cy?: number
  cr?: number
}

function DotPattern({
  width = 16,
  height = 16,
  cx = 1,
  cy = 1,
  cr = 1,
  className,
  ...props
}: DotPatternProps) {
  const id = React.useId()

  return (
    <svg
      aria-hidden
      data-slot="dot-pattern"
      className={cn(
        "pointer-events-none absolute inset-0 size-full fill-foreground/18",
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
        >
          <circle cx={cx} cy={cy} r={cr} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  )
}

export { DotPattern }
