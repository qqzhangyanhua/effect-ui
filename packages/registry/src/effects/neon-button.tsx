import * as React from "react"

import { cn } from "@/lib/cn"

export interface NeonButtonProps extends React.ComponentProps<"button"> {
  glowColor?: string
  /** 辉光倍率。不传或 1 仍是 18px 休息、28px 悬停。 */
  scale?: number
}

function NeonButton({
  className,
  children,
  glowColor = "var(--primary)",
  scale,
  ...props
}: NeonButtonProps) {
  const gain = scale === undefined || scale === 1 ? undefined : scale
  return (
    <button
      type="button"
      data-slot="neon-button"
      className={cn(
        "relative inline-flex h-10 items-center border border-[color-mix(in_oklab,var(--neon)_70%,transparent)] bg-background px-5 text-foreground transition-shadow hover:bg-background motion-reduce:transition-none",
        gain === undefined
          ? "shadow-[0_0_18px_-6px_var(--neon)] hover:shadow-[0_0_28px_-4px_var(--neon)]"
          : "shadow-[var(--glow-rest)] hover:shadow-[var(--glow-hover)]",
        className,
      )}
      style={
        gain === undefined
          ? ({ "--neon": glowColor } as React.CSSProperties)
          : ({
              "--neon": glowColor,
              "--glow-rest": `0 0 ${18 * gain}px ${-6 * gain}px var(--neon)`,
              "--glow-hover": `0 0 ${28 * gain}px ${-4 * gain}px var(--neon)`,
            } as React.CSSProperties)
      }
      {...props}
    >
      {children}
    </button>
  )
}

export { NeonButton }
