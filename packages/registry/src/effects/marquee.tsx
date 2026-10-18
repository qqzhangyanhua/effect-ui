import * as React from "react"

import { cn } from "@/lib/utils"

export interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  pauseOnHover?: boolean
  reverse?: boolean
  repeat?: number
}

function Marquee({
  className,
  children,
  pauseOnHover = true,
  reverse = false,
  repeat = 2,
  ...props
}: MarqueeProps) {
  return (
    <div
      data-slot="marquee"
      className={cn(
        "flex overflow-hidden [--duration:28s] [--gap:1rem]",
        className,
      )}
      {...props}
    >
      {Array.from({ length: repeat }, (_, index) => (
        <div
          key={index}
          className={cn(
            "flex shrink-0 items-center gap-(--gap) animate-[marquee_var(--duration)_linear_infinite] pr-(--gap)",
            pauseOnHover && "hover:[animation-play-state:paused]",
            reverse && "[animation-direction:reverse]",
          )}
        >
          {children}
        </div>
      ))}
    </div>
  )
}

export { Marquee }
