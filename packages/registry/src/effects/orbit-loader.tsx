import * as React from "react"

import { cn } from "@/lib/utils"

export interface OrbitLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number
  dots?: number
}

function OrbitLoader({
  className,
  size = 56,
  dots = 6,
  ...props
}: OrbitLoaderProps) {
  return (
    <div
      role="status"
      data-slot="orbit-loader"
      className={cn("relative", className)}
      style={{ width: size, height: size }}
      {...props}
    >
      {Array.from({ length: dots }, (_, index) => {
        const angle = (360 / dots) * index
        return (
          <span
            key={index}
            className="absolute top-1/2 left-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary animate-[orbit-spin_1.4s_linear_infinite] motion-reduce:animate-pulse"
            style={{
              transform: `rotate(${angle}deg) translateY(-${size / 2 - 6}px)`,
              animationDelay: `${index * 0.08}s`,
              opacity: 0.35 + (index / dots) * 0.65,
            }}
          />
        )
      })}
      <span className="sr-only">Loading</span>
    </div>
  )
}

export { OrbitLoader }
