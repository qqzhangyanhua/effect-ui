import * as React from "react"

import { cn } from "@/lib/utils"

export interface LightBeamsProps extends React.HTMLAttributes<HTMLDivElement> {
  beams?: number
}

function LightBeams({ className, beams = 6, ...props }: LightBeamsProps) {
  return (
    <div
      data-slot="light-beams"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
      {...props}
    >
      {Array.from({ length: beams }, (_, index) => (
        <span
          key={index}
          className="absolute top-0 h-[140%] w-px origin-top bg-linear-to-b from-transparent via-primary/50 to-transparent"
          style={{
            left: `${12 + index * (76 / beams)}%`,
            transform: `rotate(${-18 + index * 6}deg)`,
            animation: `beam-rise ${7 + index}s ease-in-out ${index * 0.4}s infinite`,
          }}
        />
      ))}
    </div>
  )
}

export { LightBeams }
