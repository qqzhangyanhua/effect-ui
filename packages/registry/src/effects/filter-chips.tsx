"use client"

// Ported from daisyUI（MIT，(c) 2020 Pouya Saadeghi）— https://github.com/saadeghi/daisyui/blob/main/packages/daisyui/src/components/filter.css. Modified for effect-ui.

import { useId, useState, type HTMLAttributes } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface FilterChipOption {
  value: string
  label: string
}

export interface FilterChipsProps extends HTMLAttributes<HTMLDivElement> {
  options: FilterChipOption[]
  value?: string
  onValueChange?: (value: string) => void
  name?: string
}

export function FilterChips({ options, value, onValueChange, name, className, ...props }: FilterChipsProps) {
  const reduced = usePrefersReducedMotion()
  const generated = useId()
  const group = name ?? generated
  const [uncontrolled, setUncontrolled] = useState("")
  const selected = value ?? uncontrolled

  function choose(next: string) {
    if (value === undefined) setUncontrolled(next)
    onValueChange?.(next)
  }

  return (
    <div
      {...props}
      aria-label={props["aria-label"] ?? "筛选"}
      className={cn("flex flex-wrap items-center gap-2", className)}
      data-reduced={reduced ? "true" : "false"}
      data-selected={selected ? "true" : "false"}
      data-slot="filter-chips"
      role="radiogroup"
    >
      {options.map((option) => {
        const collapsed = selected !== "" && selected !== option.value
        return (
          <label
            key={option.value}
            className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-sm"
            data-collapsed={collapsed ? "true" : "false"}
            style={{
              width: collapsed ? 0 : undefined,
              opacity: collapsed ? 0 : 1,
              scale: collapsed ? "0" : "1",
              padding: collapsed ? 0 : undefined,
              margin: collapsed ? 0 : undefined,
              overflow: "hidden",
              borderWidth: collapsed ? 0 : undefined,
              transition: reduced ? "none" : "opacity 0.3s, padding 0.3s, scale 0.2s",
            }}
          >
            <input checked={selected === option.value} className="accent-primary" name={group} type="radio" value={option.value} onChange={() => choose(option.value)} />
            {option.label}
          </label>
        )
      })}
      <button
        className="inline-flex size-8 items-center justify-center rounded-full border border-border text-base"
        data-part="reset"
        hidden={selected === ""}
        type="button"
        onClick={() => choose("")}
      >
        ×
      </button>
    </div>
  )
}
