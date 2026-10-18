import * as React from "react"

import { cn } from "@/lib/utils"

export interface NeonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  glowColor?: string
}

function NeonButton({
  className,
  children,
  glowColor = "var(--primary)",
  ...props
}: NeonButtonProps) {
  return (
    <button
      data-slot="neon-button"
      className={cn(
        "relative inline-flex h-10 items-center justify-center rounded-md border border-[color-mix(in_oklab,var(--neon)_70%,transparent)] bg-background px-5 text-sm font-medium text-foreground shadow-[0_0_18px_-6px_var(--neon)] transition-shadow hover:shadow-[0_0_28px_-4px_var(--neon)]",
        className,
      )}
      style={{ "--neon": glowColor } as React.CSSProperties}
      {...props}
    >
      {children}
    </button>
  )
}

export { NeonButton }
