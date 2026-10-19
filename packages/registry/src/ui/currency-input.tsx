"use client"

import * as React from "react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface CurrencyInputProps {
  value?: number
  onValueChange?: (value: number) => void
  currency?: string
  locales?: string
  className?: string
}

function CurrencyInput({
  value = 0,
  onValueChange,
  currency = "USD",
  locales = "en-US",
  className,
}: CurrencyInputProps) {
  const [text, setText] = React.useState(String(value))
  const [prevValue, setPrevValue] = React.useState(value)
  if (value !== prevValue) {
    setPrevValue(value)
    setText(String(value))
  }

  const parsed = Number.parseFloat(text.replace(/[^\d.-]/g, ""))
  const amount = Number.isFinite(parsed) ? parsed : 0

  return (
    <div className={cn("flex max-w-xs items-center gap-2", className)}>
      <Input
        inputMode="decimal"
        value={text}
        onChange={(event) => {
          setText(event.target.value)
          const next = Number.parseFloat(event.target.value.replace(/[^\d.-]/g, ""))
          if (Number.isFinite(next)) onValueChange?.(next)
        }}
      />
      <span className="text-sm text-muted-foreground">
        {new Intl.NumberFormat(locales, { style: "currency", currency }).format(amount)}
      </span>
    </div>
  )
}

export { CurrencyInput }
