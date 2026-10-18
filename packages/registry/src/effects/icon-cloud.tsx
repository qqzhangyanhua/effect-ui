"use client"

import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export interface IconCloudProps {
  icons: ReactNode[]
  className?: string
}

function IconCloud({ icons, className }: IconCloudProps) {
  const count = icons.length || 1
  return (
    <div className={cn("relative mx-auto size-56 [perspective:800px]", className)}>
      <div className="absolute inset-0 animate-[icon-orbit_18s_linear_infinite] [transform-style:preserve-3d]">
        {icons.map((icon, index) => {
          const phi = Math.acos(-1 + (2 * index) / count)
          const theta = Math.sqrt(count * Math.PI) * phi
          const x = 90 * Math.cos(theta) * Math.sin(phi)
          const y = 90 * Math.sin(theta) * Math.sin(phi)
          const z = 90 * Math.cos(phi)
          return (
            <div
              key={index}
              className="absolute top-1/2 left-1/2 grid size-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border bg-background/80 shadow-sm"
              style={{ transform: `translate3d(${x}px, ${y}px, ${z}px)` }}
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
