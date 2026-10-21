"use client"

import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { motion } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface JellyRadioOption {
  value: string
  label: React.ReactNode
  disabled?: boolean
}

export interface JellyRadioProps {
  options: readonly JellyRadioOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  stiffness?: number
  color?: string
  intensity?: number
  className?: string
  name?: string
  ref?: React.Ref<HTMLDivElement>
  "aria-label"?: string
}

function JellyRadio({
  options,
  value,
  defaultValue,
  onValueChange,
  disabled,
  stiffness = 320,
  color,
  intensity,
  className,
  name,
  ref,
  "aria-label": ariaLabel,
}: JellyRadioProps) {
  const reduced = usePrefersReducedMotion()
  const layoutId = React.useId()
  const fill = color ? { background: color } : undefined

  return (
    <RadioGroupPrimitive.Root
      ref={ref}
      name={name}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      disabled={disabled}
      orientation="horizontal"
      aria-label={ariaLabel}
      data-slot="jelly-radio"
      className={cn("inline-flex gap-1 rounded-full bg-muted p-1", className)}
    >
      {options.map((option) => (
        <RadioGroupPrimitive.Item
          key={option.value}
          value={option.value}
          disabled={option.disabled}
          className="relative rounded-full px-3 py-1.5 text-sm text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:text-primary-foreground"
        >
          <RadioGroupPrimitive.Indicator className="absolute inset-0">
            {reduced ? (
              <span className="absolute inset-0 rounded-full bg-primary" style={fill} />
            ) : (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-full bg-primary"
                style={fill}
                transition={{
                  type: "spring",
                  stiffness,
                  damping: 14,
                  mass: intensity === undefined || intensity === 0.55 ? 0.55 : intensity,
                }}
              />
            )}
          </RadioGroupPrimitive.Indicator>
          <span className="relative z-10">{option.label}</span>
        </RadioGroupPrimitive.Item>
      ))}
    </RadioGroupPrimitive.Root>
  )
}

export { JellyRadio }
