"use client"

// Ported from Motion Primitives (MIT) — https://github.com/ibelick/motion-primitives/blob/main/components/core/transition-panel.tsx

import { useState, type ReactNode } from "react"
import { AnimatePresence, motion } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface TransitionPanelProps {
  children?: ReactNode
  activeIndex: number
  direction?: "left" | "right" | "up" | "down"
  className?: string
}

function TransitionPanel({ children, activeIndex, direction = "right", className }: TransitionPanelProps) {
  const reduced = usePrefersReducedMotion()
  const [previous, setPrevious] = useState(activeIndex)
  const delta = activeIndex === previous ? 1 : activeIndex > previous ? 1 : -1
  if (activeIndex !== previous) setPrevious(activeIndex)
  const panels = Array.isArray(children) ? children : [children]
  const vertical = direction === "up" || direction === "down"
  const sign = (direction === "left" || direction === "up" ? -1 : 1) * delta
  const offset = sign * 28
  const hidden = reduced
    ? { opacity: 0 }
    : vertical
      ? { opacity: 0, y: offset, filter: "blur(6px)" }
      : { opacity: 0, x: offset, filter: "blur(6px)" }
  const shown = reduced ? { opacity: 1 } : vertical ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 1, x: 0, filter: "blur(0px)" }

  return (
    <div data-slot="transition-panel" data-reduced={reduced ? "true" : "false"} className={cn("relative w-full overflow-hidden", className)}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={activeIndex}
          initial={hidden}
          animate={shown}
          exit={hidden}
          transition={reduced ? { duration: 0.15 } : { type: "spring", bounce: 0.08, duration: 0.4 }}
        >
          {panels[activeIndex]}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export { TransitionPanel }
