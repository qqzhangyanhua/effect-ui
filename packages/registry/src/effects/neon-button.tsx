import * as React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface NeonButtonProps extends React.ComponentProps<typeof Button> {
  glowColor?: string
}

function NeonButton({
  className,
  children,
  glowColor = "var(--primary)",
  variant,
  size,
  asChild = false,
  ...props
}: NeonButtonProps) {
  return (
    <Button
      data-slot="neon-button"
      variant={variant}
      size={size}
      asChild={asChild}
      className={cn(
        "relative border border-[color-mix(in_oklab,var(--neon)_70%,transparent)] shadow-[0_0_18px_-6px_var(--neon)] transition-shadow hover:shadow-[0_0_28px_-4px_var(--neon)]",
        variant == null && "bg-background text-foreground hover:bg-background",
        size == null && "h-10 px-5",
        className,
      )}
      style={{ "--neon": glowColor } as React.CSSProperties}
      {...props}
    >
      {children}
    </Button>
  )
}

export { NeonButton }
