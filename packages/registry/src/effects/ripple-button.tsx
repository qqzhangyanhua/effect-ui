"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Ripple {
  id: number
  x: number
  y: number
}

export interface RippleButtonProps extends React.ComponentProps<typeof Button> {
  rippleColor?: string
  /** 波纹时长，毫秒。不传或 650 仍是 0.65s。 */
  duration?: number
  /** 波纹点倍率。不传或 1 仍是 size-4。 */
  scale?: number
}

function RippleButton({
  className,
  children,
  rippleColor = "color-mix(in oklab, var(--primary-foreground) 45%, transparent)",
  duration,
  scale,
  variant,
  size,
  asChild = false,
  onClick,
  ...props
}: RippleButtonProps) {
  const [ripples, setRipples] = React.useState<Ripple[]>([])
  const slotted =
    asChild && React.isValidElement<{ children?: React.ReactNode }>(children) ? children : null
  const label = slotted ? slotted.props.children : children
  const timed = duration === undefined || duration === 650
  const ms = timed ? 650 : duration
  const dot = scale === undefined || scale === 1 ? undefined : 16 * scale

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event)
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const rect = event.currentTarget.getBoundingClientRect()
    const next: Ripple = {
      id: Date.now(),
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    }
    setRipples((current) => [...current, next])
    window.setTimeout(() => {
      setRipples((current) => current.filter((item) => item.id !== next.id))
    }, ms)
  }

  const body = (
    <>
      <span className="relative z-10">{label}</span>
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className={
            dot === undefined
              ? "pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 animate-[ripple-expand_0.65s_ease-out] rounded-full"
              : "pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 animate-[ripple-expand_0.65s_ease-out] rounded-full"
          }
          style={
            dot === undefined && timed
              ? {
                  left: ripple.x,
                  top: ripple.y,
                  backgroundColor: rippleColor,
                }
              : {
                  left: ripple.x,
                  top: ripple.y,
                  backgroundColor: rippleColor,
                  ...(dot === undefined ? {} : { width: dot, height: dot }),
                  ...(timed ? {} : { animationDuration: `${ms}ms` }),
                }
          }
        />
      ))}
    </>
  )

  return (
    <Button
      data-slot="ripple-button"
      variant={variant}
      size={size}
      asChild={slotted !== null}
      className={cn("relative overflow-hidden", size == null && "h-10 px-5", className)}
      onClick={handleClick}
      {...props}
    >
      {slotted ? React.cloneElement(slotted, undefined, body) : body}
    </Button>
  )
}

export { RippleButton }
