import * as React from "react"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type InteractiveHoverButtonProps = React.ComponentProps<typeof Button>

function InteractiveHoverButton({
  className,
  children,
  variant,
  size,
  asChild = false,
  ...props
}: InteractiveHoverButtonProps) {
  const slotted =
    asChild && React.isValidElement<{ children?: React.ReactNode }>(children) ? children : null
  const content = (
    <>
      <span className="inline-flex items-center gap-2 transition-transform duration-300 group-hover:-translate-x-3 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0">
        {slotted ? slotted.props.children : children}
      </span>
      <span className="absolute right-4 size-4 translate-x-6 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 motion-reduce:translate-x-0">
        <ArrowRight className="size-4" />
      </span>
    </>
  )

  return (
    <Button
      data-slot="interactive-hover-button"
      variant={variant}
      size={size}
      asChild={asChild}
      className={cn(
        "group relative justify-start overflow-hidden rounded-full font-normal",
        variant == null && "border bg-background text-foreground hover:bg-background",
        size == null && "h-10 px-6",
        className,
      )}
      {...props}
    >
      {slotted ? React.cloneElement(slotted, {}, content) : content}
    </Button>
  )
}

export { InteractiveHoverButton }
