"use client"

// Copyright 2025 Tremor
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Modified by effect-ui: replaced tailwind-variants tv() with cva, and cx with cn.
// Ported from Tremor Raw（Apache-2.0，(c) 2025 Tremor）— https://github.com/tremorlabs/tremor/blob/main/src/components/Callout/Callout.tsx

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { cva } from "class-variance-authority"
import { type HTMLAttributes, type ReactNode } from "react"

export type CalloutVariant = "default" | "success" | "error" | "warning" | "neutral"

const calloutVariants = cva("flex flex-col overflow-hidden rounded-md p-4 text-sm", {
  variants: {
    variant: {
      default: "bg-primary/10 text-primary",
      success: "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300",
      error: "bg-destructive/10 text-destructive",
      warning: "bg-amber-500/10 text-amber-900 dark:text-amber-200",
      neutral: "bg-muted text-muted-foreground",
    },
  },
  defaultVariants: { variant: "default" },
})

export interface CalloutProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title: string
  icon?: ReactNode
  variant?: CalloutVariant
}

export function Callout({ title, icon, variant = "default", className, children, ...props }: CalloutProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  return (
    <div
      {...props}
      className={cn(calloutVariants({ variant }), className)}
      data-reduced={prefersReducedMotion ? "true" : "false"}
      data-slot="callout"
      data-variant={variant}
      role="note"
    >
      <div className="flex items-start">
        {icon ? <span className="mt-0.5 mr-1.5 inline-flex shrink-0">{icon}</span> : null}
        <span className="font-semibold">{title}</span>
      </div>
      {children ? <div className="mt-2 overflow-y-auto">{children}</div> : null}
    </div>
  )
}
