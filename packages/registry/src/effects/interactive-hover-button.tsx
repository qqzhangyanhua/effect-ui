import * as React from "react"

import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type InteractiveHoverButtonProps = React.ComponentProps<typeof Button> & {
  /** 滑出时长，毫秒。不传或 300 仍是 duration-300。 */
  duration?: number
  /** 滑出距离倍率。不传或 1 仍是 12px 与 24px。 */
  scale?: number
}

function InteractiveHoverButton({
  className,
  children,
  duration,
  scale,
  variant,
  size,
  asChild = false,
  ...props
}: InteractiveHoverButtonProps) {
  const slotted =
    asChild && React.isValidElement<{ children?: React.ReactNode }>(children) ? children : null
  const timed = duration === undefined || duration === 300
  const ms = timed ? 300 : duration
  const shift = scale === undefined || scale === 1 ? undefined : 12 * scale
  const canonical = timed && shift === undefined
  const content = (
    <>
      <span
        className={
          canonical
            ? "inline-flex items-center gap-2 transition-transform duration-300 group-hover:-translate-x-3 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
            : cn(
                "inline-flex items-center gap-2 transition-transform motion-reduce:transition-none motion-reduce:group-hover:translate-x-0",
                shift === undefined ? "group-hover:-translate-x-3" : "group-hover:-translate-x-[var(--shift)]",
                timed && "duration-300",
              )
        }
        style={
          canonical
            ? undefined
            : ({
                ...(timed ? {} : { transitionDuration: `${ms}ms` }),
                ...(shift === undefined ? {} : { "--shift": `${shift}px` }),
              } as React.CSSProperties)
        }
      >
        {slotted ? slotted.props.children : children}
      </span>
      <span
        className={
          canonical
            ? "absolute right-4 size-4 translate-x-6 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 motion-reduce:translate-x-0"
            : cn(
                "absolute right-4 size-4 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100 motion-reduce:translate-x-0",
                shift === undefined ? "translate-x-6" : "translate-x-[var(--travel)]",
                timed && "duration-300",
              )
        }
        style={
          canonical
            ? undefined
            : ({
                ...(timed ? {} : { transitionDuration: `${ms}ms` }),
                ...(shift === undefined ? {} : { "--travel": `${shift * 2}px` }),
              } as React.CSSProperties)
        }
      >
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
