"use client"

// Ported from Uiverse galaxy（MIT，(c) 2023 Uiverse.io, author misaraadel）— https://github.com/uiverse-io/galaxy/blob/main/Toggle-switches/misaraadel_tough-termite-75.html. Modified for effect-ui.

import { useControllableState } from "@/hooks/use-controllable-state"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { type ButtonHTMLAttributes } from "react"

export interface CheckCrossSwitchProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  onColor?: string
  offColor?: string
}

const CSS = `
[data-slot="check-cross-switch"]{position:relative;display:inline-block;width:51px;height:30px;padding:0;border:0;background:transparent;cursor:pointer}
[data-slot="check-cross-switch"] .track{position:relative;display:block;width:51px;height:30px;overflow:hidden;border-radius:15px;background:var(--switch-off);transition:background .5s ease-in}
[data-slot="check-cross-switch"] .knob,[data-slot="check-cross-switch"] .knob-in{position:absolute;top:0;width:30px;height:30px;border-radius:50%;background:#fff;transition:transform .5s ease-in}
[data-slot="check-cross-switch"] .knob{right:0}
[data-slot="check-cross-switch"] .knob-in{left:0;transform:translateX(-60px)}
[data-slot="check-cross-switch"][data-state="on"] .track{background:var(--switch-on)}
[data-slot="check-cross-switch"][data-state="on"] .knob{transform:translateX(50px)}
[data-slot="check-cross-switch"][data-state="on"] .knob-in{transform:translateX(0)}
[data-slot="check-cross-switch"][data-reduced="true"] .track,[data-slot="check-cross-switch"][data-reduced="true"] .knob,[data-slot="check-cross-switch"][data-reduced="true"] .knob-in{transition:none}
`

export function CheckCrossSwitch({
  checked,
  defaultChecked = false,
  onCheckedChange,
  onColor = "var(--primary)",
  offColor = "var(--destructive)",
  className,
  ...props
}: CheckCrossSwitchProps) {
  const reduced = usePrefersReducedMotion()
  const [on, setOn] = useControllableState({ value: checked, defaultValue: defaultChecked, onChange: onCheckedChange })

  return (
    <button
      {...props}
      aria-checked={on}
      aria-label={props["aria-label"] ?? "开关"}
      className={cn(className)}
      data-reduced={reduced ? "true" : "false"}
      data-slot="check-cross-switch"
      data-state={on ? "on" : "off"}
      onClick={(event) => {
        props.onClick?.(event)
        if (!event.defaultPrevented) setOn(!on)
      }}
      role="switch"
      style={{ ["--switch-on" as string]: onColor, ["--switch-off" as string]: offColor }}
      type="button"
    >
      <style>{CSS}</style>
      <span className="track">
        <span aria-hidden className="knob" />
        <span aria-hidden className="knob-in" />
      </span>
    </button>
  )
}
