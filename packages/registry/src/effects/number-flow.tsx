"use client"

import NumberFlowPrimitive, { type Format } from "@number-flow/react"

import { textStyle } from "@/lib/text-style"

export interface NumberFlowProps {
  value: number
  locales?: Intl.LocalesArgument
  format?: Format
  prefix?: string
  suffix?: string
  className?: string
  fontSize?: number
  fontWeight?: number
  letterSpacing?: number
  align?: "left" | "center" | "right"
}

function NumberFlow({
  value,
  locales,
  format,
  prefix,
  suffix,
  className,
  fontSize,
  fontWeight,
  letterSpacing,
  align,
}: NumberFlowProps) {
  const styled = textStyle(undefined, fontSize, fontWeight, letterSpacing, align)
  const flow = (
    <NumberFlowPrimitive
      value={value}
      locales={locales}
      format={format}
      prefix={prefix}
      suffix={suffix}
      className={className}
    />
  )
  if (styled === undefined) return flow
  return (
    <span className={className} style={styled}>
      {flow}
    </span>
  )
}

export { NumberFlow }
