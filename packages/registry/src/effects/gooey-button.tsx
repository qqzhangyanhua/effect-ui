"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export type GooeyButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>

function GooeyButton({ className, children, ...props }: GooeyButtonProps) {
  const id = React.useId()

  return (
    <button
      data-slot="gooey-button"
      className={cn(
        "relative inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground",
        className,
      )}
      style={{ filter: `url(#${id})` }}
      {...props}
    >
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
      <span className="relative z-10">{children}</span>
      <span className="absolute -right-1 size-8 rounded-full bg-primary/80" />
      <span className="absolute -left-1 size-7 rounded-full bg-primary/70" />
    </button>
  )
}

export { GooeyButton }
