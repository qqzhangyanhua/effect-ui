"use client"

// Ported from Magic UI (MIT) — https://github.com/magicuidesign/magicui/blob/main/apps/www/registry/magicui/backlight.tsx

import * as React from "react"

import { cn } from "@/lib/utils"

export interface BacklightProps {
  children?: React.ReactElement
  blur?: number
  className?: string
}

function Backlight({ children, blur = 18, className }: BacklightProps) {
  const id = React.useId()
  return (
    <div data-slot="backlight" className={cn("relative inline-grid", className)}>
      <svg width="0" height="0" aria-hidden className="absolute">
        <filter id={id} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation={blur} result="blurred" />
          <feColorMatrix in="blurred" type="saturate" values="4" />
          <feComposite in="SourceGraphic" operator="over" />
        </filter>
      </svg>
      <div style={{ filter: `url(#${id})` }}>{children}</div>
    </div>
  )
}

export { Backlight }
