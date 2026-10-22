"use client"

// Ported from SyntaxUI（MIT，(c) 2024 SyntaxUI）— https://github.com/SyntaxUI/syntaxui/blob/main/src/showcase/components/toggle/SlideToggle.tsx
// framer-motion 已改为 motion/react。

import { useControllableState } from "@/hooks/use-controllable-state"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { motion } from "motion/react"
import { type ButtonHTMLAttributes } from "react"

export interface SlideToggleProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  onLabel?: string
  offLabel?: string
}

export function SlideToggle({
  checked,
  defaultChecked = false,
  onCheckedChange,
  onLabel,
  offLabel,
  className,
  ...props
}: SlideToggleProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [on, setOn] = useControllableState({
    value: checked,
    defaultValue: defaultChecked,
    onChange: onCheckedChange,
  })
  const spring = prefersReducedMotion ? { duration: 0 } : { type: "spring" as const, bounce: 0, duration: 0.45 }

  return (
    <button
      {...props}
      aria-checked={on}
      className={cn(
        "relative inline-flex h-7 min-w-12 items-center overflow-hidden rounded-full bg-muted px-1 text-xs",
        className,
      )}
      data-reduced={prefersReducedMotion ? "true" : "false"}
      data-slot="slide-toggle"
      data-state={on ? "on" : "off"}
      onClick={(event) => {
        props.onClick?.(event)
        if (!event.defaultPrevented) setOn(!on)
      }}
      role="switch"
      type="button"
    >
      <motion.span
        animate={{ scaleX: on ? 1 : 0, opacity: on ? 1 : 0 }}
        className="absolute inset-0 origin-left rounded-full bg-primary"
        initial={false}
        transition={spring}
      />
      <motion.span
        animate={{ left: on ? "calc(100% - 1.35rem)" : "0.15rem" }}
        className="absolute z-10 size-5 rounded-full bg-background shadow"
        initial={false}
        transition={spring}
      />
      {onLabel && offLabel ? (
        <span className={cn("relative z-10 px-6 font-medium", on ? "text-primary-foreground" : "text-muted-foreground")}>
          {on ? onLabel : offLabel}
        </span>
      ) : (
        <span className="inline-block h-5 w-10" />
      )}
    </button>
  )
}
