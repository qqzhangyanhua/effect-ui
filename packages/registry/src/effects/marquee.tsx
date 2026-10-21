import * as React from "react"

import { cn } from "@/lib/utils"

export interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  pauseOnHover?: boolean
  reverse?: boolean
  repeat?: number
  duration?: number
  gap?: number
}

function Marquee({
  className,
  children,
  pauseOnHover = true,
  reverse = false,
  repeat = 2,
  duration,
  gap,
  ...props
}: MarqueeProps) {
  const durationToken =
    duration === undefined || duration === 28000 ? "[--duration:28s]" : `[--duration:${duration}ms]`
  const gapToken = gap === undefined || gap === 16 ? "[--gap:1rem]" : `[--gap:${gap}px]`
  const track =
    durationToken === "[--duration:28s]" && gapToken === "[--gap:1rem]"
      ? "flex overflow-hidden [--duration:28s] [--gap:1rem]"
      : `flex overflow-hidden ${durationToken} ${gapToken}`

  return (
    <div data-slot="marquee" className={cn(track, className)} {...props}>
      {Array.from({ length: repeat }, (_, index) => (
        <div
          key={index}
          className={cn(
            "flex shrink-0 items-center gap-(--gap) animate-[marquee_var(--duration)_linear_infinite] motion-reduce:animate-none pr-(--gap)",
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
