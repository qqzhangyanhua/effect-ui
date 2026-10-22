"use client"

// Ported from prompt-kit (MIT, (c) 2025 Julien Thibeaut) — https://github.com/ibelick/prompt-kit/blob/main/components/prompt-kit/chain-of-thought.tsx. Modified for effect-ui.

import { ChevronDown, Circle } from "lucide-react"
import { Children, cloneElement, Fragment, isValidElement, type ComponentProps, type ReactElement, type ReactNode } from "react"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface ChainOfThoughtProps {
  children?: ReactNode
  className?: string
}

export interface ChainOfThoughtStepProps extends ComponentProps<typeof Collapsible> {
  isLast?: boolean
}

export interface ChainOfThoughtTriggerProps extends ComponentProps<typeof CollapsibleTrigger> {
  leftIcon?: ReactNode
  swapIconOnHover?: boolean
}

export function ChainOfThoughtItem({ children, className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("text-sm text-muted-foreground", className)} {...props}>
      {children}
    </div>
  )
}

export function ChainOfThoughtTrigger({ children, className, leftIcon, swapIconOnHover = true, ...props }: ChainOfThoughtTriggerProps) {
  const reduced = usePrefersReducedMotion()
  return (
    <CollapsibleTrigger className={cn("group flex cursor-pointer items-center justify-start gap-1 text-left text-sm text-muted-foreground hover:text-foreground", reduced && "transition-none", className)} {...props}>
      <span className="flex items-center gap-2">
        {leftIcon ? (
          <span className="relative inline-flex size-4 items-center justify-center">
            <span className={cn(!reduced && "transition-opacity", swapIconOnHover && "group-hover:opacity-0")}>{leftIcon}</span>
            {swapIconOnHover ? <ChevronDown aria-hidden className={cn("absolute size-4 opacity-0 group-hover:opacity-100 group-data-[state=open]:rotate-180", !reduced && "transition-opacity")} /> : null}
          </span>
        ) : (
          <span className="relative inline-flex size-4 items-center justify-center">
            <Circle aria-hidden className="size-2 fill-current" />
          </span>
        )}
        <span>{children}</span>
      </span>
      {leftIcon ? null : <ChevronDown aria-hidden className={cn("size-4 group-data-[state=open]:rotate-180", !reduced && "transition-transform")} />}
    </CollapsibleTrigger>
  )
}

export function ChainOfThoughtContent({ children, className, ...props }: ComponentProps<typeof CollapsibleContent>) {
  const reduced = usePrefersReducedMotion()
  return (
    <CollapsibleContent className={cn("overflow-hidden text-popover-foreground", !reduced && "data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down", className)} {...props}>
      <div className="grid grid-cols-[min-content_minmax(0,1fr)] gap-x-4">
        <div className="ml-1.75 h-full w-px bg-primary/20 group-data-[last=true]:hidden" />
        <div className="ml-1.75 h-full w-px bg-transparent group-data-[last=false]:hidden" />
        <div className="mt-2 space-y-2">{children}</div>
      </div>
    </CollapsibleContent>
  )
}

export function ChainOfThought({ children, className }: ChainOfThoughtProps) {
  const reduced = usePrefersReducedMotion()
  const items = Children.toArray(children)
  return (
    <div className={cn("space-y-0", className)} data-reduced={reduced ? "true" : "false"} data-slot="chain-of-thought">
      {items.map((child, index) => {
        if (!isValidElement(child)) return child
        return (
          <Fragment key={index}>
            {cloneElement(child as ReactElement<ChainOfThoughtStepProps>, {
              isLast: index === items.length - 1,
            })}
          </Fragment>
        )
      })}
    </div>
  )
}

export function ChainOfThoughtStep({ children, className, isLast = false, ...props }: ChainOfThoughtStepProps) {
  return (
    <Collapsible className={cn("group", className)} data-last={isLast ? "true" : "false"} {...props}>
      {children}
      <div className="flex justify-start group-data-[last=true]:hidden">
        <div className="ml-1.75 h-4 w-px bg-primary/20" />
      </div>
    </Collapsible>
  )
}
