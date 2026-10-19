"use client"

import NumberFlowPrimitive, { type Format } from "@number-flow/react"

export interface NumberFlowProps {
  value: number
  locales?: Intl.LocalesArgument
  format?: Format
  prefix?: string
  suffix?: string
  className?: string
}

function NumberFlow({ value, locales, format, prefix, suffix, className }: NumberFlowProps) {
  return (
    <NumberFlowPrimitive
      value={value}
      locales={locales}
      format={format}
      prefix={prefix}
      suffix={suffix}
      className={className}
    />
  )
}

export { NumberFlow }
