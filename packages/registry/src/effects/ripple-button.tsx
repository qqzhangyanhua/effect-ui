"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

interface Ripple {
  id: number
  x: number
  y: number
}

export interface RippleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  rippleColor?: string
}

function RippleButton({
  className,
  children,
  rippleColor = "color-mix(in oklab, var(--primary-foreground) 45%, transparent)",
  onClick,
  ...props
}: RippleButtonProps) {
  const [ripples, setRipples] = React.useState<Ripple[]>([])

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
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
    onClick?.(event)
  }

  return (
    <button
      data-slot="ripple-button"
      className={cn(
        "relative inline-flex h-10 overflow-hidden rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
        className,
      )}
      onClick={handleClick}
      {...props}
    >
      <span className="relative z-10">{children}</span>
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
    </button>
  )
}

export { RippleButton }
