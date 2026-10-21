"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface AnimatedListProps {
  className?: string
  items: React.ReactNode[]
  delay?: number
  duration?: number
  gap?: number
}

function AnimatedList({ className, items, delay = 1400, duration, gap }: AnimatedListProps) {
  const reduceMotion = usePrefersReducedMotion()
  const [index, setIndex] = React.useState(0)
  const life = duration === undefined || duration === 280 ? 0.28 : duration / 1000

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
    <div
      data-slot="animated-list"
      className={cn(gap === undefined || gap === 8 ? "flex flex-col gap-2" : "flex flex-col", className)}
      style={gap === undefined || gap === 8 ? undefined : { gap }}
    >
      <AnimatePresence initial={false}>
        {visible.map((item, itemIndex) => (
          <motion.div
            key={reduceMotion ? `item-${itemIndex}` : `${itemIndex}-${index}`}
            initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.97 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
            transition={reduceMotion ? { duration: 0.15 } : { duration: life }}
          >
            {item}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export { AnimatedList }
