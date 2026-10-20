import * as React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type PulseButtonProps = React.ComponentProps<typeof Button>

function PulseButton({
  className,
  children,
  variant,
  size,
  asChild = false,
  ...props
}: PulseButtonProps) {
  const slotted =
    asChild && React.isValidElement<{ children?: React.ReactNode }>(children) ? children : null
  const content = (
    <>
      <span
        aria-hidden
        className="absolute inset-0 -z-10 animate-[pulse-ring_2s_ease-out_infinite] motion-reduce:animate-none rounded-full bg-primary/40"
      />
      {slotted ? slotted.props.children : children}
    </>
  )

  return (
    <Button
      data-slot="pulse-button"
      variant={variant}
      size={size}
      asChild={asChild}
      className={cn(
        "relative rounded-full",
        variant == null && "hover:bg-primary",
        size == null && "h-10 px-6",
        className,
      )}
      {...props}
    >
      {slotted ? React.cloneElement(slotted, {}, content) : content}
    </Button>
  )
}

export { PulseButton }
