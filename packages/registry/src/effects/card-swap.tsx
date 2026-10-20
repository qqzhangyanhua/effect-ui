"use client"

import { motion } from "motion/react"
import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface CardSwapCard {
  id: string
  kicker: string
  title: string
  tone: string
}

export interface CardSwapProps {
  className?: string
  cards?: CardSwapCard[]
  interval?: number
}

const DEFAULT_CARDS: CardSwapCard[] = [
  { id: "archive", kicker: "01", title: "Archive", tone: "bg-indigo-500" },
  { id: "signal", kicker: "02", title: "Signal", tone: "bg-sky-500" },
  { id: "field", kicker: "03", title: "Field", tone: "bg-amber-400 text-zinc-950" },
]

const POSES = [
  { x: 0, y: 0, rotate: -8, scale: 1, zIndex: 3 },
  { x: 36, y: -18, rotate: 6, scale: 0.94, zIndex: 2 },
  { x: 68, y: -34, rotate: 13, scale: 0.88, zIndex: 1 },
]

function CardSwap({ className, cards = DEFAULT_CARDS, interval = 2400 }: CardSwapProps) {
  const reduced = usePrefersReducedMotion()
  const [order, setOrder] = React.useState(() => cards.map((card) => card.id))
  const [dropping, setDropping] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (reduced) return
    const front = order[0]
    if (!front) return
    let inner = 0
    const outer = window.setTimeout(() => {
      setDropping(front)
      inner = window.setTimeout(() => {
        setOrder((current) => {
          if (current[0] !== front) return current
          return [...current.slice(1), front]
        })
        setDropping(null)
      }, 460)
    }, interval)
    return () => {
      window.clearTimeout(outer)
      window.clearTimeout(inner)
    }
  }, [reduced, interval, order])

  return (
    <div data-slot="card-swap" className={cn("relative mx-auto h-80 w-full max-w-md overflow-hidden", className)}>
      <div
        className="absolute inset-0"
        style={{ perspective: 900, transform: "rotateX(16deg) rotateZ(-7deg)", transformStyle: "preserve-3d" }}
      >
        {cards.map((card) => {
          const stackIndex = Math.max(0, order.indexOf(card.id))
          const pose = dropping === card.id ? { x: -24, y: 120, rotate: 18, scale: 0.94, zIndex: 6 } : POSES[stackIndex] ?? POSES[2]
          return (
            <motion.article
              key={card.id}
              className={cn(
                "absolute top-10 left-8 flex h-40 w-52 flex-col justify-between rounded-2xl p-4 text-white shadow-xl",
                card.tone,
              )}
              initial={false}
              animate={pose ?? POSES[0]}
              transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 240, damping: 24 }}
            >
              <span className="text-xs tracking-[0.2em] opacity-80">{card.kicker}</span>
              <span className="font-display text-3xl">{card.title}</span>
            </motion.article>
          )
        })}
      </div>
    </div>
  )
}

export { CardSwap }
