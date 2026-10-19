"use client"

import * as React from "react"
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react"

import { cn } from "@/lib/utils"

export interface FloatingNavbarProps {
  className?: string
  children?: React.ReactNode
}

function FloatingNavbar({ className, children }: FloatingNavbarProps) {
  const reduce = useReducedMotion() === true
  const { scrollY } = useScroll()
  const [hidden, setHidden] = React.useState(false)

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0
    setHidden(latest > previous && latest > 80)
  })

  return (
    <motion.nav
      data-slot="floating-navbar"
      animate={{ y: hidden ? -88 : 0, opacity: hidden ? 0 : 1 }}
      transition={{ duration: reduce ? 0 : 0.25 }}
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
