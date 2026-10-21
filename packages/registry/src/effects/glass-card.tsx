import * as React from "react"

import { cn } from "@/lib/utils"

export type GlassCardProps = React.HTMLAttributes<HTMLDivElement> & {
  /** 玻璃叠色倍率。不传或 1 仍是白 8% 底和 15% 边。 */
  intensity?: number
  /** 背景模糊，像素。不传或 24 仍是 backdrop-blur-xl。 */
  size?: number
}

function GlassCard({ className, children, intensity, size, style, ...props }: GlassCardProps) {
  const glass = intensity === undefined || intensity === 1
  const blur = size === undefined || size === 24
  return (
    <div
      data-slot="glass-card"
      className={cn(
        "relative overflow-hidden rounded-2xl border p-6 text-foreground shadow-[inset_0_1px_0_0_rgba(255,255,255,0.18)]",
        glass && "border-white/15 bg-white/8 dark:bg-white/6",
        blur && "backdrop-blur-xl",
        className,
      )}
      style={
        glass && blur
          ? style
          : {
              ...style,
              ...(glass
                ? {}
                : {
                    backgroundColor: `rgb(255 255 255 / ${0.08 * intensity})`,
                    borderColor: `rgb(255 255 255 / ${0.15 * intensity})`,
                  }),
              ...(blur ? {} : { backdropFilter: `blur(${size}px)` }),
            }
      }
      {...props}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/50 to-transparent"
      />
      {children}
    </div>
  )
}

export { GlassCard }
