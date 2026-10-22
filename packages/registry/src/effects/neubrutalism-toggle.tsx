"use client"

// Ported from SyntaxUI（MIT，(c) 2024 SyntaxUI, author Ethan Pollack）— https://github.com/SyntaxUI/syntaxui/blob/main/src/showcase/components/toggle/NeubrutalismToggle.tsx

import { useControllableState } from "@/hooks/use-controllable-state"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { type ButtonHTMLAttributes } from "react"

export interface NeubrutalismToggleProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

export function NeubrutalismToggle({
  checked,
  defaultChecked = false,
  onCheckedChange,
  className,
  ...props
}: NeubrutalismToggleProps) {
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
      aria-label={props["aria-label"] ?? "粗野开关"}
      className={cn("relative h-[25px] w-[45px] translate-x-1 translate-y-1 cursor-pointer rounded-full bg-foreground", className)}
      data-reduced={prefersReducedMotion ? "true" : "false"}
      data-slot="neubrutalism-toggle"
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
          "flex h-full w-full items-center justify-center rounded-full border-2 border-foreground p-0.5",
          on ? "translate-x-[3px] -translate-y-[3px] bg-primary" : "bg-muted",
          prefersReducedMotion ? "transition-none" : "transition-transform duration-300",
        )}
      >
        <span
          className={cn(
            "aspect-square h-full rounded-full border-2 border-foreground bg-background shadow",
            on ? "translate-x-[10px]" : "-translate-x-[10px]",
            prefersReducedMotion ? "transition-none" : "transition-transform duration-300",
          )}
        />
      </span>
    </button>
  )
}
