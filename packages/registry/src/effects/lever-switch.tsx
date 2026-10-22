"use client"

// Ported from Uiverse galaxy（MIT，(c) 2023 Uiverse.io, author Praashoo7）— https://github.com/uiverse-io/galaxy/blob/main/Toggle-switches/Praashoo7_witty-dodo-51.html

import { useControllableState } from "@/hooks/use-controllable-state"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { type ButtonHTMLAttributes } from "react"

export interface LeverSwitchProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

export function LeverSwitch({
  checked,
  defaultChecked = false,
  onCheckedChange,
  className,
  ...props
}: LeverSwitchProps) {
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
      aria-label={props["aria-label"] ?? "杠杆开关"}
      className={cn("relative inline-block h-[3.3em] w-[1.2em] overflow-visible text-[17px]", className)}
      data-reduced={prefersReducedMotion ? "true" : "false"}
      data-slot="lever-switch"
      data-state={on ? "on" : "off"}
      onClick={(event) => {
        props.onClick?.(event)
        if (!event.defaultPrevented) setOn(!on)
      }}
      role="switch"
      type="button"
    >
      <span className={cn("absolute inset-0 rounded-[5px]", on ? "bg-primary" : "bg-muted", prefersReducedMotion ? "transition-none" : "transition-colors duration-300")} />
      <span
        aria-hidden
        className={cn(
          "absolute top-[0.2em] left-[-0.6em] h-[0.5em] w-[2.4em] rounded-[5px] bg-background shadow-md",
          prefersReducedMotion ? "transition-none" : "transition-transform duration-300",
        )}
        style={{ transform: on ? "translateY(2.3em)" : "translateY(0)" }}
      />
      <span
        aria-hidden
        className={cn(
          "absolute top-[0.5em] left-[0.55em] h-[1em] w-[2em] border-y-[0.25em] border-l-[0.4em] border-transparent border-l-background",
          prefersReducedMotion ? "transition-none" : "transition-transform duration-300",
        )}
        style={{
          transformOrigin: "25% 50%",
          transform: on
            ? "rotateZ(90deg) rotateY(180deg) translateY(0.45em) translateX(-1.4em)"
            : "translateX(-22.5%) rotate(90deg)",
        }}
      />
    </button>
  )
}
