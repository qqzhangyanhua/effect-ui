"use client"

// Ported from Uiverse galaxy（MIT，(c) 2023 Uiverse.io, author vinodjangid07）— https://github.com/uiverse-io/galaxy/blob/main/Checkboxes/vinodjangid07_sour-rabbit-84.html. Modified for effect-ui.

import { useState, type ButtonHTMLAttributes, type CSSProperties } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface PinToggleProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color"> {
  pressed?: boolean
  defaultPressed?: boolean
  onPressedChange?: (pressed: boolean) => void
  /** 按下后的大头针颜色。不传时使用主色。 */
  color?: string
}

export function PinToggle({
  pressed,
  defaultPressed = false,
  onPressedChange,
  color = "var(--primary)",
  className,
  style,
  type = "button",
  ...props
}: PinToggleProps) {
  const reduced = usePrefersReducedMotion()
  const [uncontrolled, setUncontrolled] = useState(defaultPressed)
  const on = pressed ?? uncontrolled
  const painted = { "--pin-color": color, ...style } as CSSProperties

  return (
    <button
      {...props}
      aria-pressed={on}
      className={cn(
        "grid size-11 cursor-pointer place-items-center rounded-[10px] border-0 bg-transparent text-foreground hover:bg-[color-mix(in_oklab,var(--pin-color)_18%,transparent)]",
        reduced ? "transition-none" : "transition active:scale-90",
        className,
      )}
      data-pressed={on ? "true" : "false"}
      data-reduced={reduced ? "true" : "false"}
      data-slot="pin-toggle"
      onClick={(event) => {
        props.onClick?.(event)
        if (event.defaultPrevented) return
        const next = !on
        if (pressed === undefined) setUncontrolled(next)
        onPressedChange?.(next)
      }}
      style={painted}
      type={type}
    >
      <svg aria-hidden="true" className="h-8 w-auto rotate-35" fill="none" viewBox="0 0 75 100">
        <line stroke={on ? "var(--pin-color)" : "currentColor"} strokeWidth="12" x1="37" x2="37" y1="64" y2="100" />
        <path
          d="M16.5 36V4.5H58.5V36V53.75V54.9752L59.1862 55.9903L66.9674 67.5H8.03256L15.8138 55.9903L16.5 54.9752V53.75V36Z"
          fill={on ? "var(--pin-color)" : "transparent"}
          stroke={on ? "var(--pin-color)" : "currentColor"}
          strokeWidth="10"
        />
      </svg>
    </button>
  )
}
