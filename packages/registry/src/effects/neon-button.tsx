import * as React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface NeonButtonProps extends React.ComponentProps<typeof Button> {
  glowColor?: string
  /** 辉光倍率。不传或 1 仍是 18px 休息、28px 悬停。 */
  scale?: number
}

function NeonButton({
  className,
  children,
  glowColor = "var(--primary)",
  scale,
  variant,
  size,
  asChild = false,
  ...props
}: NeonButtonProps) {
  const gain = scale === undefined || scale === 1 ? undefined : scale
  return (
    <Button
      data-slot="neon-button"
      variant={variant}
      size={size}
      asChild={asChild}
      className={cn(
        "relative border border-[color-mix(in_oklab,var(--neon)_70%,transparent)] transition-shadow motion-reduce:transition-none",
        gain === undefined
          ? "shadow-[0_0_18px_-6px_var(--neon)] hover:shadow-[0_0_28px_-4px_var(--neon)]"
          : "shadow-[var(--glow-rest)] hover:shadow-[var(--glow-hover)]",
        variant == null && "bg-background text-foreground hover:bg-background",
        size == null && "h-10 px-5",
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
    </Button>
  )
}

export { NeonButton }
