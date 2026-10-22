"use client"

// Ported from Watermelon UI (MIT, (c) 2025-present Watermelon Contributors) — https://github.com/WatermelonCorp/watermellon-registry/blob/86052b8/src/components/watermelon-ui/emoji-spree-choice-chips-base.tsx

import { useRef, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"

export interface InterestItem {
  id: string
  label: string
  emoji: string
}

export interface EmojiSpreeChoiceChipsProps {
  interests: InterestItem[]
  onChange?: (selectedIds: string[]) => void
  color?: string
  duration?: number
  intensity?: number
  count?: number
  speed?: number
  className?: string
}

export function EmojiSpreeChoiceChips({
  interests,
  onChange,
  color = "var(--primary)",
  duration = 1000,
  intensity = 12,
  count = 3,
  speed = 1,
  className,
}: EmojiSpreeChoiceChipsProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const railRef = useRef<HTMLDivElement>(null)
  const serial = useRef(0)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef)
  const [selected, setSelected] = useState<string[]>([])
  const [particles, setParticles] = useState<{ id: number; emoji: string; xOffset: number; rotate: number }[]>([])
  const [panning, setPanning] = useState(false)
  const rows: InterestItem[][] = [[], [], []]
  for (let index = 0; index < interests.length; index += 1) {
    const item = interests[index]
    if (item) rows[index % 3]?.push(item)
  }
  const travel = Math.max(400, duration) / Math.max(speed, 0.1) / 1000

  const toggle = (id: string, emoji: string) => {
    const exists = selected.includes(id)
    const updated = exists ? selected.filter((item) => item !== id) : [...selected, id]
    setSelected(updated)
    onChange?.(updated)
    if (exists || !live || reduced) return
    const next: { id: number; emoji: string; xOffset: number; rotate: number }[] = []
    const amount = Math.max(1, Math.round(count))
    for (let index = 0; index < amount; index += 1) {
      serial.current += 1
      const n = serial.current
      next.push({
        id: n,
        emoji,
        xOffset: ((n % 5) - 2) * intensity * 8,
        rotate: ((n % 7) - 3) * 8,
      })
    }
    setParticles(next)
    window.setTimeout(() => setParticles([]), travel * 1000 + 200)
  }

  return (
    <div
      ref={rootRef}
      data-slot="emoji-spree-choice-chips"
      data-motion={live && !reduced ? "on" : "off"}
      className={`relative isolate flex min-h-80 w-full max-w-4xl flex-col items-center overflow-hidden py-8 motion-reduce:transition-none ${className ?? ""}`}
    >
      <div
        ref={railRef}
        className={`relative z-20 w-full cursor-grab overflow-hidden px-6 active:cursor-grabbing ${panning ? "touch-none" : "touch-pan-y"}`}
      >
        <motion.div
          drag="x"
          dragConstraints={railRef}
          onPanStart={() => setPanning(true)}
          onPanEnd={() => setPanning(false)}
          className="flex w-max flex-col gap-4 pr-12"
        >
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex w-max gap-3">
              {row.map((item) => {
                const isSelected = selected.includes(item.id)
                return (
                  <motion.button
                    key={item.id}
                    type="button"
                    aria-pressed={isSelected}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 260, damping: 18 }}
                    onClick={() => toggle(item.id, item.emoji)}
                    className="flex w-max items-center gap-2 rounded-full border px-4 py-2 text-base font-semibold whitespace-nowrap"
                    style={{
                      borderColor: isSelected ? color : "var(--border)",
                      background: isSelected ? "var(--card)" : "var(--secondary)",
                      color: "var(--foreground)",
                    }}
                  >
                    <span>{item.emoji}</span>
                    <span>{item.label}</span>
                  </motion.button>
                )
              })}
            </div>
          ))}
        </motion.div>
      </div>
      <div className="pointer-events-none absolute inset-0">
        <AnimatePresence>
          {particles.map((particle, index) => (
            <motion.div
              key={particle.id}
              initial={{ y: 0, x: 0, opacity: 0, scale: 0.6 }}
              animate={{
                y: [0, -intensity * 16, 24],
                x: [0, particle.xOffset],
                opacity: [0, 1, 0],
                scale: [0.6, 2.4, 0.6],
                rotate: [0, particle.rotate],
              }}
              transition={{ duration: travel, ease: "easeInOut", delay: index * 0.08 }}
              className="absolute bottom-16 left-1/2 text-4xl select-none motion-reduce:animate-none"
            >
              {particle.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <div className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2">
        <AnimatePresence>
          {selected.length > 0 ? (
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              className="rounded-full border border-border bg-card px-6 py-2 text-lg font-bold text-foreground shadow-lg"
            >
              {selected.length} Interests
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  )
}
