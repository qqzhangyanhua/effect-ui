"use client"

import * as React from "react"
import { MinusIcon } from "lucide-react"

import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

export interface CheckboxOption {
  label: React.ReactNode
  value: string
  disabled?: boolean
}

export type CheckboxOptionInput = string | CheckboxOption

export interface CheckboxPlusProps extends Omit<React.ComponentProps<typeof Checkbox>, "checked"> {
  checked?: boolean
  indeterminate?: boolean
}

export interface CheckboxPlusGroupProps {
  options: readonly CheckboxOptionInput[]
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
  disabled?: boolean
  orientation?: "horizontal" | "vertical"
  className?: string
  id?: string
  ref?: React.Ref<HTMLButtonElement>
  "aria-invalid"?: React.AriaAttributes["aria-invalid"]
  "aria-describedby"?: string
}

function normalizeOption(option: CheckboxOptionInput): CheckboxOption {
  if (typeof option === "string") return { label: option, value: option }
  return option
}

function CheckboxPlus({
  children,
  indeterminate = false,
  checked,
  className,
  id,
  ref,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
  ...props
}: CheckboxPlusProps) {
  const box = (
    <span className="relative inline-flex">
      <Checkbox
        {...props}
        ref={ref}
        id={id}
        checked={indeterminate ? "indeterminate" : checked}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
        className={cn(indeterminate && "[&_[data-slot=checkbox-indicator]]:opacity-0", className)}
      />
      {indeterminate ? <MinusIcon aria-hidden className="pointer-events-none absolute inset-0 m-auto size-3" /> : null}
    </span>
  )

  if (children == null || children === false) return box

  return (
    <label className="inline-flex items-center gap-2 text-sm leading-none">
      {box}
      {children}
    </label>
  )
}

function CheckboxPlusGroup({
  options,
  value,
  defaultValue = [],
  onValueChange,
  disabled = false,
  orientation = "horizontal",
  className,
  id,
  ref,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
}: CheckboxPlusGroupProps) {
  const items = options.map(normalizeOption)
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue)
  const selected = value ?? uncontrolled

  function toggle(optionValue: string, next: boolean | "indeterminate") {
    const picked = new Set(selected)
    if (next === true) picked.add(optionValue)
    else picked.delete(optionValue)
    const ordered = items.map((item) => item.value).filter((item) => picked.has(item))
    if (value === undefined) setUncontrolled(ordered)
    onValueChange?.(ordered)
  }

  return (
    <div
      data-orientation={orientation}
      className={cn(orientation === "vertical" ? "grid gap-2" : "flex flex-wrap items-center gap-3", className)}
    >
      {items.map((item, index) => (
        <CheckboxPlus
          key={item.value}
          checked={selected.includes(item.value)}
          disabled={disabled || item.disabled}
          onCheckedChange={(next) => toggle(item.value, next)}
          id={index === 0 ? id : undefined}
          ref={index === 0 ? ref : undefined}
          aria-invalid={ariaInvalid}
          aria-describedby={ariaDescribedBy}
        >
          {item.label}
        </CheckboxPlus>
      ))}
    </div>
  )
}

export { CheckboxPlus, CheckboxPlusGroup }
