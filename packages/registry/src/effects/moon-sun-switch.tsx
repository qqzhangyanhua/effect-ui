"use client"

// Ported from Uiverse galaxy（MIT，(c) 2023 Uiverse.io, author satyamchaudharydev）— https://github.com/uiverse-io/galaxy/blob/main/Toggle-switches/satyamchaudharydev_shy-earwig-18.html

import { useControllableState } from "@/hooks/use-controllable-state"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { type ButtonHTMLAttributes } from "react"

export interface MoonSunSwitchProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

export function MoonSunSwitch({
  checked,
  defaultChecked = false,
  onCheckedChange,
  className,
  ...props
}: MoonSunSwitchProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [on, setOn] = useControllableState({
    value: checked,
    defaultValue: defaultChecked,
    onChange: onCheckedChange,
  })

  return (
    <button
      {...props}
      aria-checked={on}
      aria-label={props["aria-label"] ?? "主题开关"}
      className={cn(
        "relative inline-flex h-[2em] w-[3.5em] items-center rounded-full text-[17px]",
        on ? "bg-foreground" : "bg-muted",
        prefersReducedMotion ? "transition-none" : "transition-colors duration-300",
        className,
      )}
      data-reduced={prefersReducedMotion ? "true" : "false"}
      data-slot="moon-sun-switch"
      data-state={on ? "on" : "off"}
      onClick={(event) => {
        props.onClick?.(event)
        if (!event.defaultPrevented) setOn(!on)
      }}
      role="switch"
      type="button"
    >
      <span
        aria-hidden
        className={cn("absolute top-1/2 size-[1.4em] -translate-y-1/2 rounded-full", prefersReducedMotion ? "transition-none" : "transition-all duration-300")}
        style={{
          left: on ? "calc(100% - 1.7em)" : "0.3em",
          background: on ? "var(--foreground)" : "linear-gradient(40deg, var(--destructive), var(--primary) 70%)",
          boxShadow: on ? "inset -3px -2px 5px -2px var(--accent), inset -10px -4px 0 0 var(--background)" : undefined,
        }}
      />
    </button>
  )
}
