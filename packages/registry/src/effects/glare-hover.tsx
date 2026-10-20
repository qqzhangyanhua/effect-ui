"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface GlareHoverProps {
  className?: string
  children?: React.ReactNode
}

function GlareHover({ className, children }: GlareHoverProps) {
  const reduced = usePrefersReducedMotion()

  return (
    <div
      data-slot="glare-hover"
      className={cn(
        "group relative w-full max-w-sm overflow-hidden rounded-2xl border bg-card p-6 shadow-sm",
        className,
      )}
    >
      {children ?? (
        <div>
          <p className="text-xs tracking-[0.22em] text-muted-foreground">HOVER</p>
          <p className="mt-2 font-display text-3xl tracking-tight">对角高光扫过</p>
        </div>
      )}
      {reduced ? null : (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-[-20%] -left-1/3 w-1/2 rotate-12 bg-linear-to-r from-transparent via-white/75 to-transparent opacity-0 transition duration-700 ease-out group-hover:translate-x-[280%] group-hover:opacity-100 motion-reduce:hidden"
        />
      )}
    </div>
  )
}

export { GlareHover }
