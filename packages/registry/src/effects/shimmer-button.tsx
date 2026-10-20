import * as React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface ShimmerButtonProps extends React.ComponentProps<typeof Button> {
  shimmerColor?: string
}

function ShimmerButton({
  className,
  children,
  shimmerColor = "color-mix(in oklab, var(--primary-foreground) 70%, transparent)",
  variant,
  size,
  asChild = false,
  ...props
}: ShimmerButtonProps) {
  const slotted =
    asChild && React.isValidElement<{ children?: React.ReactNode }>(children) ? children : null
  const content = (
    <>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -translate-x-full animate-[shimmer-sweep_2.2s_infinite] motion-reduce:animate-none bg-linear-to-r from-transparent via-white/40 to-transparent"
        style={{
          backgroundImage: `linear-gradient(90deg, transparent, ${shimmerColor}, transparent)`,
        }}
      />
      <span className="relative z-10">{slotted ? slotted.props.children : children}</span>
    </>
  )

  return (
    <Button
      data-slot="shimmer-button"
      variant={variant}
      size={size}
      asChild={asChild}
      className={cn(
        "relative overflow-hidden",
        variant == null && "shadow-sm hover:bg-primary",
        size == null && "h-10 px-5",
        className,
      )}
      {...props}
    >
      {slotted ? React.cloneElement(slotted, {}, content) : content}
    </Button>
  )
}

export { ShimmerButton }
