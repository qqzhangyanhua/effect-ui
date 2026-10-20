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
      numberInputProps={{ className: "w-auto flex-1" }}
      className={cn(
        "flex w-full items-center text-sm [&_.PhoneInputCountry]:mr-2 [&_.PhoneInputCountrySelect]:bg-background",
        disabled && "[&_.PhoneInputCountry]:opacity-50",
        className,
      )}
    />
  )
}

export { PhoneInput }
