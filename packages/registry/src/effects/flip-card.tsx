"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface FlipCardProps extends React.HTMLAttributes<HTMLDivElement> {
  front: React.ReactNode
  back: React.ReactNode
}

function FlipCard({ className, front, back, ...props }: FlipCardProps) {
  const [flipped, setFlipped] = React.useState(false)

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
          "relative h-full w-full transition-transform duration-500 motion-reduce:transition-none [transform-style:preserve-3d]",
          flipped && "[transform:rotateY(180deg)] motion-reduce:transform-none",
        )}
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
