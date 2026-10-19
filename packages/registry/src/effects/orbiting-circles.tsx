import * as React from "react"

import { cn } from "@/lib/utils"

export interface OrbitingCirclesProps extends React.HTMLAttributes<HTMLDivElement> {
  radius?: number
  duration?: number
}

function OrbitingCircles({
  className,
  children,
  radius = 80,
  duration = 12,
  ...props
}: OrbitingCirclesProps) {
  const items = React.Children.toArray(children)

  return (
    <div
      data-slot="orbiting-circles"
      className={cn("relative size-52", className)}
      {...props}
    >
      <span
        className="absolute inset-0 rounded-full border border-dashed border-border"
        style={{ margin: `calc(50% - ${radius}px)` }}
      />
      {items.map((child, index) => (
        <span
          key={index}
          className="absolute top-1/2 left-1/2 size-8 -translate-x-1/2 -translate-y-1/2 animate-[orbit-path_linear_infinite] motion-reduce:animate-none"
          style={{
            animationDuration: `${duration}s`,
            animationDelay: `${(-index * duration) / items.length}s`,
            ["--orbit-radius" as string]: `${radius}px`,
          }}
        >
          {child}
        </span>
      ))}
    </div>
  )
}

export { OrbitingCircles }
