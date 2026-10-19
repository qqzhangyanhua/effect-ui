"use client"

import { Minus, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface QuantityStepperProps {
  value?: number
  onValueChange?: (value: number) => void
  min?: number
  max?: number
  step?: number
  className?: string
}

function QuantityStepper({
  value = 1,
  onValueChange,
  min = 0,
  max = 99,
  step = 1,
  className,
}: QuantityStepperProps) {
  const set = (next: number) => onValueChange?.(Math.min(max, Math.max(min, next)))

  return (
    <div className={cn("inline-flex items-center rounded-md border", className)}>
      <Button type="button" size="icon" variant="ghost" aria-label="减少" onClick={() => set(value - step)}>
        <Minus />
      </Button>
      <Input
        className="h-9 w-14 border-0 text-center shadow-none focus-visible:ring-0"
        value={value}
        onChange={(event) => {
          const next = Number.parseInt(event.target.value, 10)
          if (Number.isFinite(next)) set(next)
        }}
      />
      <Button type="button" size="icon" variant="ghost" aria-label="增加" onClick={() => set(value + step)}>
        <Plus />
      </Button>
    </div>
  )
}

export { QuantityStepper }
