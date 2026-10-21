import * as React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface ShimmerButtonProps extends React.ComponentProps<typeof Button> {
  shimmerColor?: string
  /** 扫光时长，毫秒。不传或 2200 仍是 2.2s。 */
  duration?: number
}

function ShimmerButton({
  className,
  children,
  shimmerColor = "color-mix(in oklab, var(--primary-foreground) 70%, transparent)",
  duration,
  variant,
  size,
  asChild = false,
  ...props
}: ShimmerButtonProps) {
  const slotted =
    asChild && React.isValidElement<{ children?: React.ReactNode }>(children) ? children : null
  const timed = duration === undefined || duration === 2200
  const ms = timed ? 2200 : duration
  const content = (
    <>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -translate-x-full animate-[shimmer-sweep_2.2s_infinite] motion-reduce:animate-none bg-linear-to-r from-transparent via-white/40 to-transparent"
        style={{
          backgroundImage: `linear-gradient(90deg, transparent, ${shimmerColor}, transparent)`,
          ...(timed ? {} : { animationDuration: `${ms}ms` }),
        }}
      />
      <span className="relative z-10 inline-flex items-center gap-2 whitespace-nowrap">
        {slotted ? slotted.props.children : children}
      </span>
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
