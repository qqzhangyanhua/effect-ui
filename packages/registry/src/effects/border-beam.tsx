import * as React from "react"

import { cn } from "@/lib/utils"

export interface BorderBeamProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 旋转周期，秒。不传则 8。 */
  duration?: number
  colorFrom?: string
  colorTo?: string
  /** 描边厚度，像素。不传或 1 与原来的 1px 相同。 */
  size?: number
  /** 光束宽度倍率。不传或 1 仍是透明 30% 到 70%。 */
  intensity?: number
}

function BorderBeam({
  className,
  children,
  duration = 8,
  colorFrom = "var(--primary)",
  colorTo = "var(--chart-2)",
  size,
  intensity,
  ...props
}: BorderBeamProps) {
  const width = size === undefined || size === 1 ? 1 : size
  const gain = intensity === undefined || intensity === 1 ? 1 : intensity
  return (
    <div
      data-slot="border-beam"
      className={cn("relative overflow-hidden rounded-xl border bg-card p-6", className)}
      {...props}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] animate-[shine-spin_linear_infinite] motion-reduce:animate-none"
        style={{
          padding: width,
          background:
            gain === 1
              ? `linear-gradient(var(--beam-angle), transparent 30%, ${colorFrom}, ${colorTo}, transparent 70%)`
              : `linear-gradient(var(--beam-angle), transparent ${50 - 20 * gain}%, ${colorFrom}, ${colorTo}, transparent ${50 + 20 * gain}%)`,
          animationDuration: `${duration}s`,
          mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          maskComposite: "exclude",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

export { BorderBeam }
