import * as React from "react"

import { cn } from "@/lib/utils"

export interface MeteorsProps extends React.HTMLAttributes<HTMLDivElement> {
  number?: number
}

function Meteors({ number = 18, className, ...props }: MeteorsProps) {
  const items = Array.from({ length: number }, (_, index) => index)

  return (
    <div
      data-slot="meteors"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      {...props}
    >
      {items.map((index) => {
        const left = (index * 53) % 100
        const delay = `${(index * 0.35) % 4}s`
        const duration = `${2.4 + (index % 5) * 0.35}s`
        return (
          <span
            key={index}
            className="absolute top-0 h-0.5 w-0.5 rotate-[215deg] animate-[meteor-fall_3s_linear_infinite] motion-reduce:animate-none rounded-full bg-foreground shadow-[0_0_0_1px_#ffffff10]"
            style={{
              left: `${left}%`,
              animationDelay: delay,
              animationDuration: duration,
            }}
          >
            <span className="absolute top-1/2 -z-10 h-px w-12 -translate-y-1/2 bg-linear-to-r from-foreground to-transparent" />
          </span>
        )
      })}
    </div>
  )
}

export { Meteors }
