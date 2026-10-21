"use client"

import * as React from "react"
import { motion, useMotionValueEvent, useScroll } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface FloatingNavbarProps {
  className?: string
  children?: React.ReactNode
  duration?: number
  intensity?: number
}

function FloatingNavbar({ className, children, duration, intensity }: FloatingNavbarProps) {
  const reduce = usePrefersReducedMotion()
  const { scrollY } = useScroll()
  const [hidden, setHidden] = React.useState(false)
  const seconds = duration === undefined || duration === 250 ? 0.25 : duration / 1000
  const travel = intensity === undefined || intensity === 1 ? 88 : 88 * intensity

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0
    setHidden(latest > previous && latest > 80)
  })

  return (
    <motion.nav
      data-slot="floating-navbar"
      animate={{ y: hidden ? -travel : 0, opacity: hidden ? 0 : 1 }}
      transition={{ duration: reduce ? 0 : seconds }}
      className={cn(
        "sticky top-3 z-30 mx-auto flex w-fit items-center gap-3 rounded-full border bg-background/80 px-4 py-2 shadow-sm backdrop-blur",
        className,
      )}
    >
      {children}
    </motion.nav>
  )
}

export { FloatingNavbar }
