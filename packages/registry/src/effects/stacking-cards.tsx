"use client"

import * as React from "react"
import { motion, useScroll, useTransform, type MotionValue } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

interface StackingCardsContextValue {
  progress: MotionValue<number>
  totalCards: number
  scaleMultiplier: number
}

const StackingCardsContext = React.createContext<StackingCardsContextValue | null>(null)

function useStackingCards() {
  const context = React.useContext(StackingCardsContext)
  if (!context) {
    throw new Error("StackingCardItem must be used within StackingCards")
  }
  return context
}

function StackingCards({
  children,
  className,
  totalCards,
  scaleMultiplier = 0.03,
}: {
  children: React.ReactNode
  className?: string
  totalCards: number
  scaleMultiplier?: number
}) {
  const targetRef = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  })

  return (
    <StackingCardsContext.Provider
      value={{ progress: scrollYProgress, totalCards, scaleMultiplier }}
    >
      <div ref={targetRef} className={cn("relative", className)}>
        {children}
      </div>
    </StackingCardsContext.Provider>
  )
}

function StackingCardItem({
  index,
  children,
  className,
}: {
  index: number
  children: React.ReactNode
  className?: string
}) {
  const reduce = usePrefersReducedMotion()
  const { progress, totalCards, scaleMultiplier } = useStackingCards()
  const scaleTo = 1 - (totalCards - index) * scaleMultiplier
  const scale = useTransform(progress, [index * (1 / totalCards), 1], [1, scaleTo])
  const top = `${8 + index * 12}px`

  if (reduce) {
    return <div className={cn("relative", className)}>{children}</div>
  }

  return (
    <div className={cn("sticky top-4 h-full", className)}>
      <motion.div className="relative origin-top" style={{ top, scale }}>
        {children}
      </motion.div>
    </div>
  )
}

export { StackingCards, StackingCardItem }
