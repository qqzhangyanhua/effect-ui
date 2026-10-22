"use client"

// Ported from shadcn-ui-expansions (MIT, (c) 2024 shadcnui-expansions) — https://github.com/hsuanyi-chou/shadcn-ui-expansions/blob/main/components/ui/progress-with-value.tsx

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import * as ProgressPrimitive from "@radix-ui/react-progress"
import { forwardRef } from "react"

export interface ProgressWithValueProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  position?: "start" | "start-outside" | "follow" | "end" | "end-outside"
  label?: (value?: number | null) => React.ReactNode
  valueClassName?: string
}

export const ProgressWithValue = forwardRef<React.ElementRef<typeof ProgressPrimitive.Root>, ProgressWithValueProps>(
  function ProgressWithValue({ className, valueClassName, value, position = "end", label, ...props }, ref) {
    const prefersReducedMotion = usePrefersReducedMotion()
    const amount = value ?? 0
    const valueCommonClass = "absolute -top-0.5 left-0 hidden h-fit w-full items-center px-4"

    const progressValue = (
      <span
        className={cn(
          "hidden",
          position === "start-outside" && "text-primary block",
          position === "follow" && cn(valueCommonClass, "text-primary-foreground flex justify-end"),
          position === "start" && cn(valueCommonClass, "text-primary-foreground flex justify-start"),
          position === "end" && cn(valueCommonClass, "text-primary flex justify-end"),
          position === "end-outside" && "text-primary block",
          valueClassName,
        )}
      >
        {typeof label === "function" ? label(value) : `${amount}%`}
      </span>
    )

    return (
      <div className="flex items-center gap-2" data-reduced={prefersReducedMotion ? "true" : "false"} data-slot="progress-with-value">
        {position === "start-outside" ? progressValue : null}
        <ProgressPrimitive.Root
          className={cn("bg-secondary relative h-5 w-full overflow-hidden rounded-full", className)}
          ref={ref}
          value={value}
          {...props}
        >
          <ProgressPrimitive.Indicator
            className={cn("bg-primary h-full w-full flex-1", !prefersReducedMotion && "transition-all")}
            style={{ transform: `translateX(-${100 - amount}%)` }}
          >
            {position === "follow" ? progressValue : null}
          </ProgressPrimitive.Indicator>
          {position === "start" || position === "end" ? progressValue : null}
        </ProgressPrimitive.Root>
        {position === "end-outside" ? progressValue : null}
      </div>
    )
  },
)
