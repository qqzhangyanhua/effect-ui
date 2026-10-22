"use client"

// Ported from Uiverse galaxy（MIT，(c) 2023 Uiverse.io, author elijahgummer）— https://github.com/uiverse-io/galaxy/blob/main/Checkboxes/elijahgummer_afraid-walrus-18.html

import { useControllableState } from "@/hooks/use-controllable-state"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { type ButtonHTMLAttributes } from "react"

export interface HamburgerMorphProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export function HamburgerMorph({
  open,
  defaultOpen = false,
  onOpenChange,
  className,
  ...props
}: HamburgerMorphProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [expanded, setExpanded] = useControllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  })

  return (
    <button
      {...props}
      aria-expanded={expanded}
      aria-label={props["aria-label"] ?? "菜单"}
      className={cn("relative inline-flex h-6 w-9 items-center justify-center", className)}
      data-reduced={prefersReducedMotion ? "true" : "false"}
      data-slot="hamburger-morph"
      data-state={expanded ? "open" : "closed"}
      onClick={(event) => {
        props.onClick?.(event)
        if (!event.defaultPrevented) setExpanded(!expanded)
      }}
      type="button"
    >
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          aria-hidden
          className={cn(
            "absolute left-0 h-1 w-full rounded-full bg-foreground",
            prefersReducedMotion ? "transition-none" : "transition-transform duration-300",
            index === 0 && (expanded ? "top-2.5 -rotate-45 scale-x-75" : "top-0"),
            index === 1 && (expanded ? "top-2.5 opacity-0" : "top-2.5"),
            index === 2 && (expanded ? "top-2.5 rotate-45 scale-x-75" : "top-5"),
          )}
        />
      ))}
    </button>
  )
}
