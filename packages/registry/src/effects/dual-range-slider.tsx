"use client"

// Ported from shadcn-ui-expansions (MIT, (c) 2024 shadcnui-expansions) — https://github.com/hsuanyi-chou/shadcn-ui-expansions/blob/main/components/ui/dual-range-slider.tsx

import { cn } from "@/lib/utils"

import * as SliderPrimitive from "@radix-ui/react-slider"
import { forwardRef } from "react"

export interface DualRangeSliderProps extends React.ComponentProps<typeof SliderPrimitive.Root> {
  labelPosition?: "top" | "bottom"
  label?: (value: number | undefined) => React.ReactNode
}

export const DualRangeSlider = forwardRef<React.ElementRef<typeof SliderPrimitive.Root>, DualRangeSliderProps>(
  function DualRangeSlider({ className, label, labelPosition = "top", ...props }, ref) {
    const min = props.min ?? 0
    const max = props.max ?? 100
    const current = Array.isArray(props.value)
      ? props.value
      : Array.isArray(props.defaultValue)
        ? props.defaultValue
        : [min, max]

    return (
      <SliderPrimitive.Root
        className={cn("relative flex w-full touch-none items-center select-none", className)}
        data-slot="dual-range-slider"
        ref={ref}
        {...props}
      >
        <SliderPrimitive.Track className="bg-secondary relative h-2 w-full grow overflow-hidden rounded-full">
          <SliderPrimitive.Range className="bg-primary absolute h-full" />
        </SliderPrimitive.Track>
        {current.map((value, index) => (
          <SliderPrimitive.Thumb
            className="border-primary bg-background ring-offset-background focus-visible:ring-ring relative block h-4 w-4 rounded-full border-2 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
            key={index}
          >
            {label ? (
              <span
                className={cn(
                  "absolute flex w-full justify-center",
                  labelPosition === "top" && "-top-7",
                  labelPosition === "bottom" && "top-4",
                )}
              >
                {label(value)}
              </span>
            ) : null}
          </SliderPrimitive.Thumb>
        ))}
      </SliderPrimitive.Root>
    )
  },
)
