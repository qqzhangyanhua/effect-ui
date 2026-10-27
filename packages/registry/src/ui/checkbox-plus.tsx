"use client"

import * as React from "react"
import { MinusIcon } from "lucide-react"

import { cn } from "@/lib/cn"

export interface CheckboxOption {
  label: React.ReactNode
  value: string
  disabled?: boolean
}

export type CheckboxOptionInput = string | CheckboxOption

export interface CheckboxPlusProps extends Omit<React.ComponentProps<"button">, "checked"> {
  checked?: boolean
  indeterminate?: boolean
  onCheckedChange?: (checked: boolean | "indeterminate") => void
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
  onCheckedChange,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
  ...props
}: CheckboxPlusProps) {
  const box = (
    <span className="relative inline-flex">
      <button
        {...props}
        type="button"
        role="checkbox"
        ref={ref}
        id={id}
        aria-checked={indeterminate ? "mixed" : checked ? "true" : "false"}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
        className={cn("size-4 rounded border", className)}
        onClick={(event) => {
          props.onClick?.(event)
          if (event.defaultPrevented || props.disabled) return
          onCheckedChange?.(checked ? false : true)
        }}
      >
        {indeterminate ? <MinusIcon aria-hidden className="size-3" /> : checked ? <span aria-hidden className="block size-2 bg-current" /> : null}
      </button>
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
