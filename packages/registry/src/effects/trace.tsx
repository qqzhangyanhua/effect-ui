"use client"

// Ported from ReUI (MIT, (c) 2025 Keenthemes Inc.) — https://github.com/keenthemes/reui/blob/main/registry/bases/radix/ui/trace.tsx

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { ChevronRight } from "lucide-react"
import { type ComponentProps, type HTMLAttributes, type ReactNode } from "react"

export type TraceStatus = "running" | "error" | "pending"

export function Trace({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex w-full min-w-0 flex-col gap-2", className)} data-slot="trace" {...props} />
}

export interface TraceLineProps extends HTMLAttributes<HTMLSpanElement> {
  status?: TraceStatus
}

export function TraceLine({ className, status, ...props }: TraceLineProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  return (
    <span
      className={cn(
        "flex w-fit max-w-full min-w-0 items-center gap-2 text-sm text-muted-foreground",
        status === "error" && "text-destructive",
        status === "pending" && "opacity-60",
        status === "running" && !prefersReducedMotion && "*:data-[slot=trace-title]:animate-pulse",
        className,
      )}
      data-reduced={prefersReducedMotion ? "true" : "false"}
      data-slot="trace-line"
      data-status={status}
      {...props}
    />
  )
}

export function TraceIcon({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      aria-hidden="true"
      className={cn("flex size-4 shrink-0 items-center justify-center [&_svg:not([class*='size-'])]:size-4", className)}
      data-slot="trace-icon"
      {...props}
    />
  )
}

export function TraceTitle({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("min-w-0 truncate", className)} data-slot="trace-title" {...props} />
}

export function TraceDescription({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn("shrink-0 text-muted-foreground/70 tabular-nums", className)} data-slot="trace-description" {...props} />
  )
}

export function TraceCollapsible({ className, ...props }: ComponentProps<typeof Collapsible>) {
  return <Collapsible className={cn("flex w-full min-w-0 flex-col", className)} data-slot="trace-collapsible" {...props} />
}

export function TraceCollapsibleTrigger({ className, children, ...props }: ComponentProps<typeof CollapsibleTrigger>) {
  return (
    <CollapsibleTrigger
      className={cn(
        "group/trace-collapsible-trigger flex w-fit max-w-full min-w-0 cursor-pointer items-center gap-1 rounded-md text-left text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
      data-slot="trace-collapsible-trigger"
      {...props}
    >
      {children}
      <TraceIcon className="transition-transform group-aria-expanded/trace-collapsible-trigger:rotate-90">
        <ChevronRight />
      </TraceIcon>
    </CollapsibleTrigger>
  )
}

export function TraceCollapsibleContent({ className, children, ...props }: ComponentProps<typeof CollapsibleContent>) {
  const prefersReducedMotion = usePrefersReducedMotion()
  return (
    <CollapsibleContent
      className={cn(!prefersReducedMotion && "overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down")}
      data-slot="trace-collapsible-content"
      {...props}
    >
      <div className={cn("mt-2 mb-1 ml-2 border-l pr-1 pl-4 leading-relaxed text-muted-foreground", className)}>{children as ReactNode}</div>
    </CollapsibleContent>
  )
}
