"use client"

import { SelectPlus } from "@/components/ui/select-plus"

export interface MultiSelectOption {
  value: string
  label: string
}

export interface MultiSelectProps {
  options: MultiSelectOption[]
  value?: string[]
  onValueChange?: (value: string[]) => void
  placeholder?: string
  className?: string
}

function MultiSelect({
  options,
  value,
  onValueChange,
  placeholder = "选择多项…",
  className,
}: MultiSelectProps) {
  return (
    <SelectPlus
      mode="multiple"
      options={options}
      value={value}
      onValueChange={onValueChange}
      placeholder={placeholder}
      className={className}
    />
  )
}

export { MultiSelect }
