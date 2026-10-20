import * as React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type RainbowButtonProps = React.ComponentProps<typeof Button>

function RainbowButton({
  className,
  children,
  variant,
  size,
  asChild = false,
  ...props
}: RainbowButtonProps) {
  const slotted =
    asChild && React.isValidElement<{ children?: React.ReactNode }>(children) ? children : null
  const content = (
    <>
      <span
        aria-hidden
        className="absolute inset-[-2px] animate-[rainbow-spin_3s_linear_infinite] motion-reduce:animate-none bg-[conic-gradient(from_var(--shine-angle),#f43f5e,#f59e0b,#22c55e,#06b6d4,#8b5cf6,#f43f5e)]"
      />
      <span className="absolute inset-[2px] rounded-[6px] bg-zinc-950" />
      <span className="relative z-10">{slotted ? slotted.props.children : children}</span>
    </>
  )

  return (
    <Button
      data-slot="rainbow-button"
      variant={variant}
      size={size}
      asChild={asChild}
      className={cn(
        "relative overflow-hidden",
        size == null && "h-10 px-5",
        className,
      )}
      {...props}
    >
      {slotted ? React.cloneElement(slotted, {}, content) : content}
    </Button>
  )
}

export { RainbowButton }
