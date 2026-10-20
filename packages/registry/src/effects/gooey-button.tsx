"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type GooeyButtonProps = React.ComponentProps<typeof Button>

function GooeyButton({
  className,
  children,
  variant,
  size,
  asChild = false,
  style,
  ...props
}: GooeyButtonProps) {
  const id = React.useId()
  const slotted =
    asChild && React.isValidElement<{ children?: React.ReactNode }>(children) ? children : null
  const label = slotted ? slotted.props.children : children
  const body = (
    <>
      <span className="relative z-10">
        <svg width="0" height="0" className="absolute size-0">
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
        {label}
      </span>
      <span className="absolute -right-1 size-8 rounded-full bg-primary/80" />
      <span className="absolute -left-1 size-7 rounded-full bg-primary/70" />
    </>
  )

  return (
    <Button
      data-slot="gooey-button"
      variant={variant}
      size={size}
      asChild={slotted !== null}
      className={cn(
        "relative rounded-full",
        variant == null && "hover:bg-primary",
        size == null && "h-11 px-6",
        className,
      )}
      style={{ filter: `url(#${id})`, ...style }}
      {...props}
    >
      {slotted ? React.cloneElement(slotted, undefined, body) : body}
    </Button>
  )
}

export { GooeyButton }
