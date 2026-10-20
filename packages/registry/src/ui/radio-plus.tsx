"use client"

import * as React from "react"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"

export interface RadioOption {
  label: React.ReactNode
  value: string
  disabled?: boolean
}

export type RadioOptionInput = string | RadioOption

export interface RadioPlusGroupProps {
  options: readonly RadioOptionInput[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  orientation?: "horizontal" | "vertical"
  optionType?: "default" | "button"
  className?: string
  id?: string
  ref?: React.Ref<HTMLButtonElement>
  "aria-invalid"?: React.AriaAttributes["aria-invalid"]
  "aria-describedby"?: string
}

function normalizeOption(option: RadioOptionInput): RadioOption {
  if (typeof option === "string") return { label: option, value: option }
  return option
}

function RadioPlusGroup({
  options,
  value,
  defaultValue,
  onValueChange,
  disabled = false,
  orientation = "horizontal",
  optionType = "default",
  className,
  id,
  ref,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
}: RadioPlusGroupProps) {
  const items = options.map(normalizeOption)
  const buttons = optionType === "button"

  return (
    <RadioGroup
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      disabled={disabled}
      orientation={orientation}
      className={cn(
        buttons
          ? "inline-flex gap-0"
          : orientation === "vertical"
            ? "grid gap-2"
            : "flex flex-wrap items-center gap-3",
        buttons && orientation === "vertical" && "flex-col",
        className,
      )}
    >
      {items.map((item, index) => (
        <label
          key={item.value}
          className={cn(
            "inline-flex items-center gap-2 text-sm leading-none",
            buttons &&
              "relative cursor-pointer border border-input px-3 py-1.5 first:rounded-l-md last:rounded-r-md has-[[data-state=checked]]:bg-primary has-[[data-state=checked]]:text-primary-foreground has-[:focus-visible]:z-10 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
            buttons &&
              orientation === "vertical" &&
              "first:rounded-l-none first:rounded-t-md last:rounded-r-none last:rounded-b-md",
            (disabled || item.disabled) && "cursor-not-allowed opacity-50",
          )}
        >
          <RadioGroupItem
            value={item.value}
            disabled={disabled || item.disabled}
            id={index === 0 ? id : undefined}
            ref={index === 0 ? ref : undefined}
            aria-invalid={ariaInvalid}
            aria-describedby={ariaDescribedBy}
            className={buttons ? "absolute inset-0 size-auto aspect-auto h-full w-full cursor-pointer opacity-0" : undefined}
          />
          {item.label}
        </label>
      ))}
    </RadioGroup>
  )
}

export { RadioPlusGroup }
