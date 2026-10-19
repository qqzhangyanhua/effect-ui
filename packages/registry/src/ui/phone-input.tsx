"use client"

import * as React from "react"
import PhoneInputPrimitive, { type Value } from "react-phone-number-input"
import flags from "react-phone-number-input/flags"
import "react-phone-number-input/style.css"

import { cn } from "@/lib/utils"

export interface PhoneInputProps {
  value?: Value
  onValueChange?: (value?: Value) => void
  placeholder?: string
  className?: string
  defaultCountry?: "US" | "CN" | "GB" | "JP"
}

function PhoneInput({
  value,
  onValueChange,
  placeholder = "手机号",
  className,
  defaultCountry = "US",
}: PhoneInputProps) {
  return (
    <PhoneInputPrimitive
      international
      defaultCountry={defaultCountry}
      flags={flags}
      value={value}
      onChange={(next) => onValueChange?.(next)}
      placeholder={placeholder}
      className={cn(
        "flex h-9 w-full items-center rounded-md border border-input bg-transparent px-2 text-sm shadow-xs dark:bg-input/30",
        "[&_.PhoneInputInput]:h-full [&_.PhoneInputInput]:flex-1 [&_.PhoneInputInput]:bg-transparent [&_.PhoneInputInput]:outline-none",
        "[&_.PhoneInputCountry]:mr-2 [&_.PhoneInputCountrySelect]:bg-background",
        className,
      )}
    />
  )
}

export { PhoneInput }
