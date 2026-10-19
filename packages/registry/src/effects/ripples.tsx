import * as React from "react"

import { cn } from "@/lib/utils"

export interface RipplesProps extends React.HTMLAttributes<HTMLDivElement> {
  rings?: number
}

function Ripples({ rings = 4, className, ...props }: RipplesProps) {
  return (
    <div
      data-slot="ripples"
      className={cn(
        "pointer-events-none absolute inset-0 grid place-items-center overflow-hidden",
        className,
      )}
      {...props}
    >
      {Array.from({ length: rings }, (_, index) => (
        <span
          key={index}
          className="absolute aspect-square rounded-full border border-foreground/20 motion-reduce:animate-none!"
          style={{
            width: `${28 + index * 22}%`,
            animation: `ripple-pulse 3.6s ease-out ${index * 0.45}s infinite`,
          }}
        />
      ))}
    </div>
  )
}

export { Ripples }
