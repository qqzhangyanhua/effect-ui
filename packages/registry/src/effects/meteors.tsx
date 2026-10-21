import * as React from "react"

import { cn } from "@/lib/utils"

export interface MeteorsProps extends React.HTMLAttributes<HTMLDivElement> {
  number?: number
  speed?: number
  color?: string
  size?: number
}

function playbackRate(speed: number) {
  return Number.isFinite(speed) && speed > 0 ? speed : 1
}

function Meteors({
  number = 18,
  speed = 1,
  color,
  size = 2,
  className,
  ...props
}: MeteorsProps) {
  const items = Array.from({ length: number }, (_, index) => index)
  const rate = playbackRate(speed)

  return (
    <div
      data-slot="meteors"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      {...props}
    >
      {items.map((index) => {
        const left = (index * 53) % 100
        const delay = `${(index * 0.35) % 4}s`
        const duration = `${(2.4 + (index % 5) * 0.35) / rate}s`
        return (
          <span
            key={index}
            className={cn(
              "absolute top-0 h-0.5 w-0.5 rotate-[215deg] animate-[meteor-fall_3s_linear_infinite] motion-reduce:animate-none rounded-full shadow-[0_0_0_1px_#ffffff10]",
              color === undefined && "bg-foreground",
            )}
            style={{
              left: `${left}%`,
              width: size === 2 ? undefined : size,
              height: size === 2 ? undefined : size,
              animationDelay: delay,
              animationDuration: duration,
              backgroundColor: color,
            }}
          >
            <span
              className={cn(
                "absolute top-1/2 -z-10 h-px w-12 -translate-y-1/2",
                color === undefined && "bg-linear-to-r from-foreground to-transparent",
              )}
              style={{
                width: size === 2 ? undefined : size * 24,
                backgroundImage:
                  color === undefined
                    ? undefined
                    : `linear-gradient(to right, ${color}, transparent)`,
              }}
            />
          </span>
        )
      })}
    </div>
  )
}

export { Meteors }
