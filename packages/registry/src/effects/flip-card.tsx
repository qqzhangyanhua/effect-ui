"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface FlipCardProps extends React.HTMLAttributes<HTMLDivElement> {
  front: React.ReactNode
  back: React.ReactNode
  /** 翻转动画时长，毫秒。不传或 500 与原来的 duration-500 相同。 */
  duration?: number
}

function FlipCard({ className, front, back, duration, ...props }: FlipCardProps) {
  const [flipped, setFlipped] = React.useState(false)
  const timed = duration === undefined || duration === 500

  return (
    <div
      data-slot="flip-card"
      className={cn("group [perspective:1200px]", className)}
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
      {...props}
    >
      <div
        className={cn(
          "relative h-full w-full transition-transform motion-reduce:transition-none [transform-style:preserve-3d]",
          timed && "duration-500",
          flipped && "[transform:rotateY(180deg)] motion-reduce:transform-none",
        )}
        style={timed ? undefined : { transitionDuration: `${duration}ms` }}
      >
        <div
          className={cn(
            "absolute inset-0 [backface-visibility:hidden]",
            flipped && "motion-reduce:hidden",
          )}
        >
          {front}
        </div>
        <div
          className={cn(
            "absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] motion-reduce:transform-none",
            !flipped && "motion-reduce:hidden",
          )}
        >
          {back}
        </div>
      </div>
    </div>
  )
}

export { FlipCard }
