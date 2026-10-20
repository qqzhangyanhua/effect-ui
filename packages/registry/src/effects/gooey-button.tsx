"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type GooeyButtonProps = React.ComponentProps<typeof Button>

function slotTargetOf(asChild: boolean, children: React.ReactNode) {
  if (asChild && React.isValidElement<{ children?: React.ReactNode }>(children)) return children
  return null
}

function GooeyButton({
  className,
  children,
  variant,
  size = "lg",
  asChild = false,
  style,
  ...props
}: GooeyButtonProps) {
  const id = React.useId()
  const slotTarget = slotTargetOf(asChild, children)
  const label = slotTarget ? slotTarget.props.children : children
  const body = (
    <>
      <svg width="0" height="0" className="absolute">
        <filter id={id}>
          <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
            result="goo"
          />
          <feBlend in="SourceGraphic" in2="goo" />
        </filter>
      </svg>
      <span className="relative z-10">{label}</span>
      <span className="absolute -right-1 size-8 rounded-full bg-primary/80" />
      <span className="absolute -left-1 size-7 rounded-full bg-primary/70" />
    </>
  )

  return (
    <Button
      data-slot="gooey-button"
      variant={variant}
      size={size}
      asChild={slotTarget !== null}
      className={cn("relative rounded-full", className)}
      style={{ filter: `url(#${id})`, ...style }}
      {...props}
    >
      {slotTarget ? React.cloneElement(slotTarget, undefined, body) : body}
    </Button>
  )
}

export { GooeyButton }
