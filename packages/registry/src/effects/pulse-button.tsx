import * as React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type PulseButtonProps = React.ComponentProps<typeof Button> & {
  /** 脉冲时长，毫秒。不传或 2000 仍是 2s。 */
  duration?: number
  /** 光环不透明度。不传或 0.4 仍是 bg-primary/40。 */
  intensity?: number
}

function PulseButton({
  className,
  children,
  duration,
  intensity,
  variant,
  size,
  asChild = false,
  ...props
}: PulseButtonProps) {
  const slotted =
    asChild && React.isValidElement<{ children?: React.ReactNode }>(children) ? children : null
  const timed = duration === undefined || duration === 2000
  const ms = timed ? 2000 : duration
  const alpha = intensity === undefined || intensity === 0.4 ? undefined : intensity
  const content = (
    <>
      <span
        aria-hidden
        className={
          alpha === undefined
            ? "pointer-events-none absolute inset-0 -z-10 animate-[pulse-ring_2s_ease-out_infinite] motion-reduce:animate-none rounded-full bg-primary/40"
            : "pointer-events-none absolute inset-0 -z-10 animate-[pulse-ring_2s_ease-out_infinite] motion-reduce:animate-none rounded-full"
        }
        style={
          timed && alpha === undefined
            ? undefined
            : {
                ...(timed ? {} : { animationDuration: `${ms}ms` }),
                ...(alpha === undefined
                  ? {}
                  : {
                      backgroundColor: `color-mix(in oklab, var(--primary) ${Math.round(alpha * 100)}%, transparent)`,
                    }),
              }
        }
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
        "relative isolate overflow-visible rounded-full",
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
