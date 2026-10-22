"use client"

// Ported from Uiverse galaxy（MIT，(c) 2023 Uiverse.io, author elijahgummer）— https://github.com/uiverse-io/galaxy/blob/main/Toggle-switches/elijahgummer_light-jellyfish-4.html

import { useControllableState } from "@/hooks/use-controllable-state"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { type ButtonHTMLAttributes } from "react"

export interface GlowLightSwitchProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

export function GlowLightSwitch({
  checked,
  defaultChecked = false,
  onCheckedChange,
  className,
  ...props
}: GlowLightSwitchProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [on, setOn] = useControllableState({
    value: checked,
    defaultValue: defaultChecked,
    onChange: onCheckedChange,
  })
  const glow = on
    ? "0 0 5px 2px color-mix(in oklab, var(--primary) 80%, white)"
    : "0 0 5px 2px color-mix(in oklab, var(--destructive) 80%, white)"

  return (
    <button
      {...props}
      aria-checked={on}
      aria-label={props["aria-label"] ?? "灯光开关"}
      className={cn(
        "relative box-border h-[50px] w-[210px] rounded-md bg-[color-mix(in_oklab,var(--background)_40%,black)] p-[3px] shadow-[inset_0_1px_1px_1px_color-mix(in_oklab,black_50%,transparent)]",
        className,
      )}
      data-reduced={prefersReducedMotion ? "true" : "false"}
      data-slot="glow-light-switch"
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
        className={cn(
          "absolute top-[3px] bottom-[3px] flex w-1/2 items-center rounded-sm bg-[color-mix(in_oklab,var(--foreground)_16%,transparent)] shadow-[inset_0_1px_0_0_color-mix(in_oklab,white_16%,transparent)]",
          on ? "left-1/2" : "left-[3px]",
          prefersReducedMotion ? "transition-none" : "transition-all duration-500",
        )}
      >
        <span className="ml-3 inline-block size-1.5 rounded-full bg-background" style={{ boxShadow: glow }} />
        <span className="absolute top-1/2 left-1/2 h-6 w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-sm bg-[color-mix(in_oklab,var(--background)_30%,black)]">
          <span className="absolute top-0 -left-[7px] h-full w-full rounded-sm bg-[color-mix(in_oklab,var(--background)_30%,black)]" />
          <span className="absolute top-0 left-[7px] h-full w-full rounded-sm bg-[color-mix(in_oklab,var(--background)_30%,black)]" />
        </span>
      </span>
    </button>
  )
}
