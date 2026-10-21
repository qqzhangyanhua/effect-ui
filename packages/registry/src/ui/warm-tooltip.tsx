"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface WarmTooltipProps {
  content: React.ReactNode
  children: React.ReactElement
  delay?: number
  side?: "top" | "right" | "bottom" | "left"
  glow?: boolean
  intensity?: number
  className?: string
  ref?: React.Ref<HTMLDivElement>
}

function WarmTooltip({
  content,
  children,
  delay = 200,
  side = "top",
  glow = false,
  intensity,
  className,
  ref,
}: WarmTooltipProps) {
  const reduced = usePrefersReducedMotion()
  const showGlow = glow && !reduced
  const glowStrength = intensity === undefined || intensity === 1 ? 1 : intensity

  return (
    // registry 的 Tooltip 根会再包一层 delayDuration=0 的 Provider，延迟要加在这一层。
    <TooltipProvider delayDuration={reduced ? 0 : delay}>
      <TooltipPrimitive.Root>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          ref={ref}
          side={side}
          data-glow={showGlow ? "true" : "false"}
          className={cn(
            reduced && "animate-none duration-0",
            showGlow && glowStrength === 1 && "shadow-[0_0_24px_color-mix(in_oklab,var(--primary)_55%,transparent)]",
            className,
          )}
          style={
            showGlow && glowStrength !== 1
              ? {
                  boxShadow: `0 0 ${24 * glowStrength}px color-mix(in oklab, var(--primary) ${Math.round(55 * glowStrength)}%, transparent)`,
                }
              : undefined
          }
        >
          {content}
        </TooltipContent>
      </TooltipPrimitive.Root>
    </TooltipProvider>
  )
}

export { WarmTooltip }
