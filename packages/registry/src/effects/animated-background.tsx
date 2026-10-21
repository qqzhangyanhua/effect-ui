"use client"

// Ported from Motion Primitives (MIT) — https://github.com/ibelick/motion-primitives/blob/main/components/core/animated-background.tsx

import { Children, cloneElement, isValidElement, useId, useState, type ReactElement, type ReactNode } from "react"
import { AnimatePresence, motion } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface AnimatedBackgroundProps {
  children?: ReactNode
  defaultValue?: string
  value?: string
  onValueChange?: (id: string | null) => void
  enableHover?: boolean
  className?: string
}

function AnimatedBackground({ children, defaultValue, value, onValueChange, enableHover = false, className }: AnimatedBackgroundProps) {
  const reduced = usePrefersReducedMotion()
  const layoutId = useId()
  const [internal, setInternal] = useState<string | null>(defaultValue ?? null)
  const active = value !== undefined ? value : internal
  const select = (id: string | null) => {
    if (value === undefined) setInternal(id)
    onValueChange?.(id)
  }

  return (
    <div data-slot="animated-background" data-reduced={reduced ? "true" : "false"} className="inline-flex gap-1">
      {Children.map(children, (child) => {
        if (!isValidElement(child)) return child
        const element = child as ReactElement<{ "data-id"?: string; className?: string; children?: ReactNode }>
        const id = element.props["data-id"] ?? ""
        return cloneElement(
          element,
          {
            className: cn("relative inline-flex", element.props.className),
            "data-checked": active === id ? "true" : "false",
            onMouseEnter: enableHover ? () => select(id) : undefined,
            onMouseLeave: enableHover ? () => select(null) : undefined,
            onClick: enableHover ? undefined : () => select(id),
          } as never,
          <>
            <AnimatePresence initial={false}>
              {active === id ? (
                <motion.div
                  layoutId={reduced ? undefined : layoutId}
                  className={cn("absolute inset-0 rounded-lg bg-muted", className)}
                  transition={reduced ? { duration: 0 } : { type: "spring", bounce: 0.16, duration: 0.4 }}
                  initial={{ opacity: reduced ? 1 : 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              ) : null}
            </AnimatePresence>
            <span className="relative z-10">{element.props.children}</span>
          </>,
        )
      })}
    </div>
  )
}

export { AnimatedBackground }
