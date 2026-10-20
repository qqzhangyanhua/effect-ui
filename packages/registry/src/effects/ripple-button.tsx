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
}

function slotTargetOf(asChild: boolean, children: React.ReactNode) {
  if (asChild && React.isValidElement<{ children?: React.ReactNode }>(children)) return children
  return null
}

function RippleButton({
  className,
  children,
  rippleColor = "color-mix(in oklab, var(--primary-foreground) 45%, transparent)",
  variant,
  size = "lg",
  asChild = false,
  onClick,
  ...props
}: RippleButtonProps) {
  const [ripples, setRipples] = React.useState<Ripple[]>([])
  const slotTarget = slotTargetOf(asChild, children)
  const label = slotTarget ? slotTarget.props.children : children

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
    }, 650)
  }

  const body = (
    <>
      <span className="relative z-10">{label}</span>
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 animate-[ripple-expand_0.65s_ease-out] rounded-full"
          style={{
            left: ripple.x,
            top: ripple.y,
            backgroundColor: rippleColor,
          }}
        />
      ))}
    </>
  )

  return (
    <Button
      data-slot="ripple-button"
      variant={variant}
      size={size}
      asChild={slotTarget !== null}
      className={cn("relative overflow-hidden", className)}
      onClick={handleClick}
      {...props}
    >
      {slotTarget ? React.cloneElement(slotTarget, undefined, body) : body}
    </Button>
  )
}

export { RippleButton }
