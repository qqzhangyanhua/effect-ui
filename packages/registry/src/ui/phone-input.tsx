"use client"

import * as React from "react"
import PhoneInputPrimitive, { type Value } from "react-phone-number-input"
import flags from "react-phone-number-input/flags"
import "react-phone-number-input/style.css"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface PhoneInputProps {
  value?: Value
  onValueChange?: (value?: Value) => void
  placeholder?: string
  className?: string
  defaultCountry?: "US" | "CN" | "GB" | "JP"
  disabled?: boolean
  "aria-invalid"?: React.ComponentProps<"input">["aria-invalid"]
}

function PhoneInput({
  value,
  onValueChange,
  placeholder = "手机号",
  className,
  defaultCountry = "US",
  disabled,
  "aria-invalid": ariaInvalid,
}: PhoneInputProps) {
  return (
    <PhoneInputPrimitive
      international
      defaultCountry={defaultCountry}
      flags={flags}
      value={value}
      onChange={(next) => onValueChange?.(next)}
      placeholder={placeholder}
      disabled={disabled}
      aria-invalid={ariaInvalid}
      inputComponent={Input}
      numberInputProps={{
        className:
          "h-full w-auto flex-1 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0 aria-invalid:ring-0 dark:bg-transparent disabled:opacity-100",
      }}
      className={cn(
        "flex h-9 w-full items-center rounded-md border border-input bg-transparent px-2 text-sm shadow-xs transition-[color,box-shadow] outline-none dark:bg-input/30",
        "focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50",
        "has-aria-invalid:border-destructive has-aria-invalid:ring-destructive/20 dark:has-aria-invalid:ring-destructive/40",
        "has-disabled:pointer-events-none has-disabled:cursor-not-allowed has-disabled:opacity-50",
        "[&_.PhoneInputCountry]:mr-2 [&_.PhoneInputCountrySelect]:bg-background",
        className,
      )}
    />
  )
}

export { PhoneInput }
