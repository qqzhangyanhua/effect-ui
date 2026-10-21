"use client"

import * as React from "react"
import { motion, useScroll, useTransform, type MotionValue } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

interface StackingCardsContextValue {
  progress: MotionValue<number>
  totalCards: number
  scaleMultiplier: number
  gap: number
  speed: number | undefined
}

const StackingCardsContext = React.createContext<StackingCardsContextValue | null>(null)

function useStackingCards() {
  const context = React.useContext(StackingCardsContext)
  if (!context) {
    throw new Error("StackingCardItem must be used within StackingCards")
  }
  return context
}

function pace(speed: number | undefined) {
  return speed === undefined || !Number.isFinite(speed) || speed <= 0 ? 1 : speed
}

function StackingCards({
  children,
  className,
  totalCards,
  scaleMultiplier = 0.03,
  intensity,
  gap,
  speed,
}: {
  children: React.ReactNode
  className?: string
  totalCards: number
  scaleMultiplier?: number
  intensity?: number
  gap?: number
  speed?: number
}) {
  const targetRef = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  })
  const gain = intensity === undefined || intensity === 1 ? 1 : intensity
  const scaled = gain === 1 ? scaleMultiplier : scaleMultiplier * gain

  return (
    <StackingCardsContext.Provider
      value={{ progress: scrollYProgress, totalCards, scaleMultiplier: scaled, gap: gap ?? 12, speed }}
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
  const { progress, totalCards, scaleMultiplier, gap, speed } = useStackingCards()
  const rate = pace(speed)
  const shaped = useTransform(progress, (value) => (rate === 1 ? value : Math.min(1, Math.max(0, value) * rate)))
  const scaleTo = 1 - (totalCards - index) * scaleMultiplier
  const scale = useTransform(shaped, [index * (1 / totalCards), 1], [1, scaleTo])
  const top = gap === 12 ? `${8 + index * 12}px` : `${8 + index * gap}px`

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
