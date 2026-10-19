"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface AnimatedListProps {
  className?: string
  items: React.ReactNode[]
  delay?: number
}

function AnimatedList({ className, items, delay = 1400 }: AnimatedListProps) {
  const reduceMotion = usePrefersReducedMotion()
  const [index, setIndex] = React.useState(0)

  React.useEffect(() => {
    if (reduceMotion) return
    if (items.length === 0) return
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % items.length)
    }, delay)
    return () => window.clearInterval(timer)
  }, [delay, items.length, reduceMotion])

  const visible = reduceMotion ? items : items.slice(0, index + 1).reverse()

  return (
    <div data-slot="animated-list" className={cn("flex flex-col gap-2", className)}>
      <AnimatePresence initial={false}>
        {visible.map((item, itemIndex) => (
          <motion.div
            key={reduceMotion ? `item-${itemIndex}` : `${itemIndex}-${index}`}
            initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.97 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
            transition={reduceMotion ? { duration: 0.15 } : { duration: 0.28 }}
          >
            {item}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export { AnimatedList }
