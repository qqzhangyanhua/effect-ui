import * as React from "react"

import { cn } from "@/lib/utils"

export interface ShineBorderProps extends React.HTMLAttributes<HTMLDivElement> {
  shineColor?: string
  /** 旋转周期，秒。不传则 10。 */
  duration?: number
  /** 描边厚度，像素。不传或 1 与原来的 1px 相同。 */
  size?: number
  /** 高光弧宽度倍率。不传或 1 仍是 12% 到 28%。 */
  intensity?: number
}

function ShineBorder({
  className,
  children,
  shineColor = "var(--primary)",
  duration = 10,
  size,
  intensity,
  ...props
}: ShineBorderProps) {
  const width = size === undefined || size === 1 ? 1 : size
  const gain = intensity === undefined || intensity === 1 ? 1 : intensity
  return (
    <div
      data-slot="shine-border"
      className={cn(
        "relative overflow-hidden rounded-xl border bg-card p-6 text-card-foreground",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] animate-[shine-spin_linear_infinite] motion-reduce:animate-none"
        style={{
          padding: width,
          background:
            gain === 1
              ? `conic-gradient(from var(--shine-angle), transparent 0%, ${shineColor} 12%, transparent 28%)`
              : `conic-gradient(from var(--shine-angle), transparent 0%, ${shineColor} ${12 * gain}%, transparent ${28 * gain}%)`,
          animationDuration: `${duration}s`,
          mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          maskComposite: "exclude",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

export { ShineBorder }
