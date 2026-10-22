"use client"

// Ported from Uiverse galaxy（MIT，(c) 2023 Uiverse.io, author Saiyed-Tanvir）— https://github.com/uiverse-io/galaxy/blob/main/Radio-buttons/Saiyed-Tanvir_stale-parrot-18.html

import { useControllableState } from "@/hooks/use-controllable-state"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { useId, type HTMLAttributes } from "react"

export interface Neon3dRadioOption {
  value: string
  label: string
}

export interface Neon3dRadioProps extends HTMLAttributes<HTMLDivElement> {
  options: readonly Neon3dRadioOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  color?: string
}

export function Neon3dRadio({
  options,
  value,
  defaultValue = "",
  onValueChange,
  color = "var(--primary)",
  className,
  ...props
}: Neon3dRadioProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const name = useId()
  const [current, setCurrent] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  })
  const selected = options.findIndex((option) => option.value === current)
  const count = Math.max(options.length, 1)

  return (
    <div
      {...props}
      aria-label={props["aria-label"] ?? "选项"}
      className={cn("inline-block perspective-[1000px]", className)}
      data-reduced={prefersReducedMotion ? "true" : "false"}
      data-slot="neon-3d-radio"
      role="radiogroup"
    >
      <style>{`
        [data-slot="neon-3d-radio"][data-reduced="false"]:has(label:first-child:hover) .neon-pane {
          transform: rotateY(-30deg);
        }
        [data-slot="neon-3d-radio"][data-reduced="false"]:has(label:last-child:hover) .neon-pane {
          transform: rotateY(35deg);
        }
      `}</style>
      <div
        className={cn(
          "neon-pane relative flex h-10 overflow-hidden rounded-md",
          prefersReducedMotion ? "transition-none" : "transition-transform duration-700",
        )}
        style={{
          width: count * 72,
          outline: `2px solid ${color}`,
          boxShadow: `0 0 10px color-mix(in oklab, ${color} 45%, transparent), inset 0 0 10px color-mix(in oklab, ${color} 35%, transparent)`,
        }}
      >
        {options.map((option) => {
          const active = option.value === current
          return (
            <label
              key={option.value}
              className={cn(
                "relative z-10 flex h-10 flex-1 cursor-pointer items-center justify-center text-sm font-semibold",
                active ? "text-primary-foreground" : "text-foreground",
              )}
              style={active ? undefined : { color }}
            >
              <input
                checked={active}
                className="sr-only"
                name={name}
                type="radio"
                value={option.value}
                onChange={() => setCurrent(option.value)}
              />
              {option.label}
            </label>
          )
        })}
        {selected >= 0 ? (
          <span
            aria-hidden
            className={cn("absolute inset-y-0 left-0", prefersReducedMotion ? "transition-none" : "transition-transform duration-150")}
            style={{
              width: `${100 / count}%`,
              transform: `translateX(${selected * 100}%)`,
              background: color,
              boxShadow: `0 0 10px color-mix(in oklab, ${color} 45%, transparent)`,
            }}
          />
        ) : null}
      </div>
    </div>
  )
}
