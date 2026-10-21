import * as React from "react"

import { cn } from "@/lib/utils"

export type HoverLiftProps = React.HTMLAttributes<HTMLDivElement> & {
  /** 过渡时长，毫秒。不传或 300 与原来的 duration-300 相同。 */
  duration?: number
  /** 上浮距离倍率。不传或 1 仍是 6px。 */
  intensity?: number
}

function HoverLift({ className, children, duration, intensity, style, ...props }: HoverLiftProps) {
  const timed = duration === undefined || duration === 300
  const lifted = intensity === undefined || intensity === 1
  const canonical = timed && lifted
  return (
    <div
      data-slot="hover-lift"
      className={cn(
        "rounded-xl border bg-card p-6 text-card-foreground shadow-sm transition-all motion-reduce:hover:translate-y-0 hover:shadow-xl",
        canonical && "duration-300 hover:-translate-y-1.5",
        !canonical && "hover:-translate-y-[var(--lift)]",
        className,
      )}
      style={
        canonical
          ? style
          : ({
              ...style,
              transitionDuration: `${timed ? 300 : duration}ms`,
              "--lift": `${6 * (lifted ? 1 : intensity)}px`,
            } as React.CSSProperties)
      }
      {...props}
    >
      {children}
    </div>
  )
}

export { HoverLift }
