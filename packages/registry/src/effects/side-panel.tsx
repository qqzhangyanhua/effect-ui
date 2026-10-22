"use client"

// Ported from Cult UI (MIT, (c) 2023 Jordan-Gilliam) — https://github.com/nolly-studio/cult-ui/blob/main/apps/www/registry/default/ui/side-panel.tsx. Modified for effect-ui.

import { useEffect, useRef, useState, type ReactNode } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

const ease = [0.42, 0, 0.58, 1] as const

export interface SidePanelProps {
  panelOpen: boolean
  handlePanelOpen: () => void
  className?: string
  renderButton?: (handleToggle: () => void) => ReactNode
  children?: ReactNode
}

export function SidePanel({ panelOpen, handlePanelOpen, className, renderButton, children }: SidePanelProps) {
  const ref = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const moving = motionOn && !reduced
  const [height, setHeight] = useState(0)

  useEffect(() => {
    const node = contentRef.current
    if (!node || typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(() => setHeight(node.scrollHeight))
    observer.observe(node)
    return () => observer.disconnect()
  }, [panelOpen, children])

  return (
    <div ref={ref} className="flex w-full flex-col items-start" data-motion={moving ? "on" : "off"} data-reduced={reduced ? "true" : "false"} data-slot="side-panel" data-state={panelOpen ? "open" : "closed"}>
      <motion.div
        animate={{ width: panelOpen ? "97%" : "160px" }}
        className={cn("overflow-hidden rounded-r-[44px] bg-neutral-900 text-white md:w-[260px]", className)}
        transition={moving ? { duration: panelOpen ? 0.3 : 0.2, ease } : { duration: 0 }}
      >
        <motion.div
          animate={{ height: height > 0 ? height : "auto" }}
          className="overflow-hidden"
          transition={moving ? { type: "spring", bounce: 0.02, duration: 0.65 } : { duration: 0 }}
        >
          <div ref={contentRef}>
            <div className={cn("flex w-full items-center justify-start py-2 pl-4", panelOpen && "pr-3")}>
              {renderButton ? renderButton(handlePanelOpen) : null}
            </div>
            {panelOpen ? <div className="px-4 pb-4">{children}</div> : null}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
