"use client"

// Ported from Cult UI (MIT, (c) 2023 Jordan-Gilliam) — https://github.com/nolly-studio/cult-ui/blob/main/apps/www/registry/default/ui/shift-card.tsx. Modified for effect-ui.

import { useRef, useState, type ReactNode } from "react"
import { AnimatePresence, motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface ShiftCardProps {
  className?: string
  topContent?: ReactNode
  middleContent?: ReactNode
  topAnimateContent?: ReactNode
  bottomContent?: ReactNode
}

export function ShiftCard({ className, topContent, middleContent, topAnimateContent, bottomContent }: ShiftCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const moving = motionOn && !reduced
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      ref={ref}
      animate={moving ? { y: 0, opacity: 1 } : { y: 0, opacity: 1 }}
      className={cn(
        "group relative flex min-h-[300px] w-[280px] flex-col items-center justify-between overflow-hidden rounded-xl bg-card p-3 text-sm md:w-[300px]",
        "shadow-[0px_1px_1px_0px_rgba(0,0,0,0.05),0px_1px_1px_0px_rgba(255,252,240,0.5)_inset,0px_0px_0px_1px_hsla(0,0%,100%,0.1)_inset,0px_0px_1px_0px_rgba(28,27,26,0.5)]",
        "dark:shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset,0_0_0_1px_rgba(255,255,255,0.03)_inset,0_0_0_1px_rgba(0,0,0,0.1),0_2px_2px_0_rgba(0,0,0,0.1),0_4px_4px_0_rgba(0,0,0,0.1),0_8px_8px_0_rgba(0,0,0,0.1)]",
        className,
      )}
      data-motion={moving ? "on" : "off"}
      data-reduced={reduced ? "true" : "false"}
      data-slot="shift-card"
      data-state={hovered ? "open" : "closed"}
      initial={moving ? { y: 20, opacity: 0 } : false}
      whileHover={moving ? { scale: 1.02 } : undefined}
      onBlur={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      tabIndex={0}
    >
      <div className="relative flex h-[46px] w-full flex-col text-foreground">
        <div className="w-full">
          {topContent}
          <AnimatePresence>{hovered ? topAnimateContent : null}</AnimatePresence>
        </div>
      </div>
      <div className="pb-12">
        <AnimatePresence>{hovered ? null : middleContent}</AnimatePresence>
      </div>
      {moving ? (
        <motion.div
          animate={hovered ? { opacity: 1, height: 194 } : { opacity: 1, height: 38 }}
          className="absolute inset-x-0 -bottom-1.5 flex flex-col gap-4 overflow-hidden rounded-xl bg-card px-3"
          data-part="bottom"
          initial={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3, delay: 0.1, ease: "circIn" }}
        >
          {bottomContent}
        </motion.div>
      ) : (
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 rounded-xl bg-card px-3 py-3" data-part="bottom">
          {bottomContent}
        </div>
      )}
    </motion.div>
  )
}
