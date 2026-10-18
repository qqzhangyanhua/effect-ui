import * as React from "react"

import { cn } from "@/lib/utils"

export interface GlobeSphereProps extends React.HTMLAttributes<HTMLDivElement> {
  dots?: number
}

function GlobeSphere({ className, dots = 48, ...props }: GlobeSphereProps) {
  return (
    <div
      data-slot="globe-sphere"
      className={cn(
        "relative grid size-48 place-items-center rounded-full border bg-[radial-gradient(circle_at_30%_25%,color-mix(in_oklab,var(--primary)_28%,transparent),transparent_55%)]",
        className,
      )}
      {...props}
    >
      <div className="absolute inset-3 animate-[globe-spin_16s_linear_infinite] rounded-full border border-dashed border-foreground/20" />
      {Array.from({ length: dots }, (_, index) => {
        const lat = ((index * 47) % 160) - 80
        const lon = (index * 77) % 360
        return (
          <span
            key={index}
            className="absolute size-1 rounded-full bg-primary/70"
            style={{
              transform: `rotateX(${lat}deg) rotateY(${lon}deg) translateZ(84px)`,
            }}
          />
        )
      })}
    </div>
  )
}

export { GlobeSphere }
