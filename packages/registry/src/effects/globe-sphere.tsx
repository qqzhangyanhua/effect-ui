import * as React from "react"

import { cn } from "@/lib/utils"

export interface GlobeSphereProps extends React.HTMLAttributes<HTMLDivElement> {
  dots?: number
  duration?: number
  size?: number
  color?: string
}

function GlobeSphere({ className, dots = 48, duration, size, color, style, ...props }: GlobeSphereProps) {
  const box = size === undefined || size === 192
  const spin =
    duration === undefined || duration === 16000
      ? "absolute inset-3 animate-[globe-spin_16s_linear_infinite] motion-reduce:animate-none rounded-full border border-dashed border-foreground/20"
      : `absolute inset-3 animate-[globe-spin_${duration}ms_linear_infinite] motion-reduce:animate-none rounded-full border border-dashed border-foreground/20`
  const depth = size === undefined || size === 192 ? 84 : (84 * size) / 192

  return (
    <div
      data-slot="globe-sphere"
      className={cn(
        box
          ? "relative grid size-48 place-items-center rounded-full border bg-[radial-gradient(circle_at_30%_25%,color-mix(in_oklab,var(--primary)_28%,transparent),transparent_55%)]"
          : "relative grid place-items-center rounded-full border bg-[radial-gradient(circle_at_30%_25%,color-mix(in_oklab,var(--primary)_28%,transparent),transparent_55%)]",
        className,
      )}
      {...props}
      style={box ? style : { ...style, width: size, height: size }}
    >
      <div className={spin} />
      {Array.from({ length: dots }, (_, index) => {
        const lat = ((index * 47) % 160) - 80
        const lon = (index * 77) % 360
        return (
          <span
            key={index}
            className={color ? "absolute size-1 rounded-full" : "absolute size-1 rounded-full bg-primary/70"}
            style={{
              transform: `rotateX(${lat}deg) rotateY(${lon}deg) translateZ(${depth}px)`,
              ...(color ? { backgroundColor: color } : {}),
            }}
          />
        )
      })}
    </div>
  )
}

export { GlobeSphere }
