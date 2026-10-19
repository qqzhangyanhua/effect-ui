import * as React from "react"

import { cn } from "@/lib/utils"

export interface ShimmerButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  shimmerColor?: string
}

function ShimmerButton({
  className,
  children,
  shimmerColor = "color-mix(in oklab, var(--primary-foreground) 70%, transparent)",
  ...props
}: ShimmerButtonProps) {
  return (
    <button
      data-slot="shimmer-button"
      className={cn(
        "relative inline-flex h-10 items-center justify-center overflow-hidden rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -translate-x-full animate-[shimmer-sweep_2.2s_infinite] motion-reduce:animate-none bg-linear-to-r from-transparent via-white/40 to-transparent"
        style={{
          backgroundImage: `linear-gradient(90deg, transparent, ${shimmerColor}, transparent)`,
        }}
      />
      <span className="relative z-10">{children}</span>
    </button>
  )
}

export { ShimmerButton }
