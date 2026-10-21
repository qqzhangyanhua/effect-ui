"use client"

import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export interface IconCloudProps {
  icons: ReactNode[]
  className?: string
  duration?: number
  size?: number
  scale?: number
}

function IconCloud({ icons, className, duration, size, scale }: IconCloudProps) {
  const count = icons.length || 1
  const radius = size === undefined || size === 90 ? 90 : size
  const chip =
    scale === undefined || scale === 1 ? 36 : 36 * scale
  const spin =
    duration === undefined || duration === 18000
      ? "absolute inset-0 animate-[icon-orbit_18s_linear_infinite] motion-reduce:animate-none [transform-style:preserve-3d]"
      : `absolute inset-0 animate-[icon-orbit_${duration}ms_linear_infinite] motion-reduce:animate-none [transform-style:preserve-3d]`

  return (
    <div className={cn("relative mx-auto size-56 [perspective:800px]", className)}>
      <div className={spin}>
        {icons.map((icon, index) => {
          const phi = Math.acos(-1 + (2 * index) / count)
          const theta = Math.sqrt(count * Math.PI) * phi
          const x = radius * Math.cos(theta) * Math.sin(phi)
          const y = radius * Math.sin(theta) * Math.sin(phi)
          const z = radius * Math.cos(phi)
          return (
            <div
              key={index}
              className={
                scale === undefined || scale === 1
                  ? "absolute top-1/2 left-1/2 grid size-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border bg-background/80 shadow-sm"
                  : "absolute top-1/2 left-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border bg-background/80 shadow-sm"
              }
              style={{
                transform: `translate3d(${x}px, ${y}px, ${z}px)`,
                ...(scale === undefined || scale === 1 ? {} : { width: chip, height: chip }),
              }}
            >
              {icon}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export { IconCloud }
