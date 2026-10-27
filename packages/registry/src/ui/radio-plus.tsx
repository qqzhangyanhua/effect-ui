"use client"

import * as React from "react"

import { cn } from "@/lib/cn"

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
  const groupName = React.useId()
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue)
  const selected = value ?? uncontrolled

  function choose(next: string) {
    if (value === undefined) setUncontrolled(next)
    onValueChange?.(next)
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const forward = event.key === "ArrowRight" || event.key === "ArrowDown"
    const back = event.key === "ArrowLeft" || event.key === "ArrowUp"
    if (!forward && !back) return
    const enabled = items.filter((item) => !disabled && !item.disabled)
    if (enabled.length === 0) return
    event.preventDefault()
    const index = Math.max(0, enabled.findIndex((item) => item.value === selected))
    const next = enabled[(index + (forward ? 1 : -1) + enabled.length) % enabled.length]
    if (!next) return
    choose(next.value)
    event.currentTarget.querySelector<HTMLInputElement>(`input[value="${CSS.escape(next.value)}"]`)?.focus()
  }

  return (
    <div
      role="radiogroup"
      data-orientation={orientation}
      onKeyDown={onKeyDown}
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
            buttons && "relative cursor-pointer border border-input px-3 py-1.5 first:rounded-l-md last:rounded-r-md",
            buttons && selected === item.value && "bg-primary text-primary-foreground",
            buttons && orientation === "vertical" && "first:rounded-l-none first:rounded-t-md last:rounded-r-none last:rounded-b-md",
            (disabled || item.disabled) && "cursor-not-allowed opacity-50",
          )}
        >
          <input
            type="radio"
            name={groupName}
            value={item.value}
            checked={selected === item.value}
            disabled={disabled || item.disabled}
            id={index === 0 ? id : undefined}
            ref={index === 0 ? (ref as React.Ref<HTMLInputElement>) : undefined}
            aria-invalid={ariaInvalid}
            aria-describedby={ariaDescribedBy}
            className={buttons ? "sr-only" : undefined}
            onChange={() => choose(item.value)}
          />
          {item.label}
        </label>
      ))}
    </div>
  )
}

export { RadioPlusGroup }
